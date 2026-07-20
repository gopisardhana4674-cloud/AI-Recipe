import { Router } from 'express';
import multer from 'multer';
import { recipeController } from '../controllers/recipe.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { aiLimiter, apiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// AI Generation routes with strict limits
router.post('/generate', requireAuth as any, aiLimiter, recipeController.generate as any);
router.post('/assistant', requireAuth as any, aiLimiter, recipeController.chatAssistant as any);
router.post('/scan-ocr', requireAuth as any, upload.single('image'), recipeController.scanOCR as any);

// Standard library CRUD & collections
router.get('/', requireAuth as any, apiLimiter, recipeController.list as any);
router.post('/', requireAuth as any, apiLimiter, recipeController.saveRecipe as any);
router.get('/details/:id', requireAuth as any, apiLimiter, recipeController.getDetails as any);

router.post('/favorite/:recipeId', requireAuth as any, recipeController.toggleFavorite as any);
router.get('/favorites', requireAuth as any, recipeController.getFavorites as any);

router.post('/saved/:recipeId', requireAuth as any, recipeController.toggleSaved as any);
router.get('/saved', requireAuth as any, recipeController.getSavedRecipes as any);

// Grocery list routes
router.get('/grocery-list', requireAuth as any, recipeController.getGroceryList as any);
router.post('/grocery-list', requireAuth as any, recipeController.saveGroceryList as any);

export default router;
