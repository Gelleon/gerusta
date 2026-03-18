import { IsString, IsOptional } from 'class-validator';

export class GenerateContentDto {
  @IsString()
  topic: string;

  @IsString()
  @IsOptional()
  keywords?: string;
}

export class GenerateImageDto {
  @IsString()
  prompt: string;
}
