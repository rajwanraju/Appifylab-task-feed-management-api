import { Visibility } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../../shared/errors';
import { postRepository } from './repository';
import { CreatePostInput, UpdatePostInput, PostResponse } from './types';
import { prisma } from '../../shared/prisma';

function mapPost(
  post: any,
  currentUserId: string,
  topReactions: any[],
  likesCount: number,
  comments: any[],
): PostResponse {
  const isLiked = post.likes && post.likes.length > 0;
  const isSaved = post.savedBy && post.savedBy.length > 0;

  return {
    id: post.id,
    content: post.content,
    image: post.image,
    visibility: post.visibility,
    userId: post.userId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    user: {
      id: post.user.id,
      firstName: post.user.firstName,
      lastName: post.user.lastName,
      avatar: post.user.avatar,
    },
    stats: {
      likesCount,
      commentsCount: post._count?.comments ?? 0,
      sharesCount: post.sharesCount ?? 0,
    },
    topReactions,
    isLiked,
    isSaved,
    comments,
  };
}

async function enrichComments(comments: any[], currentUserId: string) {
  if (!comments || comments.length === 0) return [];
  const commentIds = comments.map((c: any) => c.id);

  const [likesMap, repliesMap, replyLikesMap] = await Promise.all([
    getLikesMap('COMMENT', commentIds, currentUserId),
    getRepliesForComments(commentIds, currentUserId),
    getReplyLikesMap(commentIds, currentUserId),
  ]);

  return comments.map((comment: any) => {
    const commentLikes = likesMap[comment.id] || { count: 0, isLiked: false };
    const replies = (repliesMap[comment.id] || []).map((reply: any) => {
      const replyLikes = replyLikesMap[reply.id] || reply._replyLikes || { count: 0, isLiked: false };
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
          likesCount: replyLikes.count ?? 0,
        },
        isLiked: replyLikes.isLiked ?? false,
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
        likesCount: commentLikes.count ?? 0,
        repliesCount: comment._count?.replies ?? replies.length,
      },
      isLiked: commentLikes.isLiked ?? false,
      replies,
    };
  });
}

async function getLikesMap(targetType: string, targetIds: string[], currentUserId: string) {
  const likes = await prisma.like.findMany({
    where: { targetType: targetType as any, targetId: { in: targetIds } },
    select: { targetId: true, userId: true },
  });
  const map: Record<string, { count: number; isLiked: boolean }> = {};
  for (const id of targetIds) {
    const filtered = likes.filter((l) => l.targetId === id);
    map[id] = {
      count: filtered.length,
      isLiked: filtered.some((l) => l.userId === currentUserId),
    };
  }
  return map;
}

async function getRepliesForComments(commentIds: string[], currentUserId: string) {
  const replies = await prisma.reply.findMany({
    where: { commentId: { in: commentIds } },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });

  const replyIds = replies.map((r) => r.id);
  const replyLikes = await prisma.like.findMany({
    where: { targetType: 'REPLY', targetId: { in: replyIds } },
    select: { targetId: true, userId: true },
  });

  const replyLikeMap: Record<string, { count: number; isLiked: boolean }> = {};
  for (const reply of replies) {
    const filtered = replyLikes.filter((l) => l.targetId === reply.id);
    replyLikeMap[reply.id] = {
      count: filtered.length,
      isLiked: filtered.some((l) => l.userId === currentUserId),
    };
  }

  const map: Record<string, any[]> = {};
  for (const reply of replies) {
    if (!map[reply.commentId]) map[reply.commentId] = [];
    const likesInfo = replyLikeMap[reply.id] || { count: 0, isLiked: false };
    map[reply.commentId].push({ ...reply, _replyLikes: likesInfo });
  }
  return map;
}

async function getReplyLikesMap(commentIds: string[], currentUserId: string) {
  const replies = await prisma.reply.findMany({
    where: { commentId: { in: commentIds } },
    select: { id: true },
  });
  const replyIds = replies.map((r) => r.id);
  const replyLikes = await prisma.like.findMany({
    where: { targetType: 'REPLY', targetId: { in: replyIds } },
    select: { targetId: true, userId: true },
  });
  const map: Record<string, { count: number; isLiked: boolean }> = {};
  for (const id of replyIds) {
    const filtered = replyLikes.filter((l) => l.targetId === id);
    map[id] = {
      count: filtered.length,
      isLiked: filtered.some((l) => l.userId === currentUserId),
    };
  }
  return map;
}

export const postService = {
  create: async (userId: string, input: CreatePostInput, image?: string) => {
    const post = await postRepository.create({
      userId,
      content: input.content,
      visibility: input.visibility || Visibility.PUBLIC,
      image,
    });

    const topReactions: any[] = [];
    const likesCount = 0;
    const comments: any[] = [];

    return mapPost(post, userId, topReactions, likesCount, comments);
  },

  getFeed: async (currentUserId: string, cursor?: string, limit: number = 20) => {
    const posts = await postRepository.findFeed(currentUserId, cursor, limit);
    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;

    const enriched = await Promise.all(
      data.map(async (post) => {
        const [topReactions, likesCount, rawComments] = await Promise.all([
          postRepository.findTopReactions(post.id),
          postRepository.countLikes(post.id),
          prisma.comment.findMany({
            where: { postId: post.id },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: {
              user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
              _count: { select: { replies: true } },
            },
          }),
        ]);

        const comments = await enrichComments(rawComments, currentUserId);

        return mapPost(post, currentUserId, topReactions, likesCount, comments);
      }),
    );

    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      posts: enriched,
      nextCursor,
      hasMore,
    };
  },

  getById: async (postId: string, currentUserId: string) => {
    const post = await postRepository.findById(postId, currentUserId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    if (post.visibility === 'PRIVATE' && post.userId !== currentUserId) {
      throw new NotFoundError('Post not found');
    }

    const [topReactions, likesCount, rawComments] = await Promise.all([
      postRepository.findTopReactions(post.id),
      postRepository.countLikes(post.id),
      prisma.comment.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { replies: true } },
        },
      }),
    ]);

    const comments = await enrichComments(rawComments, currentUserId);

    return mapPost(post, currentUserId, topReactions, likesCount, comments);
  },

  update: async (postId: string, userId: string, input: UpdatePostInput, image?: string) => {
    const post = await postRepository.findById(postId, userId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenError('You can only update your own posts');
    }
    const updated = await postRepository.update(postId, { ...input, ...(image ? { image } : {}) }, userId);

    const topReactions = await postRepository.findTopReactions(postId);
    const likesCount = await postRepository.countLikes(postId);
    const rawComments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { replies: true } },
      },
    });
    const comments = await enrichComments(rawComments, userId);

    return mapPost(updated, userId, topReactions, likesCount, comments);
  },

  delete: async (postId: string, userId: string) => {
    const post = await postRepository.findById(postId, userId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }
    await postRepository.delete(postId);
  },

  verifyOwnership: async (postId: string, userId: string): Promise<boolean> => {
    const post = await postRepository.findById(postId, userId);
    return post !== null && post.userId === userId;
  },
};
