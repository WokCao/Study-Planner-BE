import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn()
    taskId: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    userId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
        default: 'Medium',
        enum: ['High', 'Medium', 'Low']
    })
    priorityLevel: 'High' | 'Medium' | 'Low';

    @Column({ type: 'interval', nullable: true })
    estimatedTime?: string;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'Todo',
        enum: ['Todo', 'In Progress', 'Completed', 'Expired']
    })
    status: 'Todo' | 'In Progress' | 'Completed' | 'Expired';

    @Column({ type: 'timestamp', nullable: true })
    deadline?: Date;

    @CreateDateColumn()
    @Exclude()
    createdAt: Date;

    @UpdateDateColumn()
    @Exclude()
    updatedAt: Date;
}
