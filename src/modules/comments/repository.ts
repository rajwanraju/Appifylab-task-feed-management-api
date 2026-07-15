import { prisma } from '../../shared/prisma';

const commentInclude = {
  user: {
    select: { id: true, firstName: true, lastName: true, avatar: true },
  },
  _count: {
    select: { replies: true },
  },
} as const;

export const commentRepository = {
  findByPostId: (postId: string) =>
    prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: commentInclude,
    }),

  findById: (id: string) =>
    prisma.comment.findUnique({
      where: { id },
      include: commentInclude,
    }),

  create: (data: { postId: string; userId: string; content: string }) =>
    prisma.comment.create({
      data,
      include: commentInclude,
    }),

  update: (id: string, data: { content: string }) =>
    prisma.comment.update({
      where: { id },
      data,
      include: commentInclude,
    }),

  delete: (id: string) => prisma.comment.delete({ where: { id } }),
};
