import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('api/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll(@Query('limit') limit?: string) {
    const logs = await this.logsService.findAll(limit ? +limit : 100);
    return { success: true, logs };
  }

  @Get('today-stats')
  async todayStats() {
    const stats = await this.logsService.todayStats();
    return { success: true, ...stats };
  }
}
