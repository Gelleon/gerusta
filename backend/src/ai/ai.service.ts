import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  GenerateContentDto,
  GenerateImageDto,
  RouterAiChatDto,
} from './dto/ai.dto';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { RouterAiClientService } from './routerai-client.service';

type GeneratedArticle = {
  title: string;
  excerpt: string;
  content: string;
};

@Injectable()
export class AiService {
  private openai: OpenAI | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly routerAiClientService: RouterAiClientService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    const proxyUrl = this.configService.get<string>('HTTPS_PROXY')?.trim();

    if (!apiKey) {
      this.openai = null;
      return;
    }

    const options: any = { apiKey };
    if (proxyUrl) {
      console.log('Using proxy for OpenAI:', proxyUrl);
      options.httpAgent = new HttpsProxyAgent(proxyUrl);
    }
    this.openai = new OpenAI(options);
  }

  async generateArticle(dto: GenerateContentDto) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    if (!apiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured');
    }
    const prompt = dto.prompt?.trim();
    const topic = dto.topic?.trim();
    const hasPrompt = Boolean(prompt && prompt.length >= 10);
    const hasTopic = Boolean(topic && topic.length >= 3);

    if (!hasPrompt && !hasTopic) {
      throw new BadRequestException(
        'Provide a prompt (min 10 chars) or topic (min 3 chars)',
      );
    }

    const normalizedPrompt: string = hasPrompt
      ? (prompt as string)
      : `Topic: ${topic as string}. Keywords: ${dto.keywords?.trim() || 'none'}.`;

    try {
      const openai = this.getOpenAiClientOrThrow();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional blog writer. Return valid JSON only with keys: title, excerpt, content. title max 100 chars. excerpt max 250 chars. content min 500 words, in clean HTML with headings and paragraphs.',
          },
          {
            role: 'user',
            content: normalizedPrompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const rawResult = response.choices?.[0]?.message?.content;
      if (!rawResult) {
        throw new InternalServerErrorException('AI returned empty content');
      }

      const parsed = this.parseGeneratedArticle(rawResult);
      return this.normalizeGeneratedArticle(parsed);
    } catch (err: any) {
      console.error('Error generating article:', err);
      if (err.error) {
        console.error(
          'OpenAI Error Details:',
          JSON.stringify(err.error, null, 2),
        );
      }
      const errorMessage =
        err.error?.message || err.message || 'Failed to generate article';
      throw new InternalServerErrorException(
        `AI Article Generation Error: ${errorMessage}`,
      );
    }
  }

  async generateImage(dto: GenerateImageDto) {
    const prompt = dto.prompt?.trim();
    if (!prompt || prompt.length < 5) {
      throw new BadRequestException(
        'Prompt is required and must contain at least 5 characters',
      );
    }

    const routerApiKey = this.configService
      .get<string>('ROUTERAI_API_KEY')
      ?.trim();
    if (routerApiKey) {
      return this.generateImageWithRouterAi(prompt);
    }

    const openAiApiKey = this.configService
      .get<string>('OPENAI_API_KEY')
      ?.trim();
    if (!openAiApiKey) {
      throw new BadRequestException(
        'ROUTERAI_API_KEY or OPENAI_API_KEY must be configured',
      );
    }

    try {
      const openai = this.getOpenAiClientOrThrow();
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from OpenAI');
      }
      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('Failed to generate image URL');
      }
      return { url: await this.optimizeAndSaveImage(imageUrl) };
    } catch (err: any) {
      console.error('Error generating image:', err);

      // Detailed error logging to help identify region/proxy issues
      if (err.error) {
        console.error(
          'OpenAI Error Details:',
          JSON.stringify(err.error, null, 2),
        );
      }

      const errorMessage =
        err.error?.message || err.message || 'Failed to generate image';
      throw new InternalServerErrorException(
        `AI Image Generation Error: ${errorMessage}`,
      );
    }
  }

  async generateRouterAiChat(dto: RouterAiChatDto) {
    const response = await this.routerAiClientService.createChatCompletion({
      model: 'openai/gpt-5-image-mini',
      messages: dto.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new InternalServerErrorException('RouterAI returned empty content');
    }
    return {
      model: response.model,
      id: response.id,
      content,
    };
  }

  private async optimizeAndSaveImage(url: string) {
    const filename = `${uuidv4()}.webp`;
    const uploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      const proxyUrl = this.configService.get<string>('HTTPS_PROXY')?.trim();
      const axiosOptions: any = {
        responseType: 'arraybuffer',
        timeout: this.resolveImageDownloadTimeoutMs(),
      };

      if (proxyUrl) {
        axiosOptions.httpsAgent = new HttpsProxyAgent(proxyUrl);
      }

      const response = await axios.get(url, axiosOptions);
      const buffer = Buffer.from(response.data);

      await sharp(buffer)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, filename));

      return `/uploads/${filename}`;
    } catch (err) {
      console.error('Error optimizing image:', err);
      throw new InternalServerErrorException('Failed to save generated image');
    }
  }

  private parseGeneratedArticle(raw: string): GeneratedArticle {
    try {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof parsed.title !== 'string' ||
        typeof parsed.excerpt !== 'string' ||
        typeof parsed.content !== 'string'
      ) {
        throw new Error('Invalid AI response shape');
      }
      return {
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
      };
    } catch {
      throw new InternalServerErrorException(
        'AI returned invalid JSON response for article generation',
      );
    }
  }

  private async generateImageWithRouterAi(prompt: string) {
    try {
      const response =
        await this.routerAiClientService.createImageCompletion(prompt);
      const imageUrl = this.routerAiClientService.extractImageUrl(response);
      if (!imageUrl) {
        throw new Error('RouterAI did not return a valid image URL');
      }
      return { url: await this.optimizeAndSaveImageWithFallback(imageUrl) };
    } catch (err: any) {
      console.error('Error generating image with RouterAI:', err);
      const errorMessage = err.message || 'Failed to generate image';
      throw new InternalServerErrorException(
        `RouterAI Image Generation Error: ${errorMessage}`,
      );
    }
  }

  private async optimizeAndSaveImageWithFallback(url: string): Promise<string> {
    try {
      return await this.optimizeAndSaveImage(url);
    } catch (error) {
      console.error('Falling back to direct RouterAI URL:', error);
      return url;
    }
  }

  private resolveImageDownloadTimeoutMs(): number {
    const rawTimeout = this.configService.get<string>(
      'IMAGE_DOWNLOAD_TIMEOUT_MS',
    );
    const timeout = Number.parseInt(rawTimeout ?? '', 10);
    if (Number.isNaN(timeout) || timeout < 5000) {
      return 30000;
    }
    return timeout;
  }

  private normalizeGeneratedArticle(
    article: GeneratedArticle,
  ): GeneratedArticle {
    const title = article.title.trim().slice(0, 100);
    const excerpt = article.excerpt.trim().slice(0, 250);
    const content = article.content.trim();

    if (!title) {
      throw new InternalServerErrorException('AI returned empty title');
    }

    if (!excerpt) {
      throw new InternalServerErrorException('AI returned empty excerpt');
    }

    const wordsCount = content.split(/\s+/).filter(Boolean).length;
    if (wordsCount < 500) {
      throw new InternalServerErrorException(
        'AI returned content shorter than 500 words',
      );
    }

    return { title, excerpt, content };
  }

  private getOpenAiClientOrThrow(): OpenAI {
    if (!this.openai) {
      throw new BadRequestException('OPENAI_API_KEY is not configured');
    }
    return this.openai;
  }
}
