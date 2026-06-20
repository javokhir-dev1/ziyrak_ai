import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { SettingsModule } from '../settings/settings.module';
import { DmMessagesModule } from '../dm-messages/dm-messages.module';
import { LogsModule } from '../logs/logs.module';
import { CommentRulesModule } from '../comment-rules/comment-rules.module';

@Module({
  imports: [SettingsModule, DmMessagesModule, LogsModule, CommentRulesModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
