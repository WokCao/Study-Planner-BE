import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
			throw new NotFoundException(`User with id=${userId} not found`);
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

	async findAll(userId: number, page: number = 1, limit: number = 10): Promise<{ data: Task[]; total: number; page: number; limit: number }> {
		const offset = (page - 1) * limit;

    const [data, total] = await this.taskRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: offset,
    });

    return {
      data,
      total,
      page,
      limit,
    };
	}

	async findOne(taskId: number, userId: number): Promise<Task> {
		return await this.taskRepository.findOne({ where: { taskId, user: { id: userId } } });
	}

    async update(taskId: number, userId: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
        // Find the task by taskId and userId
        const task = await this.findOne(taskId, userId);

        if (!task) {
            throw new NotFoundException(`Task with taskId=${taskId} and userId=${userId} can't be found`);
        }

        // Merge the updates into the task
        const updatedTask = this.taskRepository.merge(task, updateTaskDto);

        try {
            return await this.taskRepository.save(updatedTask);
        } catch (error) {
            throw new ForbiddenException(`Error updating task: ${error.message}`);
        }
    }
}
