import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CommentRulesService } from './comment-rules.service';
import { CreateCommentRuleDto } from './dto/create-comment-rule.dto';

@Controller('api/comment-rules')
export class CommentRulesController {
  constructor(private readonly service: CommentRulesService) {}

  @Get()
  async findAll() {
    const rules = await this.service.findAll();
    return { success: true, rules };
  }

  @Post()
  async create(@Body() dto: CreateCommentRuleDto) {
    const rule = await this.service.create(dto);
    return { success: true, rule };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCommentRuleDto>) {
    const rule = await this.service.update(+id, dto);
    return { success: true, rule };
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    const rule = await this.service.toggleActive(+id);
    return { success: true, rule };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true };
  }
}
