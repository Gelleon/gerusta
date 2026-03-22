import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AiService } from './src/ai/ai.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const aiService = app.get(AiService);

  console.log('Testing image generation...');
  try {
    const result = await aiService.generateImage({ prompt: 'Beautiful sunset over the ocean' });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
  await app.close();
}

bootstrap();
