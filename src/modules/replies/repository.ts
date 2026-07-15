import { prisma } from '../../shared/prisma';

const replyInclude = {
  user: {
    select: { id: true, firstName: true, lastName: true, avatar: true },
  },
} as const;

export const replyRepository = {
  findByCommentId: (commentId: string) =>
    prisma.reply.findMany({
      where: { commentId },
      orderBy: { createdAt: 'asc' },
      include: replyInclude,
    }),

  findById: (id: string) =>
    prisma.reply.findUnique({
      where: { id },
      include: replyInclude,
    }),

  create: (data: { commentId: string; userId: string; content: string }) =>
    prisma.reply.create({
      data,
      include: replyInclude,
    }),

  update: (id: string, data: { content: string }) =>
    prisma.reply.update({
      where: { id },
      data,
      include: replyInclude,
    }),

  delete: (id: string) => prisma.reply.delete({ where: { id } }),
};
