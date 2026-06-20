import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentRule } from './entities/comment-rule.entity';
import { CreateCommentRuleDto } from './dto/create-comment-rule.dto';

@Injectable()
export class CommentRulesService {
  constructor(
    @InjectRepository(CommentRule)
    private repo: Repository<CommentRule>,
  ) {}

  findAll(): Promise<CommentRule[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findByPostId(postId: string): Promise<CommentRule | null> {
    return this.repo.findOne({ where: { postId, isActive: true } });
  }

  create(dto: CreateCommentRuleDto): Promise<CommentRule> {
    const rule = this.repo.create({
      ...dto,
      keywords: dto.keywords || [],
    });
    return this.repo.save(rule);
  }

  async update(id: number, dto: Partial<CreateCommentRuleDto>): Promise<CommentRule> {
    await this.repo.update(id, dto as any);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async toggleActive(id: number): Promise<CommentRule> {
    const rule = await this.repo.findOne({ where: { id } });
    rule.isActive = !rule.isActive;
    return this.repo.save(rule);
  }
}
