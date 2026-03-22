import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { RouterAiClientService } from './routerai-client.service';

@Module({
  providers: [AiService, RouterAiClientService],
  controllers: [AiController],
})
export class AiModule {}
