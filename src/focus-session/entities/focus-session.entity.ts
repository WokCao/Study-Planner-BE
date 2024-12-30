import { Task } from "src/tasks/entities/task.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('progress')
export class Progress {
    @PrimaryGeneratedColumn()
    progressId: bigint;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Task, (task) => task.taskId, { onDelete: 'CASCADE' })
    task: Task;

    @Column({ type: 'interval' })
    completionTime: Date;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    status: string;
}