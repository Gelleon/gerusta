import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateLeadDto } from './dto/create-lead.dto';
import axios from 'axios';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private configService: ConfigService) {}

  async create(createLeadDto: CreateLeadDto) {
    this.logger.log(`New lead received: ${createLeadDto.name}`);

    // In production, we would save this to the database using Prisma
    // For now, let's focus on the Telegram notification
    await this.sendTelegramNotification(createLeadDto);

    return { success: true, message: 'Lead received and notification sent' };
  }

  private async sendTelegramNotification(lead: CreateLeadDto) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      this.logger.warn(
        'Telegram credentials not configured, skipping notification',
      );
      return;
    }

    const message = `
🚀 *New Project Request*

👤 *Name:* ${lead.name}
📱 *Contact:* ${lead.contact}
📝 *Task:* ${lead.task}
    `;

    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      });
      this.logger.log('Telegram notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send Telegram notification', error.message);
    }
  }
}
