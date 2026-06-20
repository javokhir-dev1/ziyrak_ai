import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type LogType = 'success' | 'error' | 'info';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'info' })
  type: LogType;

  @Column()
  action: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  user: string;

  @CreateDateColumn()
  timestamp: Date;
}
