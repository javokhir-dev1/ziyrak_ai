import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dm_counter')
export class DmCounter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  currentIndex: number;
}
