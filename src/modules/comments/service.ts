import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { commentRepository } from './repository';
import { CreateCommentInput, UpdateCommentInput } from './types';
import { prisma } from '../../shared/prisma';

async function enrichComments(comments: any[], currentUserId: string) {
  if (!comments || comments.length === 0) return [];
  const commentIds = comments.map((c: any) => c.id);

  const [likesData, replies] = await Promise.all([
    prisma.like.findMany({
      where: { targetType: 'COMMENT', targetId: { in: commentIds } },
      select: { targetId: true, userId: true },
    }),
    prisma.reply.findMany({
      where: { commentId: { in: commentIds } },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    }),
  ]);

  const replyIds = replies.map((r) => r.id);
  const replyLikes = await prisma.like.findMany({
    where: { targetType: 'REPLY', targetId: { in: replyIds } },
    select: { targetId: true, userId: true },
  });

  return comments.map((comment: any) => {
    const commentLikes = likesData.filter((l) => l.targetId === comment.id);
    const commentReplies = replies.filter((r) => r.commentId === comment.id);

    const repliesEnriched = commentReplies.map((reply) => {
      const rLikes = replyLikes.filter((l) => l.targetId === reply.id);
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
          likesCount: rLikes.length,
        },
        isLiked: rLikes.some((l) => l.userId === currentUserId),
      };
    });

    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      postId: comment.postId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        avatar: comment.user.avatar,
      },
      stats: {
        likesCount: commentLikes.length,
        repliesCount: comment._count?.replies ?? commentReplies.length,
      },
      isLiked: commentLikes.some((l) => l.userId === currentUserId),
      replies: repliesEnriched,
    };
  });
}

export const commentService = {
  getByPostId: async (postId: string, currentUserId: string) => {
    const comments = await commentRepository.findByPostId(postId);
    return enrichComments(comments, currentUserId);
  },

  create: async (postId: string, userId: string, input: CreateCommentInput) => {
    const comment = await commentRepository.create({ postId, userId, content: input.content });
    const enriched = await enrichComments([comment], userId);
    return enriched[0];
  },

  update: async (commentId: string, userId: string, input: UpdateCommentInput) => {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }
    const updated = await commentRepository.update(commentId, input);
    const enriched = await enrichComments([updated], userId);
    return enriched[0];
  },

  delete: async (commentId: string, userId: string) => {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }
    await commentRepository.delete(commentId);
  },

  verifyOwnership: async (commentId: string, userId: string): Promise<boolean> => {
    const comment = await commentRepository.findById(commentId);
    return comment !== null && comment.userId === userId;
  },
};
