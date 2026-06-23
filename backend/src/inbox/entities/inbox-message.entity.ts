import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('inbox_messages')
export class InboxMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  telegram_id: string;

  @Column({ nullable: true })
  instagram_account_id: string;

  @Column({ unique: true, nullable: true })
  igMessageId: string;

  @Index()
  @Column()
  igConversationId: string;

  @Column()
  participantIgsid: string;

  // 'in' = foydalanuvchidan keldi, 'out' = biz yubordik
  @Column({ default: 'in' })
  direction: 'in' | 'out';

  @Column({ type: 'text', nullable: true })
  messageText: string;

  @Column({ nullable: true })
  fromUsername: string;

  @Column({ nullable: true, type: 'timestamptz' })
  igCreatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
