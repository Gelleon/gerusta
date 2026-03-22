import { isAxiosError } from 'axios';
import apiClient, { postWithDirectApiFallback } from '@/lib/api-client';

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  content: string;
};

type RouterAiChatResponse = {
  content: string;
};

type GenerateArticleParams = {
  prompt: string;
  topic?: string;
  keywords?: string;
};

const SYSTEM_MESSAGE =
  'You are a professional blog writer. Return valid JSON only with keys: title, excerpt, content. title max 100 chars. excerpt max 250 chars. content min 500 words, in clean HTML with headings and paragraphs.';
const ARTICLE_REQUEST_TIMEOUT_MS = 180000;

export async function generateArticleWithRouterAi({
  prompt,
  topic,
  keywords,
}: GenerateArticleParams): Promise<GeneratedArticle> {
  const userMessage = `Prompt: ${prompt}\nTopic: ${topic?.trim() || 'none'}\nKeywords: ${keywords?.trim() || 'none'}`;
  let lastRouterError: unknown = null;

  try {
    const routerResponse = await postWithDirectApiFallback<RouterAiChatResponse>(
      '/ai/routerai/chat-completions',
      {
        messages: [
          { role: 'system', content: SYSTEM_MESSAGE },
          { role: 'user', content: userMessage },
        ],
      },
      { timeout: ARTICLE_REQUEST_TIMEOUT_MS },
    );
    const parsedRouterArticle = parseGeneratedArticle(routerResponse.content);
    if (!parsedRouterArticle) {
      throw new Error('Invalid RouterAI response format');
    }
    return parsedRouterArticle;
  } catch (routerError: unknown) {
    lastRouterError = routerError;
    if (!shouldUseOpenAiFallback(routerError)) {
      throw routerError;
    }
  }

  try {
    const fallbackResponse = await postWithDirectApiFallback<GeneratedArticle>(
      '/ai/generate-article',
      {
        prompt,
        topic,
        keywords,
      },
      { timeout: ARTICLE_REQUEST_TIMEOUT_MS },
    );
    return fallbackResponse;
  } catch (fallbackError: unknown) {
    if (
      isAxiosError(fallbackError) &&
      fallbackError.response?.status === 400 &&
      String(fallbackError.response?.data?.message ?? '')
        .toLowerCase()
        .includes('openai_api_key is not configured')
    ) {
      throw lastRouterError ?? fallbackError;
    }
    throw fallbackError;
  }
}

function parseGeneratedArticle(rawContent: string): GeneratedArticle | null {
  try {
    const parsed = safeParseArticlePayload(rawContent);
    if (!isGeneratedArticlePayload(parsed)) {
      return null;
    }
    return {
      title: parsed.title.trim(),
      excerpt: parsed.excerpt.trim(),
      content: parsed.content.trim(),
    };
  } catch {
    return null;
  }
}

function isGeneratedArticlePayload(value: unknown): value is GeneratedArticle {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.excerpt === 'string' &&
    typeof candidate.content === 'string'
  );
}

function safeParseArticlePayload(rawContent: string): unknown {
  if (typeof rawContent !== 'string') {
    return rawContent;
  }

  const directParsed = tryParseJson(rawContent);
  if (directParsed !== null) {
    return directParsed;
  }

  const codeBlockMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch?.[1]) {
    const codeBlockParsed = tryParseJson(codeBlockMatch[1]);
    if (codeBlockParsed !== null) {
      return codeBlockParsed;
    }
  }

  const firstBrace = rawContent.indexOf('{');
  const lastBrace = rawContent.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const objectSlice = rawContent.slice(firstBrace, lastBrace + 1);
    const objectParsed = tryParseJson(objectSlice);
    if (objectParsed !== null) {
      return objectParsed;
    }
  }

  throw new Error('Invalid article payload');
}

function tryParseJson(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function shouldUseOpenAiFallback(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  if (status && retryableStatuses.includes(status)) {
    return true;
  }

  const retryableCodes = ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'];
  return Boolean(error.code && retryableCodes.includes(error.code));
}
