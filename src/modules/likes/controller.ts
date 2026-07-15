import { LikeTarget, ReactionType } from '@prisma/client';
import { Response, NextFunction } from 'express';
import { likeService } from './service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../types';

export const likeController = {
  like:
    (targetType: LikeTarget) =>
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const reactionType = req.body?.reactionType as ReactionType | undefined;
        const result = await likeService.like(req.user!.id, targetType, req.params.id as string, reactionType);
        sendSuccess(res, result, 'Liked successfully', 201);
      } catch (error) {
        next(error);
      }
    },

  unlike:
    (targetType: LikeTarget) =>
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await likeService.unlike(req.user!.id, targetType, req.params.id as string);
        sendSuccess(res, result, 'Unliked successfully');
      } catch (error) {
        next(error);
      }
    },

  getLikes:
    (targetType: LikeTarget) =>
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await likeService.getLikes(targetType, req.params.id as string);
        sendSuccess(res, result, 'Likes retrieved');
      } catch (error) {
        next(error);
      }
    },

  toggle:
    (targetType: LikeTarget) =>
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const reactionType = req.body?.reactionType as ReactionType | undefined;
        const result = await likeService.toggle(req.user!.id, targetType, req.params.id as string, reactionType);
        sendSuccess(res, result, result.liked ? 'Liked' : 'Unliked');
      } catch (error) {
        next(error);
      }
    },
};
