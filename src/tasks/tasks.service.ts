import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
	) { }

	async create(createTaskDto: CreateTaskDto): Promise<Task> {
		const newTask = this.taskRepository.create(createTaskDto);
		try {
			return await this.taskRepository.save(newTask);
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}
}
