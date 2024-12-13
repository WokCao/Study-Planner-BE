import { Controller, Post, Body, UnauthorizedException, InternalServerErrorException, BadRequestException, ValidationPipe, Get, Param, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';
import { AuthenGuard } from '../auth/auth.guard';

@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

	@Post()
	async create(@Body(new ValidationPipe()) createTaskDto: CreateTaskDto) {
		try {
			const createdTask: Task = await this.tasksService.create(createTaskDto);
			const { user, updatedAt, createdAt, ...response } = createdTask;
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

	@UseGuards(AuthenGuard)
	@Get('user')
	findAll(@Req() req: any) { 
		return this.tasksService.findAll(req.user.sub);
	}

	@UseGuards(AuthenGuard)
	@Get('user/:id')
	async findOne(@Param('id') taskId: number, @Req() req: any) {
		try {
			const task: Task = await this.tasksService.findOne(taskId, req.user.sub);
			const { user, updatedAt, createdAt, ...response } = task;
			return {
				"data": {
					response,
					"ref": `https://study-planner-be.onrender.com/api/v1/tasks/${taskId}`
				},
				"statusCode": 200,
				"message": 'Successfully'
			}
		} catch (error: any) {
			throw new NotFoundException(`Task with taskId=${taskId} and userId=${req.user.sub} can't be found`);
		}
	}
}
