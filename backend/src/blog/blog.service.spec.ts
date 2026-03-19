import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    tag: {
      count: jest.fn(),
    },
    comment: {
      count: jest.fn(),
    },
    postVersion: {
      create: jest.fn(),
    },
    user: {
      findFirst: jest.fn().mockResolvedValue({ id: 'user-id' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post with slugified title', async () => {
      const dto = {
        title: 'Test Post',
        content: 'Test Content',
        tags: ['tag1'],
      };
      const userId = 'user-1';

      mockPrismaService.post.create.mockResolvedValue({
        id: '1',
        ...dto,
        slug: 'test-post',
      });

      const result = await service.createPost(userId, dto as any);

      expect(result.slug).toBe('test-post');
      expect(mockPrismaService.post.create).toHaveBeenCalled();
    });
  });

  describe('findOnePost', () => {
    it('should return a post if found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: '1',
        title: 'Test',
      });

      const result = await service.findOnePost('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(service.findOnePost('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('slugify', () => {
    it('should convert title to lowercase slug with random suffix', () => {
      const result = (service as any).slugify('Hello World! 2024');
      expect(result).toMatch(/^hello-world-2024-[a-z0-9]+$/);
    });

    it('should handle special characters and add random suffix', () => {
      const result = (service as any).slugify('Post with $pecial chars #tags');
      expect(result).toMatch(/^post-with-pecial-chars-tags-[a-z0-9]+$/);
    });
  });

  describe('sanitize', () => {
    it('should remove dangerous tags', () => {
      const dirty =
        '<script>alert("xss")</script><p>Hello <iframe src="dangerous.com"></iframe></p>';
      const clean = (service as any).sanitize(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<p>Hello');
      expect(clean).toContain('<iframe');
    });

    it('should keep allowed attributes', () => {
      const dirty = '<img src="test.jpg" alt="test" onclick="alert(1)">';
      const clean = (service as any).sanitize(dirty);
      expect(clean).toContain('src="test.jpg"');
      expect(clean).toContain('alt="test"');
      expect(clean).not.toContain('onclick');
    });
  });

  describe('handleScheduledPosts', () => {
    it('should publish posts that reached their scheduled time', async () => {
      const mockPosts = [{ id: '1', title: 'Scheduled' }];
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.updateMany.mockResolvedValue({ count: 1 });

      await service.handleScheduledPosts();

      expect(mockPrismaService.post.findMany).toHaveBeenCalled();
      expect(mockPrismaService.post.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ published: true }),
        }),
      );
    });
  });

  describe('getStats', () => {
    it('should filter out deleted posts from all stats', async () => {
      const mockAggregate = { _sum: { views: 100 } };
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          views: 50,
          createdAt: new Date(),
          published: true,
        },
        {
          id: '2',
          title: 'Post 2',
          views: 50,
          createdAt: new Date(),
          published: true,
        },
      ];

      mockPrismaService.post.count.mockResolvedValue(2);
      mockPrismaService.post.aggregate.mockResolvedValue(mockAggregate);
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.category.count.mockResolvedValue(1);
      mockPrismaService.tag.count.mockResolvedValue(1);
      mockPrismaService.comment.count.mockResolvedValue(1);

      const result = await service.getStats();

      expect(result.totalPosts).toBe(2);
      expect(result.totalViews).toBe(100);
      expect(result.latestPosts).toHaveLength(2);
      expect(result.popularPosts).toHaveLength(2);
      expect(result.syncedAt).toBeDefined();

      // Verify that 'deleted: false' was used in all relevant calls
      expect(mockPrismaService.post.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deleted: false } }),
      );
      expect(mockPrismaService.post.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deleted: false } }),
      );
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deleted: false } }),
      );
    });
  });
});
