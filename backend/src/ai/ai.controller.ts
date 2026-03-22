import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import {
  GenerateContentDto,
  GenerateImageDto,
  RouterAiChatDto,
} from './dto/ai.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-article')
  async generateArticle(@Body() dto: GenerateContentDto) {
    return this.aiService.generateArticle(dto);
  }

  @Post('generate-image')
  async generateImage(@Body() dto: GenerateImageDto) {
    return this.aiService.generateImage(dto);
  }

  @Post('routerai/chat-completions')
  async generateRouterAiChat(@Body() dto: RouterAiChatDto) {
    return this.aiService.generateRouterAiChat(dto);
  }
}
