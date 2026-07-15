import { ConflictError, NotFoundError } from '../../shared/errors';
import { savedPostRepository } from './repository';

export const savedPostService = {
  save: async (userId: string, postId: string) => {
    const existing = await savedPostRepository.findByUserAndPost(userId, postId);
    if (existing) {
      throw new ConflictError('Already saved');
    }
    const saved = await savedPostRepository.create(userId, postId);
    return { saved };
  },

  unsave: async (userId: string, postId: string) => {
    const existing = await savedPostRepository.findByUserAndPost(userId, postId);
    if (!existing) {
      throw new NotFoundError('Saved post not found');
    }
    await savedPostRepository.delete(userId, postId);
    return {};
  },

  toggle: async (userId: string, postId: string) => {
    const existing = await savedPostRepository.findByUserAndPost(userId, postId);
    if (existing) {
      await savedPostRepository.delete(userId, postId);
      return { saved: false };
    }
    await savedPostRepository.create(userId, postId);
    return { saved: true };
  },

  getSaved: async (userId: string, cursor?: string, limit: number = 20) => {
    return savedPostRepository.findByUser(userId, cursor, limit);
  },
};
