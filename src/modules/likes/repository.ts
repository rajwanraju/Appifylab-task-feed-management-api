import { LikeTarget, ReactionType } from '@prisma/client';
import { prisma } from '../../shared/prisma';

const likeInclude = {
  user: {
    select: { id: true, firstName: true, lastName: true, avatar: true },
  },
} as const;

export const likeRepository = {
  findByUserAndTarget: (userId: string, targetType: LikeTarget, targetId: string) =>
    prisma.like.findFirst({
      where: { userId, targetType, targetId },
    }),

  findUsersByTarget: (targetType: LikeTarget, targetId: string) =>
    prisma.like.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
      include: likeInclude,
    }),

  countByTarget: (targetType: LikeTarget, targetId: string) =>
    prisma.like.count({
      where: { targetType, targetId },
    }),

  create: (data: { userId: string; targetType: LikeTarget; targetId: string; reactionType?: ReactionType }) =>
    prisma.like.create({
      data: {
        userId: data.userId,
        targetType: data.targetType,
        targetId: data.targetId,
        reactionType: data.reactionType ?? ReactionType.LIKE,
      },
      include: likeInclude,
    }),

  delete: (userId: string, targetType: LikeTarget, targetId: string) =>
    prisma.like.deleteMany({
      where: { userId, targetType, targetId },
    }),
};
