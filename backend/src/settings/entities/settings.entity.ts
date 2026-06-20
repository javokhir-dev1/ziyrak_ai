import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  autoReplyEnabled: boolean;

  @Column({ type: 'text', default: '' })
  commentReplyTemplate: string;

  @Column({ default: false })
  autoDmEnabled: boolean;

  @Column({ default: false })
  dmAutoReplyEnabled: boolean;

  @Column({ type: 'text', default: '' })
  dmTemplate: string;

  @Column({ default: false })
  keywordsEnabled: boolean;

  @Column({ type: 'simple-array', default: '' })
  keywords: string[];

  // Post filtri: bo'sh bo'lsa barcha postlar, aks holda faqat tanlangan postlar
  @Column({ type: 'simple-array', default: '' })
  targetPostIds: string[];

  // Rate limiting
  @Column({ default: 10 })
  perUserLimit: number; // bitta foydalanuvchi max nechta javob oladi

  @Column({ default: 24 })
  userCooldownHours: number; // perUserLimit tolganidan keyin necha soat kutiladi

  @Column({ default: 200 })
  dailyLimit: number; // kuniga max nechta avtomatik javob (umumiy)

  @Column({ default: 3 })
  replyDelaySeconds: number; // javob yuborishdan oldin kutish (soniya)
}
