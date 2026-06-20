import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Log } from './entities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private repo: Repository<Log>,
  ) {}

  async create(dto: CreateLogDto): Promise<Log> {
    const log = this.repo.create(dto);
    return this.repo.save(log);
  }

  async findAll(limit = 100): Promise<Log[]> {
    return this.repo.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async todayStats(): Promise<{ commentReplies: number; dmUsers: number }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [commentReplies, dmLogs] = await Promise.all([
      // Bugun postlarga yuborilgan komment javoblari
      this.repo.count({
        where: {
          action: 'Komment Javob',
          type: 'success',
          timestamp: MoreThanOrEqual(todayStart),
        },
      }),
      // Bugun DM olgan unikal foydalanuvchilar
      this.repo.find({
        where: {
          action: 'DM Avtoreply',
          type: 'success',
          timestamp: MoreThanOrEqual(todayStart),
        },
        select: ['user'],
      }),
    ]);

    const dmUsers = new Set(dmLogs.map(l => l.user).filter(Boolean)).size;

    return { commentReplies, dmUsers };
  }
}
