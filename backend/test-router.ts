import { RouterAiClientService } from './src/ai/routerai-client.service';
import { ConfigService } from '@nestjs/config';

async function run() {
  const config = new ConfigService({
    ROUTERAI_API_KEY: process.env.ROUTERAI_API_KEY || 'test',
  });
  
  const service = new RouterAiClientService(config);
  
  console.log('Testing image generation...');
  try {
    const result = await service.createImageCompletion('Beautiful sunset over the ocean');
    console.log('Raw Result:', JSON.stringify(result, null, 2));
    
    const url = service.extractImageUrl(result);
    console.log('Extracted URL:', url);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
