import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstagramService } from '../instagram/instagram.service';
import { SettingsService } from '../settings/settings.service';
import { DmMessagesService } from '../dm-messages/dm-messages.service';
import { LogsService } from '../logs/logs.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { CommentRulesService } from '../comment-rules/comment-rules.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private instagram: InstagramService,
    private settings: SettingsService,
    private dmMessages: DmMessagesService,
    private logs: LogsService,
    private rateLimit: RateLimitService,
    private commentRules: CommentRulesService,
    private config: ConfigService,
  ) {}

  /** Massivdan random element tanlaydi */
  private pickRandom(templates: string[]): string | null {
    const valid = templates.filter(t => t?.trim());
    if (!valid.length) return null;
    return valid[Math.floor(Math.random() * valid.length)];
  }

  async handleEntry(entry: any) {
    if (entry.messaging?.length) {
      for (const event of entry.messaging) {
        await this.handleIncomingDM(event);
      }
    }
    if (entry.changes?.length) {
      for (const change of entry.changes) {
        if (change.field === 'comments') {
          await this.handleComment(change.value);
        }
      }
    }
  }

  private async handleIncomingDM(event: any) {
    if (event.message?.is_echo) return;
    if (!event.message?.text) return;

    const senderId: string = event.sender?.id;
    if (!senderId) return;

    const s = await this.settings.get();

    if (!s.dmAutoReplyEnabled) {
      this.logger.log(`DM Avtoreply o'chirilgan, o'tkazib yuborildi`);
      return;
    }

    const check = await this.rateLimit.canReply(
      senderId, 'dm', s.userCooldownHours, s.dailyLimit, s.perUserLimit ?? 10,
    );
    if (!check.allowed) {
      this.logger.log(`DM o'tkazib yuborildi: ${check.reason}`);
      return;
    }

    await this.rateLimit.randomDelay(
      s.replyDelaySeconds * 1000,
      (s.replyDelaySeconds + 3) * 1000,
    );

    try {
      const reply = await this.dmMessages.getNextMessage();
      await this.instagram.sendDM(senderId, reply);
      await this.rateLimit.recordReply(senderId, 'dm', s.userCooldownHours);
      this.logger.log(`DM yuborildi: "${reply.substring(0, 50)}..."`);
      await this.logs.create({
        type: 'success',
        action: 'DM Avtoreply',
        message: reply.substring(0, 100),
        user: senderId,
      });
    } catch (err) {
      this.logger.error(`DM javobda xato: ${err.message}`);
      await this.logs.create({
        type: 'error',
        action: 'DM Avtoreply',
        message: err.message,
        user: senderId,
      });
    }
  }

  private async handleComment(commentData: any) {
    const commentId: string = commentData.id;
    const commentText: string = commentData.text;
    const commenterId: string = commentData.from?.id;
    const commenterName: string = commentData.from?.username || 'foydalanuvchi';

    // Botning o'z kommentlarini o'tkazib yuborish (loop oldini olish)
    const botAccountId = this.config.get('INSTAGRAM_BUSINESS_ACCOUNT_ID');
    if (commenterId && commenterId === botAccountId) {
      this.logger.log(`Bot kommentini o'tkazib yuborildi (loop prevention)`);
      return;
    }

    const mediaId: string = commentData.media?.id;
    this.logger.log(`Yangi komment (post: ${mediaId}): @${commenterName}: "${commentText}"`);

    // Faqat qoida mavjud postlar uchun ishlaydi
    const rule = mediaId ? await this.commentRules.findByPostId(mediaId) : null;
    if (!rule) {
      this.logger.log(`Post (${mediaId}) uchun qoida topilmadi, o'tkazib yuborildi`);
      return;
    }

    const s = await this.settings.get();

    // Kalit so'z filtri
    if (rule.keywordsEnabled && rule.keywords?.length) {
      const validKw = rule.keywords.filter(k => k);
      if (validKw.length > 0) {
        const lower = commentText.toLowerCase();
        const matches = validKw.some(kw => lower.includes(kw.toLowerCase()));
        if (!matches) {
          this.logger.log(`Kalit so'z mos kelmadi, o'tkazib yuborildi`);
          return;
        }
      }
    }

    // Rate limit tekshiruvi
    if (commenterId) {
      const check = await this.rateLimit.canReply(
        commenterId, 'comment', s.userCooldownHours, s.dailyLimit, s.perUserLimit ?? 10,
      );
      if (!check.allowed) {
        this.logger.log(`Komment javobi o'tkazib yuborildi: ${check.reason}`);
        return;
      }
    }

    // Delay
    await this.rateLimit.randomDelay(
      s.replyDelaySeconds * 1000,
      (s.replyDelaySeconds + 3) * 1000,
    );

    // Kommentga javob
    if (rule.replyEnabled) {
      const replyTemplate = this.pickRandom(rule.replyTemplates || []);
      if (replyTemplate) {
        const reply = replyTemplate
          .replace('{name}', commenterName)
          .replace('{comment}', commentText);
        try {
          await this.instagram.replyToComment(commentId, reply);
          if (commenterId) await this.rateLimit.recordReply(commenterId, 'comment', s.userCooldownHours);
          await this.logs.create({
            type: 'success',
            action: `Komment Javob`,
            message: reply.substring(0, 100),
            user: commenterName,
          });
        } catch (err) {
          this.logger.error(`Komment javobda xato: ${err.message}`);
          await this.logs.create({
            type: 'error',
            action: 'Komment Javob',
            message: err.message,
            user: commenterName,
          });
        }
      }
    }

    // DM yuborish
    if (rule.dmEnabled && commenterId) {
      const dmTemplate = this.pickRandom(rule.dmTemplates || []);
      if (dmTemplate) {
        const dm = dmTemplate
          .replace('{name}', commenterName)
          .replace('{comment}', commentText);
        try {
          await this.instagram.sendDM(commenterId, dm);
          await this.logs.create({
            type: 'success',
            action: 'Kommentdan DM',
            message: dm.substring(0, 100),
            user: commenterName,
          });
        } catch (err) {
          this.logger.error(`Kommentdan DM xato: ${err.message}`);
          await this.logs.create({
            type: 'error',
            action: 'Kommentdan DM',
            message: err.message,
            user: commenterName,
          });
        }
      }
    }
  }
}
