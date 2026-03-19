import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from './leads/leads.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { AiModule } from './ai/ai.module';
import { BackupService } from './backup/backup.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const requiredVars = ['ADMIN_LOGIN', 'ADMIN_PASSWORD'];
        const missingVars = requiredVars.filter((key) => !env[key]);
        if (missingVars.length > 0) {
          throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`,
          );
        }
        return env;
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    LeadsModule,
    PrismaModule,
    AuthModule,
    BlogModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, BackupService],
})
export class AppModule {}
