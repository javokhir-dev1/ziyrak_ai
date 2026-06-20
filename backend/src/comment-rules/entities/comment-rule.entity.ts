import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('comment_rules')
export class CommentRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: string;

  @Column({ type: 'text', nullable: true })
  postCaption: string;

  @Column({ nullable: true })
  postThumbnail: string;

  @Column({ default: true })
  isActive: boolean;

  // Kommentga javob — bir nechta variant (random tanlangan)
  @Column({ default: true })
  replyEnabled: boolean;

  @Column({ type: 'simple-json', default: '[]' })
  replyTemplates: string[];

  // Kalit so'zlar
  @Column({ default: false })
  keywordsEnabled: boolean;

  @Column({ type: 'simple-array', default: '' })
  keywords: string[];

  // DM yuborish — bir nechta variant (random tanlangan)
  @Column({ default: false })
  dmEnabled: boolean;

  @Column({ type: 'simple-json', default: '[]' })
  dmTemplates: string[];

  @CreateDateColumn()
  createdAt: Date;
}
