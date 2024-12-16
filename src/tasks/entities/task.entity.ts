import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['time', 'allday'], default: 'time' })
  category: 'time' | 'allday';

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ type: 'enum', enum: ['Todo', 'In Progress', 'Completed', 'Expired'], default: 'Todo' })
  status: 'Todo' | 'In Progress' | 'Completed' | 'Expired';
}
