import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateContentDto, GenerateImageDto } from './dto/ai.dto';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    const proxyUrl = this.configService.get<string>('HTTPS_PROXY')?.trim();

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
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional blog writer. Write a detailed, SEO-friendly article in HTML format. Include a title, excerpt, and full content.',
          },
          {
            role: 'user',
            content: `Topic: ${dto.topic}. Keywords: ${dto.keywords || 'none'}.`,
          },
        ],
      });
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new InternalServerErrorException('AI returned empty content');
      }
      return content;
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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    if (!apiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured');
    }

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: dto.prompt,
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

  private async optimizeAndSaveImage(url: string) {
    const filename = `${uuidv4()}.webp`;
    const uploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      const proxyUrl = this.configService.get<string>('HTTPS_PROXY')?.trim();
      const axiosOptions: any = { responseType: 'arraybuffer' };

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
}
