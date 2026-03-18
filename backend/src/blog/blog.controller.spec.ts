import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { AuthGuard } from '@nestjs/passport';

describe('BlogController', () => {
  let controller: BlogController;
  let service: BlogService;

  const mockBlogService = {
    findAllPosts: jest.fn(),
    findOnePost: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BlogController>(BlogController);
    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAllPosts with published status', async () => {
      const query = { search: 'test' };
      await controller.findAll(query);
      expect(service.findAllPosts).toHaveBeenCalledWith({
        ...query,
        status: 'published',
      });
    });
  });

  describe('create', () => {
    it('should call service.createPost with user id and dto', async () => {
      const dto = { title: 'New Post', content: 'Content' };
      const req = { user: { userId: 'user-1' } };
      await controller.create(req, dto as any);
      expect(service.createPost).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('getStats', () => {
    it('should return statistics from service', async () => {
      const stats = { posts: 10, views: 100 };
      mockBlogService.getStats.mockResolvedValue(stats);
      const result = await controller.getStats();
      expect(result).toBe(stats);
    });
  });
});
