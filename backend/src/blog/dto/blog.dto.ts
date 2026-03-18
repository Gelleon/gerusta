import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class UpdatePostDto extends CreatePostDto {}

export class CreateCategoryDto {
  @IsString()
  name: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}

export class CreateTagDto {
  @IsString()
  name: string;
}

export class UpdateTagDto extends CreateTagDto {}

export class CreateCommentDto {
  @IsString()
  content: string;
  @IsString()
  authorName: string;
  @IsString()
  authorEmail: string;
}
