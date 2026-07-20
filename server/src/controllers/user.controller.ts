import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbService } from '../services/db.service';

export const userController = {
  /**
   * Syncs the authenticated Clerk or Mock user details with the PostgreSQL/JSON database.
   */
  async syncUser(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User context not found' });
      }

      // Upsert user details
      const syncedUser = await dbService.createUser(
        user.id,
        user.email,
        user.name,
        undefined // avatarUrl can be expanded if sent from client
      );

      res.status(200).json({
        message: 'User sync successful',
        user: syncedUser,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to sync user' });
    }
  },

  /**
   * Retrieves the logged-in user profile.
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await dbService.getUser(user.id);
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      res.status(200).json({ profile });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get profile' });
    }
  },
};
