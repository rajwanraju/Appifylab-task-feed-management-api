import { Response, NextFunction } from 'express';
import { replyService } from './service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../types';

export const replyController = {
  getByCommentId: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const replies = await replyService.getByCommentId(req.params.id as string, req.user!.id);
      sendSuccess(res, replies, 'Replies retrieved');
    } catch (error) {
      next(error);
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reply = await replyService.create(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, reply, 'Reply created', 201);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reply = await replyService.update(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, reply, 'Reply updated');
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await replyService.delete(req.params.id as string, req.user!.id);
      sendSuccess(res, null, 'Reply deleted');
    } catch (error) {
      next(error);
    }
  },
};
