import { Response, NextFunction } from 'express';
import { savedPostService } from './service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../types';

export const savedPostController = {
  save: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await savedPostService.save(req.user!.id, req.params.id as string);
      sendSuccess(res, result, 'Post saved', 201);
    } catch (error) {
      next(error);
    }
  },

  unsave: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await savedPostService.unsave(req.user!.id, req.params.id as string);
      sendSuccess(res, result, 'Post unsaved');
    } catch (error) {
      next(error);
    }
  },

  getSaved: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await savedPostService.getSaved(req.user!.id, cursor, limit);
      sendSuccess(res, result, 'Saved posts retrieved');
    } catch (error) {
      next(error);
    }
  },

  toggle: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await savedPostService.toggle(req.user!.id, req.params.id as string);
      sendSuccess(res, result, result.saved ? 'Post saved' : 'Post unsaved');
    } catch (error) {
      next(error);
    }
  },
};
