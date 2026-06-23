import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('inbox_conversations')
@Index(['igConversationId', 'instagram_account_id'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  telegram_id: string;

  @Column({ nullable: true })
  instagram_account_id: string;

  @Column()
  igConversationId: string;

  @Column()
  participantIgsid: string;

  @Column({ default: '' })
  participantUsername: string;

  @Column({ nullable: true })
  participantName: string;

  @Column({ nullable: true })
  participantProfilePic: string;

  @Column({ nullable: true })
  lastMessage: string;

  @Column({ nullable: true, type: 'timestamptz' })
  lastMessageAt: Date;

  @Column({ default: 0 })
  unreadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
