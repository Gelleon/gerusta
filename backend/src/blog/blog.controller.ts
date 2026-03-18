import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateTagDto,
  UpdateTagDto,
  CreateCommentDto,
} from './dto/blog.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // PUBLIC
  @Get('posts')
  async findAll(@Query() query: any) {
    return this.blogService.findAllPosts({ ...query, status: 'published' });
  }

  @Get('posts/:idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.blogService.findOnePost(idOrSlug);
  }

  @Post('posts/:id/comments')
  async createComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.blogService.createComment(id, dto);
  }

  // ADMIN
  @UseGuards(AuthGuard('jwt'))
  @Get('admin/posts')
  async adminFindAll(@Query() query: any) {
    return this.blogService.findAllPosts(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts')
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.blogService.createPost(req.user.userId, createPostDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('posts/:id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.blogService.updatePost(id, updatePostDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('posts/:id')
  async remove(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.blogService.updateCategory(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('categories/:id')
  async removeCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }

  // TAGS
  @Get('tags')
  async findAllTags() {
    return this.blogService.findAllTags();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('tags')
  async createTag(@Body() dto: CreateTagDto) {
    return this.blogService.createTag(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('tags/:id')
  async updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.blogService.updateTag(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('tags/:id')
  async removeTag(@Param('id') id: string) {
    return this.blogService.deleteTag(id);
  }

  @Get('categories')
  async findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('comments/:id/approve')
  async approveComment(@Param('id') id: string) {
    return this.blogService.approveComment(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('comments/:id')
  async removeComment(@Param('id') id: string) {
    return this.blogService.deleteComment(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('comments')
  async findAllComments() {
    return this.blogService.findAllComments();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats() {
    return this.blogService.getStats();
  }

  @Get('export/json')
  exportPosts() {
    return this.blogService.exportPosts();
  }

  @Post('import/json')
  importPosts(@Body() posts: any[]) {
    return this.blogService.importPosts(posts);
  }
}
