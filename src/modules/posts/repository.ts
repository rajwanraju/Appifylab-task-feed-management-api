import { Prisma, Visibility } from '@prisma/client';
import { prisma } from '../../shared/prisma';

const postInclude = (userId: string) =>
  ({
    user: {
      select: { id: true, firstName: true, lastName: true, avatar: true },
    },
    _count: {
      select: { comments: true },
    },
    savedBy: {
      where: { userId },
      take: 1,
      select: { id: true },
    },
  }) satisfies Prisma.PostInclude;

export const postRepository = {
  create: (data: { userId: string; content: string; image?: string; visibility: Visibility }) =>
    prisma.post.create({
      data,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    }),

  findById: (id: string, currentUserId: string) =>
    prisma.post.findUnique({
      where: { id },
      include: postInclude(currentUserId),
    }),

  findFeed: (currentUserId: string, cursor?: string, limit: number = 20) =>
    prisma.post.findMany({
      where: {
        OR: [{ visibility: 'PUBLIC' }, { userId: currentUserId }],
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: {
          select: { comments: true },
        },
        savedBy: {
          where: { userId: currentUserId },
          take: 1,
          select: { id: true },
        },
      },
    }),

  findTopReactions: (postId: string, limit: number = 5) =>
    prisma.like.findMany({
      where: { targetType: 'POST', targetId: postId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        userId: true,
        reactionType: true,
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    }),

  findUserLikeOnPost: (postId: string, userId: string) =>
    prisma.like.findFirst({
      where: { targetType: 'POST', targetId: postId, userId },
      select: { reactionType: true },
    }),

  countLikes: (postId: string) =>
    prisma.like.count({
      where: { targetType: 'POST', targetId: postId },
    }),

  update: (id: string, data: { content?: string; visibility?: Visibility; image?: string }, currentUserId: string) =>
    prisma.post.update({
      where: { id },
      data,
      include: postInclude(currentUserId),
    }),

  delete: (id: string) => prisma.post.delete({ where: { id } }),
};
