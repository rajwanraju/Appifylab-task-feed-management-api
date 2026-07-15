import { LikeTarget, ReactionType } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { likeRepository } from './repository';

export const likeService = {
  toggle: async (userId: string, targetType: LikeTarget, targetId: string, reactionType?: ReactionType) => {
    const existing = await likeRepository.findByUserAndTarget(userId, targetType, targetId);
    if (existing) {
      await likeRepository.delete(userId, targetType, targetId);
      const count = await likeRepository.countByTarget(targetType, targetId);
      return { liked: false, count };
    }
    const like = await likeRepository.create({ userId, targetType, targetId, reactionType });
    const count = await likeRepository.countByTarget(targetType, targetId);
    return { liked: true, count, reactionType: like.reactionType, like };
  },

  like: async (userId: string, targetType: LikeTarget, targetId: string, reactionType?: ReactionType) => {
    const existing = await likeRepository.findByUserAndTarget(userId, targetType, targetId);
    if (existing) {
      throw new ConflictError('Already liked');
    }
    const like = await likeRepository.create({ userId, targetType, targetId, reactionType });
    const count = await likeRepository.countByTarget(targetType, targetId);
    return { like, count };
  },

  unlike: async (userId: string, targetType: LikeTarget, targetId: string) => {
    const existing = await likeRepository.findByUserAndTarget(userId, targetType, targetId);
    if (!existing) {
      throw new NotFoundError('Like not found');
    }
    await likeRepository.delete(userId, targetType, targetId);
    const count = await likeRepository.countByTarget(targetType, targetId);
    return { count };
  },

  getLikes: async (targetType: LikeTarget, targetId: string) => {
    const [likes, count] = await Promise.all([
      likeRepository.findUsersByTarget(targetType, targetId),
      likeRepository.countByTarget(targetType, targetId),
    ]);
    return { likes, count };
  },
};
