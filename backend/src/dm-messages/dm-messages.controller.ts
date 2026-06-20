import { Controller, Get, Put, Body } from '@nestjs/common';
import { DmMessagesService } from './dm-messages.service';
import { UpdateDmMessagesDto } from './dto/update-dm-messages.dto';

@Controller('api/dm-messages')
export class DmMessagesController {
  constructor(private readonly service: DmMessagesService) {}

  @Get()
  async findAll() {
    const messages = await this.service.findAll();
    const counter = await this.service.getCounter();
    return {
      success: true,
      messages: messages.map((m) => m.text),
      currentIndex: counter.currentIndex,
    };
  }

  @Put()
  async replaceAll(@Body() dto: UpdateDmMessagesDto) {
    await this.service.replaceAll(dto.messages);
    return { success: true, message: 'DM xabarlar saqlandi' };
  }
}
