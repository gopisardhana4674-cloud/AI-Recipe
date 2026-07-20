import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface Ingredient {
  name: string;
  amount: string;
  isMissing: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookTime: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  cuisine: string;
  dietaryTags: string[];
  allergens: string[];
  ingredients: Ingredient[];
  steps: string[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
  chefTip: string;
  imageUrl?: string;
  isGenerated?: boolean;
}

export interface MealPlanEntry {
  id: string;
  recipeId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  recipe: Recipe | null;
}

export interface GroceryItem {
  name: string;
  amount: string;
  checked: boolean;
  recipeId?: string;
}

interface RecipeState {
  availableIngredients: string[];
  generatedRecipes: Recipe[];
  libraryRecipes: Recipe[];
  favorites: Recipe[];
  savedRecipes: Recipe[];
  mealPlans: MealPlanEntry[];
  groceryList: GroceryItem[];
  
  // Active/Detail views
  activeRecipe: Recipe | null;
  
  // Loading & statuses
  isGenerating: boolean;
  isActionLoading: boolean;
  error: string | null;

  // Actions
  addIngredient: (name: string) => void;
  removeIngredient: (name: string) => void;
  clearIngredients: () => void;
  setAvailableIngredients: (ingredients: string[]) => void;
  
  generateRecipes: (options: {
    cuisine?: string;
    diet?: string;
    allergy?: string;
    difficulty?: string;
    servings?: number;
    maxTime?: number;
    requiredDish?: string;
  }) => Promise<void>;

  fetchRecipeDetails: (id: string) => Promise<Recipe | null>;
  
  fetchLibraryRecipes: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchSaved: () => Promise<void>;
  fetchMealPlans: () => Promise<void>;
  fetchGroceryList: () => Promise<void>;
  
  toggleFavorite: (recipe: Recipe) => Promise<void>;
  toggleSaved: (recipe: Recipe) => Promise<void>;
  saveRecipeToLibrary: (recipe: Recipe) => Promise<void>;
  
  addMealPlan: (recipeId: string, date: Date, mealType: string) => Promise<void>;
  removeMealPlan: (id: string) => Promise<void>;
  
  addGroceryItems: (items: { name: string; amount: string; recipeId?: string }[]) => Promise<void>;
  toggleGroceryItem: (index: number) => Promise<void>;
  removeGroceryItem: (index: number) => Promise<void>;
  clearGroceryList: () => Promise<void>;
  
  scanReceiptOCR: (file: File) => Promise<string[]>;
  askCookingAssistant: (messages: { role: 'user' | 'assistant'; content: string }[], recipe: Recipe) => Promise<string>;
}

// Helper to construct headers with Auth Token & Mock Auth details
function getAuthHeaders() {
  const { token, user, isMockAuth } = useAuthStore.getState();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isMockAuth && user) {
    headers['x-mock-user-id'] = user.id;
    headers['x-mock-user-email'] = user.email;
    headers['x-mock-user-name'] = user.name;
  }
  return headers;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  availableIngredients: [],
  generatedRecipes: [],
  libraryRecipes: [],
  favorites: [],
  savedRecipes: [],
  mealPlans: [],
  groceryList: [],
  activeRecipe: null,
  isGenerating: false,
  isActionLoading: false,
  error: null,

  // Ingredients Actions
  addIngredient: (name) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    const current = get().availableIngredients;
    if (!current.includes(trimmed)) {
      set({ availableIngredients: [...current, trimmed] });
    }
  },

  removeIngredient: (name) => {
    set({
      availableIngredients: get().availableIngredients.filter((i) => i !== name),
    });
  },

  clearIngredients: () => {
    set({ availableIngredients: [] });
  },

  setAvailableIngredients: (ingredients) => {
    set({ availableIngredients: ingredients.map(i => i.trim().toLowerCase()) });
  },

  // AI Recipes Generator
  generateRecipes: async (options) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await axios.post(
        '/api/recipes/generate',
        {
          ingredients: get().availableIngredients,
          ...options,
        },
        { headers: getAuthHeaders() }
      );
      set({
        generatedRecipes: response.data.recipes || [],
        isGenerating: false,
      });
    } catch (err: any) {
      set({
        isGenerating: false,
        error: err.response?.data?.error || 'Failed to generate recipes. Try again later.',
      });
    }
  },

  fetchRecipeDetails: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const res = await axios.get(`/api/recipes/details/${id}`, { headers: getAuthHeaders() });
      const recipe = res.data.recipe;
      set({ activeRecipe: recipe, isActionLoading: false });
      return recipe;
    } catch (err: any) {
      set({ isActionLoading: false, error: err.response?.data?.error || 'Failed to fetch recipe details.' });
      console.error('Fetch recipe details error:', err);
      return null;
    }
  },

  // Library & Saved Actions
  fetchLibraryRecipes: async () => {
    try {
      const res = await axios.get('/api/recipes', { headers: getAuthHeaders() });
      set({ libraryRecipes: res.data.recipes || [] });
    } catch (err) {
      console.error('Fetch library error:', err);
    }
  },

  fetchFavorites: async () => {
    try {
      const res = await axios.get('/api/recipes/favorites', { headers: getAuthHeaders() });
      set({ favorites: res.data.favorites || [] });
    } catch (err) {
      console.error('Fetch favorites error:', err);
    }
  },

  fetchSaved: async () => {
    try {
      const res = await axios.get('/api/recipes/saved', { headers: getAuthHeaders() });
      set({ savedRecipes: res.data.saved || [] });
    } catch (err) {
      console.error('Fetch saved error:', err);
    }
  },

  toggleFavorite: async (recipe) => {
    try {
      const res = await axios.post(
        `/api/recipes/favorite/${recipe.id}`,
        {},
        { headers: getAuthHeaders() }
      );
      const isFav = res.data.favorited;

      if (isFav) {
        set({ favorites: [...get().favorites, recipe] });
      } else {
        set({ favorites: get().favorites.filter((f) => f.id !== recipe.id) });
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  },

  toggleSaved: async (recipe) => {
    try {
      const res = await axios.post(
        `/api/recipes/saved/${recipe.id}`,
        {},
        { headers: getAuthHeaders() }
      );
      const isSaved = res.data.saved;

      if (isSaved) {
        set({ savedRecipes: [...get().savedRecipes, recipe] });
      } else {
        set({ savedRecipes: get().savedRecipes.filter((s) => s.id !== recipe.id) });
      }
    } catch (err) {
      console.error('Toggle saved error:', err);
    }
  },

  saveRecipeToLibrary: async (recipe) => {
    set({ isActionLoading: true });
    try {
      const res = await axios.post('/api/recipes', recipe, { headers: getAuthHeaders() });
      const savedRecipe = res.data.recipe;
      
      set({
        libraryRecipes: [savedRecipe, ...get().libraryRecipes],
        savedRecipes: [savedRecipe, ...get().savedRecipes],
        isActionLoading: false,
      });
    } catch (err) {
      set({ isActionLoading: false });
      console.error('Save to library error:', err);
    }
  },

  // Meal Plans
  fetchMealPlans: async () => {
    try {
      const res = await axios.get('/api/meals', { headers: getAuthHeaders() });
      set({ mealPlans: res.data.mealPlans || [] });
    } catch (err) {
      console.error('Fetch meal plans error:', err);
    }
  },

  addMealPlan: async (recipeId, date, mealType) => {
    try {
      const res = await axios.post(
        '/api/meals',
        { recipeId, date, mealType },
        { headers: getAuthHeaders() }
      );
      set({ mealPlans: [...get().mealPlans, res.data.mealPlan] });
    } catch (err) {
      console.error('Add meal plan error:', err);
    }
  },

  removeMealPlan: async (id) => {
    try {
      await axios.delete(`/api/meals/${id}`, { headers: getAuthHeaders() });
      set({ mealPlans: get().mealPlans.filter((mp) => mp.id !== id) });
    } catch (err) {
      console.error('Remove meal plan error:', err);
    }
  },

  // Grocery List
  fetchGroceryList: async () => {
    try {
      const res = await axios.get('/api/recipes/grocery-list', { headers: getAuthHeaders() });
      set({ groceryList: res.data.list || [] });
    } catch (err) {
      console.error('Fetch grocery list error:', err);
    }
  },

  addGroceryItems: async (items) => {
    try {
      const currentList = get().groceryList;
      const newItems = items.map((item) => {
        // Find existing to avoid duplication, otherwise create
        const idx = currentList.findIndex((i) => i.name.toLowerCase() === item.name.toLowerCase());
        if (idx > -1) return null;
        return {
          name: item.name,
          amount: item.amount,
          checked: false,
          recipeId: item.recipeId,
        };
      }).filter(Boolean) as GroceryItem[];

      const updatedList = [...currentList, ...newItems];
      await axios.post(
        '/api/recipes/grocery-list',
        { items: updatedList },
        { headers: getAuthHeaders() }
      );
      set({ groceryList: updatedList });
    } catch (err) {
      console.error('Add grocery items error:', err);
    }
  },

  toggleGroceryItem: async (index) => {
    try {
      const list = [...get().groceryList];
      list[index].checked = !list[index].checked;
      
      await axios.post(
        '/api/recipes/grocery-list',
        { items: list },
        { headers: getAuthHeaders() }
      );
      set({ groceryList: list });
    } catch (err) {
      console.error('Toggle grocery item error:', err);
    }
  },

  removeGroceryItem: async (index) => {
    try {
      const list = [...get().groceryList];
      list.splice(index, 1);
      
      await axios.post(
        '/api/recipes/grocery-list',
        { items: list },
        { headers: getAuthHeaders() }
      );
      set({ groceryList: list });
    } catch (err) {
      console.error('Remove grocery item error:', err);
    }
  },

  clearGroceryList: async () => {
    try {
      await axios.post(
        '/api/recipes/grocery-list',
        { items: [] },
        { headers: getAuthHeaders() }
      );
      set({ groceryList: [] });
    } catch (err) {
      console.error('Clear grocery list error:', err);
    }
  },

  // OCR Receipt Scan
  scanReceiptOCR: async (file) => {
    set({ isActionLoading: true });
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await axios.post('/api/recipes/scan-ocr', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      const ingredients = res.data.ingredients || [];
      // Auto merge into available ingredients
      const current = get().availableIngredients;
      const merged = Array.from(new Set([...current, ...ingredients.map((i: string) => i.toLowerCase().trim())]));
      set({ availableIngredients: merged, isActionLoading: false });
      return ingredients;
    } catch (err) {
      set({ isActionLoading: false });
      console.error('OCR scanning error:', err);
      return [];
    }
  },

  // Cooking AI Assistant Chat
  askCookingAssistant: async (messages, recipe) => {
    try {
      const res = await axios.post(
        '/api/recipes/assistant',
        { messages, recipe },
        { headers: getAuthHeaders() }
      );
      return res.data.answer;
    } catch (err) {
      console.error('AI assistant chat error:', err);
      return 'I had trouble connecting to the cooking network. Can you ask again?';
    }
  },
}));
