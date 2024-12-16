import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Between, MoreThan, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) { }

	async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
		// Fetch the User entity using user_id
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException(`User not found`);
		}

		// Create the new task and assign the user relation
		const newTask = this.taskRepository.create({
			...createTaskDto,
			user,
		});

		try {
			return await this.taskRepository.save(newTask);
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async findRecent(userId: number): Promise<{ data: Task[]; total: number }> {
        const [data, total] = await this.taskRepository.findAndCount({
            where: { user: { id: userId }, deadline: MoreThan(new Date()) },
            order: { deadline: 'ASC' },
            take: 5,
        });

        return {
            data,
            total
        };
	}

    async findThisMonth(userId: number, page: number = 1): Promise<{ data: Task[]; total: number; page: number }> {
        if (page < 1) {
            throw new BadRequestException('Page number must be 1 or higher');
        }

        const tasksPerPage = 5;
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const [data, total] = await this.taskRepository.findAndCount({
            where: {
                user: { id: userId },
                deadline: And(
                    Between(startOfMonth, endOfMonth),
                    MoreThan(currentDate)
                ),
            },
            order: { deadline: 'ASC' },
            skip: (page - 1) * tasksPerPage, // Skip tasks of previous pages
            take: tasksPerPage, // Limit tasks per page
        });

        return {
            data,
            total,
            page
        };
    }

    async findOtherMonths(userId: number, page: number = 1): Promise<{ data: Task[]; total: number; page: number }> {
        if (page < 1) {
            throw new BadRequestException('Page number must be 1 or higher');
        }

        const tasksPerPage = 5;
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const [data, total] = await this.taskRepository
            .createQueryBuilder('task')
            .where('task.userId = :userId', { userId })
            .andWhere(
                '(task.deadline < :startOfMonth OR task.deadline > :endOfMonth)',
                { startOfMonth, endOfMonth },
            )
            .orderBy('task.deadline', 'ASC')
            .skip((page - 1) * tasksPerPage)
            .take(tasksPerPage)
            .getManyAndCount();

        return {
            data,
            total,
            page
        };
    }

	async findOne(taskId: number, userId: number): Promise<Task> {
		return await this.taskRepository.findOne({ where: { taskId, user: { id: userId } } });
	}

    async update(taskId: number, userId: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
        // Find the task by taskId and userId
        const task = await this.findOne(taskId, userId);

        if (!task) {
            throw new NotFoundException(`Task with id=${taskId} can't be found for the specified user`);
        }

        // Merge the updates into the task
        const updatedTask = this.taskRepository.merge(task, updateTaskDto);

        try {
            return await this.taskRepository.save(updatedTask);
        } catch (error) {
            throw new ForbiddenException(`Error updating task: ${error.message}`);
        }
    }

    async delete(taskId: number, userId: number): Promise<void> {
        // Find the task by taskId and userId
        const task = await this.findOne(taskId, userId);

        if (!task) {
            throw new NotFoundException(`Task with id=${taskId} can't be found for the specified user`);
        }

        try {
            await this.taskRepository.delete(taskId);
        } catch (error) {
            throw new ForbiddenException(`Error deleting task: ${error.message}`);
        }
    }
}
