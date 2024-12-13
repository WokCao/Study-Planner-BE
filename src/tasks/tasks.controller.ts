import { Controller, Post, Body, UnauthorizedException, InternalServerErrorException, BadRequestException, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';

@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

	@Post()
	async create(@Body(new ValidationPipe()) createTaskDto: CreateTaskDto) {
		try {
			const createdTask: Task = await this.tasksService.create(createTaskDto);
			const { userId, updatedAt, createdAt, ...response } = createdTask;
			return {
				data: {
					response,
					ref: `https://study-planner-be.onrender.com/api/v1/tasks/${createdTask.taskId}`
				},
				statusCode: 201,
				message: 'Task has been successfully created'
			}
		} catch (error: any) {
			if (error.statusCode === 409) {
				throw new UnauthorizedException(error.message);
			} else if (error.statusCode === 500) {
				throw new InternalServerErrorException(error.message);
			} else {
				throw new BadRequestException(error.message);
			}
		}
	}
}
