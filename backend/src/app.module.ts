import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookModule } from './webhook/webhook.module';
import { SettingsModule } from './settings/settings.module';
import { DmMessagesModule } from './dm-messages/dm-messages.module';
import { LogsModule } from './logs/logs.module';
import { InstagramModule } from './instagram/instagram.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { CommentRulesModule } from './comment-rules/comment-rules.module';
import { Settings } from './settings/entities/settings.entity';
import { DmMessage } from './dm-messages/entities/dm-message.entity';
import { DmCounter } from './dm-messages/entities/dm-counter.entity';
import { Log } from './logs/entities/log.entity';
import { RateLimit } from './rate-limit/entities/rate-limit.entity';
import { CommentRule } from './comment-rules/entities/comment-rule.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'password'),
        database: config.get('DB_DATABASE', 'instabot'),
        entities: [Settings, DmMessage, DmCounter, Log, RateLimit, CommentRule],
        synchronize: true, // production da false qiling va migrations ishlating
      }),
    }),

    InstagramModule,
    RateLimitModule,
    CommentRulesModule,
    WebhookModule,
    SettingsModule,
    DmMessagesModule,
    LogsModule,
  ],
})
export class AppModule {}
