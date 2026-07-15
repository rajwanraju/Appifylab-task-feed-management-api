import { Response, NextFunction } from 'express';
import { shareService } from './service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../types';

export const shareController = {
  share: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await shareService.share(req.user!.id, req.params.id as string);
      sendSuccess(res, result, 'Post shared', 201);
    } catch (error) {
      next(error);
    }
  },

  unshare: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await shareService.unshare(req.user!.id, req.params.id as string);
      sendSuccess(res, result, 'Share removed');
    } catch (error) {
      next(error);
    }
  },

  getShares: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await shareService.getShares(req.params.id as string);
      sendSuccess(res, result, 'Shares retrieved');
    } catch (error) {
      next(error);
    }
  },

  toggle: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await shareService.toggle(req.user!.id, req.params.id as string);
      sendSuccess(res, result, result.shared ? 'Post shared' : 'Share removed');
    } catch (error) {
      next(error);
    }
  },
};
