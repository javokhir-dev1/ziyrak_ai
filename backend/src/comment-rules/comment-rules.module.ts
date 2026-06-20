import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRule } from './entities/comment-rule.entity';
import { CommentRulesService } from './comment-rules.service';
import { CommentRulesController } from './comment-rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommentRule])],
  controllers: [CommentRulesController],
  providers: [CommentRulesService],
  exports: [CommentRulesService],
})
export class CommentRulesModule {}
