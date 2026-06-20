import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RateLimit, RateLimitType } from './entities/rate-limit.entity';

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(
    @InjectRepository(RateLimit)
    private repo: Repository<RateLimit>,
  ) {}

  /**
   * Foydalanuvchiga javob yuborish mumkinmi?
   *
   * Mantiq:
   * - Bitta foydalanuvchi perUserLimit (default: 10) tagacha javob oladi
   * - 10 tadan keyin cooldownHours soat kutadi, so'ng counter reset bo'ladi
   * - dailyLimit — botning kunlik umumiy javobi (barcha foydalanuvchilar bo'yicha)
   */
  async canReply(
    userId: string,
    type: RateLimitType,
    cooldownHours = 24,
    dailyLimit = 200,
    perUserLimit = 10,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const now = new Date();
    const record = await this.repo.findOne({ where: { userId, type } });

    if (record) {
      // Kunlik umumiy limit tekshiruvi
      const dailyResetAt = record.dailyResetAt ? new Date(record.dailyResetAt) : null;
      const isNewDay = !dailyResetAt || now >= dailyResetAt;
      const currentDailyCount = isNewDay ? 0 : record.dailyCount;

      if (!isNewDay && currentDailyCount >= dailyLimit) {
        return { allowed: false, reason: `Kunlik limit (${dailyLimit}) to'ldi` };
      }

      // Per-user limit tekshiruvi
      const userResetAt = record.userResetAt ? new Date(record.userResetAt) : null;
      const isCooldownOver = !userResetAt || now >= userResetAt;

      if (isCooldownOver) {
        // Cooldown tugagan — counter reset, javob berishga ruxsat
        return { allowed: true };
      }

      // Cooldown hali tugamagan — limit dolganmi?
      if (record.userReplyCount >= perUserLimit) {
        const remainingMin = Math.ceil((userResetAt.getTime() - now.getTime()) / 60000);
        const remainingHr = (remainingMin / 60).toFixed(1);
        return {
          allowed: false,
          reason: `@${userId} ${perUserLimit} ta javob oldi, ${remainingHr} soatdan keyin davom etadi`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Javob yuborildi deb belgilash
   */
  async recordReply(
    userId: string,
    type: RateLimitType,
    cooldownHours = 24,
  ): Promise<void> {
    const now = new Date();

    // Kunlik reset vaqti (ertasi kuni 00:00)
    const tomorrowMidnight = new Date(now);
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
    tomorrowMidnight.setHours(0, 0, 0, 0);

    // User cooldown reset vaqti (hozirdan + cooldownHours)
    const userResetAt = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000);

    let record = await this.repo.findOne({ where: { userId, type } });

    if (!record) {
      record = this.repo.create({
        userId,
        type,
        lastSentAt: now,
        userReplyCount: 1,
        userResetAt,
        dailyCount: 1,
        dailyResetAt: tomorrowMidnight,
      });
    } else {
      // Kunlik counter
      const isNewDay = !record.dailyResetAt || now >= new Date(record.dailyResetAt);
      record.dailyCount = isNewDay ? 1 : record.dailyCount + 1;
      record.dailyResetAt = isNewDay ? tomorrowMidnight : record.dailyResetAt;

      // Per-user counter
      const isCooldownOver = !record.userResetAt || now >= new Date(record.userResetAt);
      if (isCooldownOver) {
        // Cooldown tugagan — yangi davr boshlanadi
        record.userReplyCount = 1;
        record.userResetAt = userResetAt;
      } else {
        record.userReplyCount = record.userReplyCount + 1;
        // userResetAt ni o'zgartirmaymiz — birinchi javob vaqtidan hisoblangan
      }

      record.lastSentAt = now;
    }

    await this.repo.save(record);
  }

  /** Berilgan millisekund kutish */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Random kutish */
  async randomDelay(minMs = 2000, maxMs = 5000): Promise<void> {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    this.logger.log(`${ms}ms kutilmoqda...`);
    return this.delay(ms);
  }
}
