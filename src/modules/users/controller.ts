import { Response, NextFunction } from 'express';
import { userService } from './service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../types';

export const userController = {
  getProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.getById(req.user!.id);
      sendSuccess(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.update(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  },
};
