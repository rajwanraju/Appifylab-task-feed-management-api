import { Response, NextFunction } from 'express';
import { commentService } from './service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../types';

export const commentController = {
  getByPostId: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await commentService.getByPostId(req.params.id as string, req.user!.id);
      sendSuccess(res, comments, 'Comments retrieved');
    } catch (error) {
      next(error);
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await commentService.create(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, comment, 'Comment created', 201);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await commentService.update(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, comment, 'Comment updated');
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await commentService.delete(req.params.id as string, req.user!.id);
      sendSuccess(res, null, 'Comment deleted');
    } catch (error) {
      next(error);
    }
  },
};
