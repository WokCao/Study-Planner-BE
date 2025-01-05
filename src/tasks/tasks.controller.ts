import { Controller, Post, Body, UnauthorizedException, InternalServerErrorException, BadRequestException, ValidationPipe, Get, Param, NotFoundException, UseGuards, Req, Query, Put, ParseIntPipe, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { AuthenGuard } from '../auth/auth.guard';

@Controller('api/v1/tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @UseGuards(AuthenGuard)
    @Post()
    async create(@Body(new ValidationPipe()) createTaskDto: CreateTaskDto, @Req() req: any) {
        try {
            const createdTask: Task = await this.tasksService.create(createTaskDto, req.user.sub);
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
            if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Post('in-interval')
    async findTasksInInterval(@Body() body: any, @Req() req: any) {
        try {
            const startDate = new Date(body.startDate);
            const endDate = new Date(body.endDate);
            const localStartDate = new Date(startDate.getTime() + 7 * 60 * 60 * 1000);
            /**
             * Get the end of date
             */
            const localEndDate = new Date(endDate.getTime() + 7 * 60 * 60 * 1000 + 86399000);
            const response = await this.tasksService.findTasksInInterval(req.user.sub, localStartDate, localEndDate);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get('all')
    async findAll(@Req() req: any) {
        try {
            const response = await this.tasksService.findAll(req.user.sub);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get('recent')
    async findRecent(@Req() req: any) {
        try {
            const response = await this.tasksService.findRecent(req.user.sub);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get('task-creations-by-year/:year')
    async findTaskCreations(@Param('year') year: number, @Req() req: any) {
        try {
            const response = await this.tasksService.findTaskCreations(year, req.user.sub);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get('task-deadline-by-year/:year')
    async findTaskDeadline(@Param('year') year: number, @Req() req: any) {
        try {
            const response = await this.tasksService.findTaskDeadline(year, req.user.sub);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get('this-month/page/:page')
    async findThisMonth(@Req() req: any, @Param('page', ParseIntPipe) page: number) {
        try {
            const response = await this.tasksService.findThisMonth(req.user.sub, page);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get('other-months/page/:page')
    async findOtherMonths(@Req() req: any, @Param('page', ParseIntPipe) page: number) {
        try {
            const response = await this.tasksService.findOtherMonths(req.user.sub, page);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get('user/:id')
    async findOne(@Param('id') taskId: number, @Req() req: any) {
        try {
            const task: Task = await this.tasksService.findOne(taskId, req.user.sub);
            const { user, updatedAt, createdAt, ...response } = task;
            return {
                data: {
                    response,
                    ref: `https://study-planner-be.onrender.com/api/v1/tasks/${taskId}`
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Put(':id')
    async updateTask(@Param('id', ParseIntPipe) taskId: number, @Body(new ValidationPipe({ whitelist: true })) updateTaskDto: UpdateTaskDto, @Req() req: any) {
        try {
            const response = await this.tasksService.update(taskId, req.user.sub, updateTaskDto);
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 404) {
                throw new NotFoundException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Delete(':id')
    async deleteTask(@Param('id', ParseIntPipe) taskId: number, @Req() req: any) {
        try {
            await this.tasksService.delete(taskId, req.user.sub);
            return {
                statusCode: 200,
                message: `Task with id=${taskId} has been successfully deleted`
            }
        } catch (error: any) {
            if (error.statusCode === 404) {
                throw new NotFoundException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
}
