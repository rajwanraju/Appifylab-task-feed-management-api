import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { replyRepository } from './repository';
import { CreateReplyInput, UpdateReplyInput } from './types';
import { prisma } from '../../shared/prisma';

async function enrichReplies(replies: any[], currentUserId: string) {
  if (!replies || replies.length === 0) return [];
  const replyIds = replies.map((r: any) => r.id);

  const likes = await prisma.like.findMany({
    where: { targetType: 'REPLY', targetId: { in: replyIds } },
    select: { targetId: true, userId: true },
  });

  return replies.map((reply: any) => {
    const replyLikes = likes.filter((l) => l.targetId === reply.id);
    return {
      id: reply.id,
      content: reply.content,
      userId: reply.userId,
      commentId: reply.commentId,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      user: {
        id: reply.user.id,
        firstName: reply.user.firstName,
        lastName: reply.user.lastName,
        avatar: reply.user.avatar,
      },
      stats: {
        likesCount: replyLikes.length,
      },
      isLiked: replyLikes.some((l) => l.userId === currentUserId),
    };
  });
}

export const replyService = {
  getByCommentId: async (commentId: string, currentUserId: string) => {
    const replies = await replyRepository.findByCommentId(commentId);
    return enrichReplies(replies, currentUserId);
  },

  create: async (commentId: string, userId: string, input: CreateReplyInput) => {
    const reply = await replyRepository.create({ commentId, userId, content: input.content });
    const enriched = await enrichReplies([reply], userId);
    return enriched[0];
  },

  update: async (replyId: string, userId: string, input: UpdateReplyInput) => {
    const reply = await replyRepository.findById(replyId);
    if (!reply) {
      throw new NotFoundError('Reply not found');
    }
    if (reply.userId !== userId) {
      throw new ForbiddenError('You can only edit your own replies');
    }
    const updated = await replyRepository.update(replyId, input);
    const enriched = await enrichReplies([updated], userId);
    return enriched[0];
  },

  delete: async (replyId: string, userId: string) => {
    const reply = await replyRepository.findById(replyId);
    if (!reply) {
      throw new NotFoundError('Reply not found');
    }
    if (reply.userId !== userId) {
      throw new ForbiddenError('You can only delete your own replies');
    }
    await replyRepository.delete(replyId);
  },

  verifyOwnership: async (replyId: string, userId: string): Promise<boolean> => {
    const reply = await replyRepository.findById(replyId);
    return reply !== null && reply.userId === userId;
  },
};
