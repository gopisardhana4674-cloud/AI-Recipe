import { Router } from 'express';
import { mealPlanController } from '../controllers/mealPlan.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Secure meal planning schedule endpoints
router.get('/', requireAuth as any, mealPlanController.getMeals as any);
router.post('/', requireAuth as any, mealPlanController.addMeal as any);
router.delete('/:id', requireAuth as any, mealPlanController.removeMeal as any);

export default router;
