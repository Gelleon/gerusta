import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import {
  RouterAiChatRequest,
  RouterAiClientService,
} from './routerai-client.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RouterAiClientService', () => {
  const getConfigService = (overrides: Record<string, string> = {}) =>
    ({
      get: (key: string) => {
        const base: Record<string, string> = {
          ROUTERAI_API_KEY: 'test-key',
          ROUTERAI_MAX_RETRIES: '1',
          ROUTERAI_TIMEOUT_MS: '1000',
          ROUTERAI_RETRY_DELAY_MS: '100',
        };
        return overrides[key] ?? base[key];
      },
    }) as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.isAxiosError.mockImplementation(
      (value: unknown): value is AxiosError => {
        return Boolean(
          value &&
          typeof value === 'object' &&
          'isAxiosError' in value &&
          (value as { isAxiosError?: boolean }).isAxiosError,
        );
      },
    );
  });

  it('sends request to RouterAI endpoint with correct payload', async () => {
    const service = new RouterAiClientService(getConfigService());
    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: {
        id: 'resp-1',
        model: 'openai/gpt-5-image-mini',
        choices: [
          { index: 0, message: { content: 'https://example.com/a.png' } },
        ],
      },
    });

    const response = await service.createImageCompletion('Generate image');

    expect(response.id).toBe('resp-1');
    const postCalls = mockedAxios.post.mock.calls;
    expect(postCalls).toHaveLength(1);
    expect(postCalls[0]?.[0]).toBe(
      'https://routerai.ru/api/v1/chat/completions',
    );
    expect(postCalls[0]?.[1]).toStrictEqual({
      model: 'openai/gpt-5-image-mini',
      messages: [{ role: 'user', content: 'Generate image' }],
    });
    expect(postCalls[0]?.[2]).toMatchObject({
      timeout: 1000,
      headers: {
        Authorization: 'Bearer test-key',
        'Content-Type': 'application/json',
      },
    });
  });

  it('retries once on 500 error and then succeeds', async () => {
    const service = new RouterAiClientService(getConfigService());
    const error = {
      isAxiosError: true,
      message: 'Server error',
      response: {
        status: 500,
        data: { message: 'Temporary failure' },
      },
    } as AxiosError<{ message?: string }>;

    mockedAxios.post.mockRejectedValueOnce(error).mockResolvedValueOnce({
      status: 200,
      data: {
        id: 'resp-2',
        choices: [
          { index: 0, message: { content: 'https://example.com/b.png' } },
        ],
      },
    });

    const response = await service.createImageCompletion('Retry request');

    expect(response.id).toBe('resp-2');
    expect(mockedAxios.post.mock.calls).toHaveLength(2);
  });

  it('throws when api key is missing', async () => {
    const service = new RouterAiClientService(
      getConfigService({ ROUTERAI_API_KEY: '' }),
    );

    await expect(
      service.createImageCompletion('Generate image'),
    ).rejects.toThrow(BadRequestException);
    expect(mockedAxios.post.mock.calls).toHaveLength(0);
  });

  it('throws after retries are exhausted', async () => {
    const service = new RouterAiClientService(getConfigService());
    const error = {
      isAxiosError: true,
      message: 'Server down',
      response: {
        status: 503,
        data: { message: 'Service unavailable' },
      },
    } as AxiosError<{ message?: string }>;
    mockedAxios.post.mockRejectedValue(error);

    await expect(
      service.createImageCompletion('Generate image'),
    ).rejects.toThrow(InternalServerErrorException);
    expect(mockedAxios.post.mock.calls).toHaveLength(2);
  });

  it('extracts image url from response content', () => {
    const service = new RouterAiClientService(getConfigService());
    const response = {
      id: 'resp-3',
      choices: [
        {
          index: 0,
          message: {
            content: 'Image URL: https://cdn.example.com/image.webp',
          },
        },
      ],
    };

    expect(service.extractImageUrl(response)).toBe(
      'https://cdn.example.com/image.webp',
    );
  });

  it('validates message content in custom payload', async () => {
    const service = new RouterAiClientService(getConfigService());
    const payload = {
      model: 'openai/gpt-5-image-mini',
      messages: [{ role: 'user', content: '   ' }],
    } as RouterAiChatRequest;

    await expect(service.createChatCompletion(payload)).rejects.toThrow(
      BadRequestException,
    );
  });
});
