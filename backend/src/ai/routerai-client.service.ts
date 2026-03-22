import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export type RouterAiMessageRole = 'system' | 'user' | 'assistant';

export type RouterAiMessage = {
  role: RouterAiMessageRole;
  content: string;
};

export type RouterAiChatRequest = {
  model: 'openai/gpt-5-image-mini';
  messages: RouterAiMessage[];
};

export type RouterAiChatChoice = {
  index: number;
  message?: {
    role?: string;
    content?: string;
  };
  finish_reason?: string;
};

export type RouterAiChatResponse = {
  id?: string;
  model?: string;
  created?: number;
  choices?: RouterAiChatChoice[];
};

type RouterAiRequestOptions = {
  timeoutMs?: number;
  maxRetries?: number;
};

@Injectable()
export class RouterAiClientService {
  private readonly logger = new Logger(RouterAiClientService.name);
  private readonly endpoint = 'https://routerai.ru/api/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {}

  async createImageCompletion(prompt: string): Promise<RouterAiChatResponse> {
    const normalizedPrompt = this.normalizePrompt(prompt);
    const payload: RouterAiChatRequest = {
      model: 'openai/gpt-5-image-mini',
      messages: [
        {
          role: 'system',
          content:
            'You generate images. Return exactly one direct HTTPS image URL and nothing else.',
        },
        {
          role: 'user',
          content: this.buildImageRequestPrompt(normalizedPrompt),
        },
      ],
    };
    return this.createChatCompletion(payload, {
      timeoutMs: this.resolveImageTimeoutMs(),
      maxRetries: this.resolveImageMaxRetries(),
    });
  }

  async createChatCompletion(
    payload: RouterAiChatRequest,
    options: RouterAiRequestOptions = {},
  ): Promise<RouterAiChatResponse> {
    this.validatePayload(payload);
    const apiKey = this.resolveApiKey();
    const timeoutMs = options.timeoutMs ?? this.resolveTimeoutMs();
    const maxRetries = options.maxRetries ?? this.resolveMaxRetries();
    const backoffMs = this.resolveBackoffMs();

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const attemptNumber = attempt + 1;
      try {
        this.logger.log(
          `RouterAI request started attempt=${attemptNumber} model=${payload.model} messages=${payload.messages.length}`,
        );
        const response = await axios.post<RouterAiChatResponse>(
          this.endpoint,
          payload,
          {
            timeout: timeoutMs,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          },
        );
        this.logger.log(
          `RouterAI request completed attempt=${attemptNumber} status=${response.status}`,
        );
        this.logger.log(
          `RouterAI response id=${response.data.id ?? 'unknown'} preview=${this.buildContentPreview(response.data)}`,
        );
        return response.data;
      } catch (error: unknown) {
        const parsedError = this.parseAxiosError(error);
        const shouldRetry = this.isRetryableError(parsedError.statusCode);
        this.logger.error(
          `RouterAI request failed attempt=${attemptNumber} status=${parsedError.statusCode ?? 'network'} message=${parsedError.message}`,
        );

        if (!shouldRetry || attempt === maxRetries) {
          throw new InternalServerErrorException(
            `RouterAI request failed: ${parsedError.message}`,
          );
        }
        await this.sleep(backoffMs * 2 ** attempt);
      }
    }

    throw new InternalServerErrorException('RouterAI request failed');
  }

  extractImageUrl(response: RouterAiChatResponse): string | null {
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const directUrl = this.extractUrlFromString(content);
    if (directUrl) {
      return directUrl;
    }

    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      const candidates = [parsed.image_url, parsed.url, parsed.image].filter(
        (value): value is string => typeof value === 'string',
      );

      for (const candidate of candidates) {
        const parsedUrl = this.extractUrlFromString(candidate);
        if (parsedUrl) {
          return parsedUrl;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  buildCurlCommand(prompt: string): string {
    const normalizedPrompt = this.normalizePrompt(prompt).replaceAll(
      '"',
      '\\"',
    );
    const payload = JSON.stringify({
      model: 'openai/gpt-5-image-mini',
      messages: [{ role: 'user', content: normalizedPrompt }],
    }).replaceAll('"', '\\"');
    return `curl --request POST --url ${this.endpoint} --header "Authorization: Bearer YOUR_API_KEY" --header "Content-Type: application/json" --data "${payload}"`;
  }

  private normalizePrompt(prompt: string): string {
    if (typeof prompt !== 'string') {
      throw new BadRequestException('Prompt must be a string');
    }
    const normalizedPrompt = prompt.trim();
    if (normalizedPrompt.length < 5) {
      throw new BadRequestException(
        'Prompt must contain at least 5 characters',
      );
    }
    if (normalizedPrompt.length > 6000) {
      throw new BadRequestException(
        'Prompt must contain no more than 6000 characters',
      );
    }
    return normalizedPrompt;
  }

  private validatePayload(payload: RouterAiChatRequest): void {
    if (payload.model !== 'openai/gpt-5-image-mini') {
      throw new BadRequestException('Unsupported model');
    }

    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      throw new BadRequestException('Messages must be a non-empty array');
    }

    for (const message of payload.messages) {
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        throw new BadRequestException('Invalid message role');
      }
      this.normalizePrompt(message.content);
    }
  }

  private resolveApiKey(): string {
    const apiKey = this.configService.get<string>('ROUTERAI_API_KEY')?.trim();
    if (!apiKey) {
      throw new BadRequestException('ROUTERAI_API_KEY is not configured');
    }
    return apiKey;
  }

  private resolveTimeoutMs(): number {
    const rawTimeout = this.configService.get<string>('ROUTERAI_TIMEOUT_MS');
    const timeout = Number.parseInt(rawTimeout ?? '', 10);
    if (Number.isNaN(timeout) || timeout < 1000) {
      return 30000;
    }
    return timeout;
  }

  private resolveMaxRetries(): number {
    const rawMaxRetries = this.configService.get<string>(
      'ROUTERAI_MAX_RETRIES',
    );
    const retries = Number.parseInt(rawMaxRetries ?? '', 10);
    if (Number.isNaN(retries) || retries < 0 || retries > 5) {
      return 2;
    }
    return retries;
  }

  private resolveBackoffMs(): number {
    const rawBackoff = this.configService.get<string>(
      'ROUTERAI_RETRY_DELAY_MS',
    );
    const backoff = Number.parseInt(rawBackoff ?? '', 10);
    if (Number.isNaN(backoff) || backoff < 100) {
      return 500;
    }
    return backoff;
  }

  private resolveImageTimeoutMs(): number {
    const rawTimeout = this.configService.get<string>(
      'ROUTERAI_IMAGE_TIMEOUT_MS',
    );
    const timeout = Number.parseInt(rawTimeout ?? '', 10);
    if (Number.isNaN(timeout) || timeout < 10000) {
      return 120000;
    }
    return timeout;
  }

  private resolveImageMaxRetries(): number {
    const rawMaxRetries = this.configService.get<string>(
      'ROUTERAI_IMAGE_MAX_RETRIES',
    );
    const retries = Number.parseInt(rawMaxRetries ?? '', 10);
    if (Number.isNaN(retries) || retries < 0 || retries > 5) {
      return 1;
    }
    return retries;
  }

  private parseAxiosError(error: unknown): {
    message: string;
    statusCode: number | null;
  } {
    if (!axios.isAxiosError(error)) {
      return {
        message: 'Unknown request error',
        statusCode: null,
      };
    }

    const axiosError = error as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status ?? null;
    const responseMessage = axiosError.response?.data?.message;
    return {
      message:
        responseMessage ||
        axiosError.message ||
        'Unexpected error during RouterAI request',
      statusCode,
    };
  }

  private isRetryableError(statusCode: number | null): boolean {
    if (statusCode === null) {
      return true;
    }
    return statusCode === 429 || statusCode >= 500;
  }

  private extractUrlFromString(value: string): string | null {
    const urlMatch = value.match(/https?:\/\/[^\s"'<>()]+/i);
    return urlMatch?.[0] ?? null;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildContentPreview(response: RouterAiChatResponse): string {
    const content = response.choices?.[0]?.message?.content?.trim() ?? '';
    if (!content) {
      return 'empty';
    }
    return content.slice(0, 200);
  }

  private buildImageRequestPrompt(prompt: string): string {
    return [
      'Generate an image based on the prompt below.',
      'Return only one direct HTTPS image URL.',
      'Do not add any explanation, markdown, JSON, or extra text.',
      `Prompt: ${prompt}`,
    ].join('\n');
  }
}
