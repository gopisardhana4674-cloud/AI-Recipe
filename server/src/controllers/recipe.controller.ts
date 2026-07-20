import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbService } from '../services/db.service';
import { geminiService, RecipeAIResponse } from '../services/gemini.service';
import { cloudinaryService } from '../services/cloudinary.service';

export const recipeController = {
  /**
   * AI Generates 3 recipes using available ingredients and filters.
   */
  async generate(req: AuthRequest, res: Response) {
    try {
      const { ingredients, cuisine, diet, allergy, difficulty, servings, maxTime, requiredDish } = req.body;

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Please enter at least one available ingredient.' });
      }

      // Generate recipes using Gemini Service (enforces JSON, validates output, heals schema)
      const rawRecipes = await geminiService.generateRecipes(ingredients, {
        cuisine,
        diet,
        allergy,
        difficulty,
        servings: servings ? Number(servings) : undefined,
        maxTime: maxTime ? Number(maxTime) : undefined,
        requiredDish: requiredDish ? String(requiredDish) : undefined,
      });

      // Upload thematic images (or fetch Unsplash matches)
      const enrichedRecipes = await Promise.all(
        rawRecipes.map(async (recipe: RecipeAIResponse) => {
          const imageUrl = await cloudinaryService.uploadImage('', recipe.title);
          return {
            ...recipe,
            imageUrl,
          };
        })
      );

      res.status(200).json({ recipes: enrichedRecipes });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate recipes' });
    }
  },

  /**
   * Retrieves all user recipes (or public templates).
   */
  async list(req: AuthRequest, res: Response) {
    try {
      const { cuisine, difficulty, query } = req.query;
      const userId = req.user?.id;

      const recipes = await dbService.getRecipes({
        cuisine: cuisine as string,
        difficulty: difficulty as string,
        query: query as string,
        userId,
      });

      res.status(200).json({ recipes });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to list recipes' });
    }
  },

  /**
   * Retrieves a specific recipe.
   */
  async getDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const recipe = await dbService.getRecipe(id as string);

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      res.status(200).json({ recipe });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve recipe details' });
    }
  },

  /**
   * Saves a generated recipe to the user's personal recipe library.
   */
  async saveRecipe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const recipeData = req.body;
      const newRecipe = await dbService.createRecipe({
        ...recipeData,
        authorId: userId,
        isGenerated: true,
      });

      // Automatically bookmarks it into SavedRecipes
      await dbService.toggleSaved(userId, newRecipe.id);

      res.status(201).json({ message: 'Recipe saved to library successfully', recipe: newRecipe });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save recipe' });
    }
  },

  /**
   * Favorites or unfavorites a recipe.
   */
  async toggleFavorite(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { recipeId } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await dbService.toggleFavorite(userId, recipeId as string);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to toggle favorite' });
    }
  },

  /**
   * Bookmarks or unsaves a recipe.
   */
  async toggleSaved(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { recipeId } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await dbService.toggleSaved(userId, recipeId as string);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to toggle saved bookmark' });
    }
  },

  /**
   * Retrieves user favorites.
   */
  async getFavorites(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const favorites = await dbService.getFavorites(userId);
      res.status(200).json({ favorites });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get favorites' });
    }
  },

  /**
   * Retrieves saved/bookmarked recipes.
   */
  async getSavedRecipes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const saved = await dbService.getSaved(userId);
      res.status(200).json({ saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get saved recipes' });
    }
  },

  /**
   * Scan image using Gemini OCR to extract list of ingredients.
   */
  async scanOCR(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
      }

      const base64Image = req.file.buffer.toString('base64');
      const ingredients = await geminiService.scanOCR(base64Image);

      res.status(200).json({ ingredients });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to scan image ingredients' });
    }
  },

  /**
   * AI Chat Cooking Assistant query context handler.
   */
  async chatAssistant(req: AuthRequest, res: Response) {
    try {
      const { messages, recipe } = req.body;
      if (!messages || !Array.isArray(messages) || !recipe) {
        return res.status(400).json({ error: 'Invalid assistant parameters' });
      }

      const answer = await geminiService.chatAssistant(messages, recipe);
      res.status(200).json({ answer });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to process kitchen query' });
    }
  },

  /**
   * Gets grocery list.
   */
  async getGroceryList(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const list = await dbService.getGroceryList(userId);
      res.status(200).json({ list: list ? list.items : [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get grocery list' });
    }
  },

  /**
   * Saves/Updates grocery list.
   */
  async saveGroceryList(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { items } = req.body;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const updated = await dbService.saveGroceryList(userId, items);
      res.status(200).json({ list: updated.items });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save grocery list' });
    }
  },
};
