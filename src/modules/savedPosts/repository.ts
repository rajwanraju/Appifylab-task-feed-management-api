import { prisma } from '../../shared/prisma';

export const savedPostRepository = {
  findByUserAndPost: (userId: string, postId: string) =>
    prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    }),

  findByUser: async (userId: string, cursor?: string, limit: number = 20) => {
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        post: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            _count: { select: { comments: true } },
          },
        },
      },
    });

    const hasMore = savedPosts.length > limit;
    const data = hasMore ? savedPosts.slice(0, limit) : savedPosts;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      savedPosts: data.map((sp) => ({
        id: sp.id,
        savedAt: sp.createdAt,
        post: sp.post,
      })),
      nextCursor,
      hasMore,
    };
  },

  create: (userId: string, postId: string) =>
    prisma.savedPost.create({
      data: { userId, postId },
      include: {
        post: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    }),

  delete: (userId: string, postId: string) =>
    prisma.savedPost.deleteMany({
      where: { userId, postId },
    }),
};
