import { ConflictError, NotFoundError } from '../../shared/errors';
import { shareRepository } from './repository';

export const shareService = {
  share: async (userId: string, postId: string) => {
    const existing = await shareRepository.findByUserAndPost(userId, postId);
    if (existing) {
      throw new ConflictError('Already shared');
    }
    const share = await shareRepository.create(userId, postId);
    const count = await shareRepository.countByPost(postId);
    return { share, count };
  },

  unshare: async (userId: string, postId: string) => {
    const existing = await shareRepository.findByUserAndPost(userId, postId);
    if (!existing) {
      throw new NotFoundError('Share not found');
    }
    await shareRepository.delete(userId, postId);
    const count = await shareRepository.countByPost(postId);
    return { count };
  },

  toggle: async (userId: string, postId: string) => {
    const existing = await shareRepository.findByUserAndPost(userId, postId);
    if (existing) {
      await shareRepository.delete(userId, postId);
      const count = await shareRepository.countByPost(postId);
      return { shared: false, count };
    }
    await shareRepository.create(userId, postId);
    const count = await shareRepository.countByPost(postId);
    return { shared: true, count };
  },

  getShares: async (postId: string) => {
    const [shares, count] = await Promise.all([
      shareRepository.findByPost(postId),
      shareRepository.countByPost(postId),
    ]);
    return { shares, count };
  },
};
