import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateTagDto,
  UpdateTagDto,
  CreateCommentDto,
} from './dto/blog.dto';
import { v4 as uuidv4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private prisma: PrismaService) {}

  private sanitize(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        iframe: [
          'src',
          'width',
          'height',
          'frameborder',
          'allow',
          'allowfullscreen',
        ],
        img: ['src', 'alt', 'width', 'height', 'loading'],
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    const now = new Date();
    const scheduledPosts = await this.prisma.post.findMany({
      where: {
        published: false,
        scheduledAt: {
          lte: now,
          not: null,
        },
      },
    });

    if (scheduledPosts.length > 0) {
      this.logger.log(`Publishing ${scheduledPosts.length} scheduled posts...`);
      await this.prisma.post.updateMany({
        where: {
          id: { in: scheduledPosts.map((p) => p.id) },
        },
        data: {
          published: true,
          scheduledAt: null,
        },
      });
    }
  }

  private slugify(text: string) {
    return (
      text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-') +
      '-' +
      uuidv4().split('-')[0]
    );
  }

  // POSTS
  async createPost(userId: string, createPostDto: CreatePostDto) {
    const { tags, ...postData } = createPostDto;

    if (postData.scheduledAt && new Date(postData.scheduledAt) < new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    if (postData.content) {
      postData.content = this.sanitize(postData.content);
    }

    const slug = this.slugify(createPostDto.title);

    this.logger.log(`Creating new post: ${postData.title} by user ${userId}`);

    try {
      return await this.prisma.post.create({
        data: {
          ...postData,
          slug,
          authorId: userId,
          tags: {
            connectOrCreate: tags?.map((tag) => ({
              where: { name: tag },
              create: { name: tag, slug: this.slugify(tag) },
            })),
          },
        },
        include: { tags: true, category: true },
      });
    } catch (err: any) {
      this.logger.error(`Error creating post: ${err.message}`, err.stack);
      if (err.code === 'P2003') {
        throw new BadRequestException(
          `Foreign key constraint failed: ${err.meta?.field_name}. Make sure category exists.`,
        );
      }
      throw err;
    }
  }

  async findAllPosts(query: any) {
    const { status, category, tag, search, skip, take } = query;
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          deleted: false,
          published:
            status === 'published'
              ? true
              : status === 'draft'
                ? false
                : undefined,
          categoryId: category,
          tags: tag ? { some: { id: tag } } : undefined,
          OR: search
            ? [
                { title: { contains: search } },
                { content: { contains: search } },
              ]
            : undefined,
        },
        include: {
          tags: true,
          category: true,
          author: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: skipNum,
        take: takeNum,
      }),
      this.prisma.post.count({
        where: {
          deleted: false,
          published:
            status === 'published'
              ? true
              : status === 'draft'
                ? false
                : undefined,
          categoryId: category,
          tags: tag ? { some: { id: tag } } : undefined,
          OR: search
            ? [
                { title: { contains: search } },
                { content: { contains: search } },
              ]
            : undefined,
        },
      }),
    ]);

    return { posts, total };
  }

  async findOnePost(idOrSlug: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        tags: true,
        category: true,
        author: { select: { name: true, email: true } },
        versions: true,
        comments: true,
      },
    });
    if (!post || post.deleted) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto) {
    const { tags, ...postData } = updatePostDto;

    const currentPost = await this.findOnePost(id);
    if (currentPost.deleted)
      throw new BadRequestException('Cannot update deleted post');

    if (postData.categoryId === '') {
      delete (postData as any).categoryId;
    }
    if ((postData as any).scheduledAt === '') {
      (postData as any).scheduledAt = null;
    }

    if (postData.scheduledAt && new Date(postData.scheduledAt) < new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    if (postData.content) {
      postData.content = this.sanitize(postData.content);
    }

    // Save version before update
    await this.prisma.postVersion.create({
      data: {
        postId: id,
        title: currentPost.title,
        content: currentPost.content,
      },
    });

    this.logger.log(`Updating post ${id}: ${currentPost.title}`);

    // Update tags relationship properly
    const tagsUpdate = tags ? {
      set: [],
      connectOrCreate: tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag, slug: this.slugify(tag) },
      })),
    } : undefined;

    return this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        ...(tagsUpdate && { tags: tagsUpdate }),
      },
      include: { tags: true, category: true },
    });
  }

  async deletePost(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    this.logger.warn(`Soft deleting post ${id}: ${post.title}`);

    return this.prisma.post.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        published: false, // Also unpublish for safety
      },
    });
  }

  // CATEGORIES
  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, slug: this.slugify(dto.name) },
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, slug: this.slugify(dto.name) },
    });
  }

  async deleteCategory(id: string) {
    // Check if category has posts
    const count = await this.prisma.post.count({ where: { categoryId: id } });
    if (count > 0) {
      throw new Error('Cannot delete category with associated posts');
    }
    return this.prisma.category.delete({ where: { id } });
  }

  // TAGS
  async findAllTags() {
    return this.prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async createTag(dto: CreateTagDto) {
    return this.prisma.tag.create({
      data: { ...dto, slug: this.slugify(dto.name) },
    });
  }

  async updateTag(id: string, dto: UpdateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data: { ...dto, slug: this.slugify(dto.name) },
    });
  }

  async deleteTag(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }

  // COMMENTS
  async findAllComments() {
    return this.prisma.comment.findMany({
      include: {
        post: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createComment(postId: string, dto: CreateCommentDto) {
    const sanitizedContent = this.sanitize(dto.content);
    return this.prisma.comment.create({
      data: {
        ...dto,
        content: sanitizedContent,
        postId,
      },
    });
  }

  async approveComment(id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { approved: true },
    });
  }

  async deleteComment(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }

  // EXPORT / IMPORT
  async exportPosts() {
    return this.prisma.post.findMany({
      include: {
        tags: true,
        category: true,
        author: { select: { name: true, email: true } },
      },
    });
  }

  async importPosts(posts: any[]) {
    const results: any[] = [];
    for (const post of posts) {
      const { tags, category, author, id, ...postData } = post;

      // Basic validation
      if (!postData.title || !postData.content) continue;

      const slug = postData.slug || this.slugify(postData.title);

      try {
        const firstUser = await this.prisma.user.findFirst();
        if (!firstUser && !postData.authorId) {
          console.warn('No users found in database to assign as author');
          continue;
        }

        const imported = await this.prisma.post.create({
          data: {
            ...postData,
            slug,
            authorId: postData.authorId || firstUser?.id,
            tags: {
              connectOrCreate: tags?.map((tag) => ({
                where: { name: tag.name || tag },
                create: {
                  name: tag.name || tag,
                  slug: this.slugify(tag.name || tag),
                },
              })),
            },
            categoryId: category?.id,
          },
        });
        results.push(imported);
      } catch (e) {
        console.error(`Failed to import post: ${postData.title}`, e);
      }
    }
    return { count: results.length, total: posts.length };
  }

  // STATISTICS
  async getStats() {
    this.logger.log('Starting dashboard data synchronization...');
    try {
      const [
        postsCount,
        categoriesCount,
        tagsCount,
        commentsCount,
        totalViews,
      ] = await Promise.all([
        this.prisma.post.count({ where: { deleted: false } }),
        this.prisma.category.count(),
        this.prisma.tag.count(),
        this.prisma.comment.count(),
        this.prisma.post.aggregate({
          where: { deleted: false },
          _sum: {
            views: true,
          },
        }),
      ]);

      const latestPosts = await this.prisma.post.findMany({
        where: { deleted: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          views: true,
          createdAt: true,
          published: true,
        },
      });

      const popularPosts = await this.prisma.post.findMany({
        where: { deleted: false },
        take: 5,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          views: true,
        },
      });

      const stats = {
        totalPosts: postsCount,
        totalCategories: categoriesCount,
        totalTags: tagsCount,
        totalComments: commentsCount,
        totalViews: totalViews._sum.views || 0,
        latestPosts,
        popularPosts,
        syncedAt: new Date().toISOString(),
      };

      this.logger.log(
        `Dashboard sync completed. Found ${postsCount} active posts.`,
      );
      return stats;
    } catch (error) {
      this.logger.error('Failed to synchronize dashboard data', error.stack);
      throw error;
    }
  }
}
