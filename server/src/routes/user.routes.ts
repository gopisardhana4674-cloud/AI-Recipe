import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Secure user sync & profile routes
router.post('/sync', requireAuth as any, userController.syncUser as any);
router.get('/profile', requireAuth as any, userController.getProfile as any);

export default router;
