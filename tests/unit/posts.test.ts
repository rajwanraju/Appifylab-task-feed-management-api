jest.mock('../../src/shared/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn<any, any[]>(),
    },
    post: {
      findMany: jest.fn<any, any[]>(),
      findUnique: jest.fn<any, any[]>(),
      create: jest.fn<any, any[]>(),
      update: jest.fn<any, any[]>(),
      delete: jest.fn<any, any[]>(),
    },
    like: {
      findMany: jest.fn<any, any[]>(),
      findFirst: jest.fn<any, any[]>(),
      count: jest.fn<any, any[]>(),
    },
    comment: {
      findMany: jest.fn<any, any[]>(),
    },
    reply: {
      findMany: jest.fn<any, any[]>(),
    },
  },
}));

import { prisma } from '../../src/shared/prisma';
import { postService } from '../../src/modules/posts/service';

describe('PostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const mockPost = {
        id: 'post-1',
        userId: 'user-1',
        content: 'Test content',
        image: null,
        visibility: 'PUBLIC',
        sharesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', firstName: 'John', lastName: 'Doe', avatar: null },
        _count: { comments: 0 },
      };

      (prisma.post.create as jest.Mock).mockResolvedValue(mockPost);

      const result = await postService.create('user-1', { content: 'Test content' });

      expect(result.content).toBe('Test content');
      expect(result.stats).toBeDefined();
      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            content: 'Test content',
            visibility: 'PUBLIC',
          }),
        }),
      );
    });
  });

  describe('getFeed', () => {
    it('should return paginated feed', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          userId: 'user-1',
          content: 'Post 1',
          image: null,
          visibility: 'PUBLIC',
          sharesCount: 0,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
          user: { id: 'user-1', firstName: 'John', lastName: 'Doe', avatar: null },
          _count: { comments: 0 },
          savedBy: [],
        },
        {
          id: 'post-2',
          userId: 'user-2',
          content: 'Post 2',
          image: null,
          visibility: 'PUBLIC',
          sharesCount: 0,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          user: { id: 'user-2', firstName: 'Jane', lastName: 'Doe', avatar: null },
          _count: { comments: 0 },
          savedBy: [],
        },
        {
          id: 'post-3',
          userId: 'user-1',
          content: 'Post 3',
          image: null,
          visibility: 'PUBLIC',
          sharesCount: 0,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          user: { id: 'user-1', firstName: 'John', lastName: 'Doe', avatar: null },
          _count: { comments: 0 },
          savedBy: [],
        },
      ];

      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.like.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.like.count as jest.Mock).mockResolvedValue(0);
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reply.findMany as jest.Mock).mockResolvedValue([]);

      const result = await postService.getFeed('user-1', undefined, 10);

      expect(result.posts).toHaveLength(3);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });
});
