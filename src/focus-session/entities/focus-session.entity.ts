import { Exclude } from "class-transformer";
import { Task } from "src/tasks/entities/task.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('progress')
export class Progress {
    @PrimaryGeneratedColumn()
    progressId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToOne(() => Task, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskId' })
    task: Task;

    @Column()
    completionTime: number;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
        default: 'Idle',
        enum: ['Completed', 'Skipped', 'Ongoing', 'Idle']
    })
    status: 'Completed' | 'Skipped' | 'Ongoing' | 'Idle';

    @CreateDateColumn()
    @Exclude()
    createdAt: Date;
}