import { ConfigService } from '@nestjs/config';
import { RouterAiClientService } from './routerai-client.service';

describe('RouterAiClientService integration', () => {
  const hasApiKey = Boolean(process.env.ROUTERAI_API_KEY?.trim());

  const service = new RouterAiClientService({
    get: (key: string) => {
      const env = process.env[key];
      return typeof env === 'string' ? env : undefined;
    },
  } as ConfigService);

  (hasApiKey ? it : it.skip)(
    'calls real RouterAI API and returns completion payload',
    async () => {
      const response = await service.createImageCompletion(
        'Create an image concept for a modern startup dashboard. Return a direct image URL.',
      );

      expect(response).toBeDefined();
      expect(response.choices?.length).toBeGreaterThan(0);
    },
    45000,
  );
});
