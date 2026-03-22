import { isAxiosError } from 'axios';
import apiClient from '@/lib/api-client';

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

export async function generateArticleWithRouterAi({
  prompt,
  topic,
  keywords,
}: GenerateArticleParams): Promise<GeneratedArticle> {
  const userMessage = `Prompt: ${prompt}\nTopic: ${topic?.trim() || 'none'}\nKeywords: ${keywords?.trim() || 'none'}`;

  try {
    const routerResponse = await apiClient.post<RouterAiChatResponse>(
      '/ai/routerai/chat-completions',
      {
        messages: [
          { role: 'system', content: SYSTEM_MESSAGE },
          { role: 'user', content: userMessage },
        ],
      },
    );
    const parsedRouterArticle = parseGeneratedArticle(routerResponse.data.content);
    if (!parsedRouterArticle) {
      throw new Error('Invalid RouterAI response format');
    }
    return parsedRouterArticle;
  } catch (routerError: unknown) {
    if (isAxiosError(routerError) && routerError.response?.status === 404) {
      throw routerError;
    }
    const fallbackResponse = await apiClient.post<GeneratedArticle>(
      '/ai/generate-article',
      {
        prompt,
        topic,
        keywords,
      },
    );
    return fallbackResponse.data;
  }
}

function parseGeneratedArticle(rawContent: string): GeneratedArticle | null {
  try {
    const parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.title !== 'string' ||
      typeof parsed.excerpt !== 'string' ||
      typeof parsed.content !== 'string'
    ) {
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
