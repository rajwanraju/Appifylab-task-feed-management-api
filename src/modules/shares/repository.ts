import { prisma } from '../../shared/prisma';

export const shareRepository = {
  findByUserAndPost: (userId: string, postId: string) =>
    prisma.share.findUnique({
      where: { userId_postId: { userId, postId } },
    }),

  findByPost: (postId: string) =>
    prisma.share.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    }),

  countByPost: (postId: string) => prisma.share.count({ where: { postId } }),

  create: (userId: string, postId: string) =>
    prisma.share.create({
      data: { userId, postId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    }),

  delete: (userId: string, postId: string) =>
    prisma.share.deleteMany({
      where: { userId, postId },
    }),
};
