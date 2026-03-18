import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyBackup() {
    this.logger.log('Starting daily database backup...');

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

    try {
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        this.logger.log(`Backup successful: ${backupPath}`);

        // Keep only last 7 backups
        this.cleanupOldBackups(backupDir);
      } else {
        this.logger.error(`Database file not found at ${dbPath}`);
      }
    } catch (error) {
      this.logger.error('Backup failed', error);
    }
  }

  private cleanupOldBackups(backupDir: string) {
    const files = fs
      .readdirSync(backupDir)
      .filter((file) => file.startsWith('backup-') && file.endsWith('.db'))
      .map((file) => ({
        name: file,
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 7) {
      const toDelete = files.slice(7);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(backupDir, file.name));
        this.logger.log(`Deleted old backup: ${file.name}`);
      }
    }
  }
}
