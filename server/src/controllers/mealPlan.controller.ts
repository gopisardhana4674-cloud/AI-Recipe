import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbService } from '../services/db.service';

export const mealPlanController = {
  /**
   * Retrieves all meal planner entries for the user.
   */
  async getMeals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const mealPlans = await dbService.getMealPlans(userId);
      res.status(200).json({ mealPlans });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch meal plans' });
    }
  },

  /**
   * Adds a recipe to the user's meal plan calendar.
   */
  async addMeal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { recipeId, date, mealType } = req.body;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      if (!recipeId || !date || !mealType) {
        return res.status(400).json({ error: 'Please supply a recipeId, date, and mealType (BREAKFAST, LUNCH, DINNER, SNACK).' });
      }

      const mealPlan = await dbService.addMealPlan(userId, recipeId, new Date(date), mealType);
      res.status(201).json({ message: 'Recipe scheduled on meal planner successfully', mealPlan });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add meal plan' });
    }
  },

  /**
   * Deletes a scheduled meal plan entry.
   */
  async removeMeal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const deleted = await dbService.deleteMealPlan(id as string, userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Meal planner entry not found or unauthorized' });
      }

      res.status(200).json({ message: 'Meal plan entry removed successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete meal plan entry' });
    }
  },
};
