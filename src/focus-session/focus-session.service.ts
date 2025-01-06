import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { Progress } from './entities/focus-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';

@Injectable()
export class FocusSessionService {
    constructor(
        @InjectRepository(Progress)
        private readonly focusSessionRepository: Repository<Progress>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>
    ) { }

    async createFocusSession(createFocusSessionDto: CreateFocusSessionDto, userId: number): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException(`User not found`);
        }

        const task = await this.taskRepository.findOne({ where: { taskId: createFocusSessionDto.taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const checkExist = await this.focusSessionRepository.exists({
            where: {
                task: { taskId: createFocusSessionDto.taskId },
                user: { id: userId }
            },
            relations: ['task', 'user']
        });

        if (checkExist) {
            throw new ConflictException('The session of this task has been created before')
        }

        const newFocusSession = this.focusSessionRepository.create({
            status: createFocusSessionDto.status,
            completionTime: 0,
            user,
            task
        });

        try {
            return await this.focusSessionRepository.save(newFocusSession);
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateFocusSession(updateFocusSession: UpdateFocusSessionDto, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException(`User not found`);
        }

        const task = await this.taskRepository.findOne({ where: { taskId: updateFocusSession.taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        try {
            const focusSession = await this.focusSessionRepository.findOne({ where: { task: { taskId: updateFocusSession.taskId }, user: { id: userId } } });
            if (!focusSession) {
                throw new NotFoundException("Session doesn't exist");
            }
            const timeBefore = focusSession.completionTime;

            const plusTime: UpdateFocusSessionDto = {
                ...updateFocusSession,
                completionTime: updateFocusSession.completionTime + timeBefore
            }
            const updatedFocusSession = this.focusSessionRepository.merge(focusSession, plusTime);
            return await this.focusSessionRepository.save(updatedFocusSession);
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async getFocusSession(focusSessionId: number, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException(`User not found`);
        }

        try {
            const session = await this.focusSessionRepository.findOne({ where: { progressId: focusSessionId } });
            if (!session) {
                throw new NotFoundException("Session doesn't exist");
            }
            return session;
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async getAllFocusSession(year: number, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException(`User not found`);
        }

        const currentDate = new Date();

        try {
            const data = await this.focusSessionRepository
                .createQueryBuilder('progress')
                .innerJoin('progress.task', 'task')
                .select([
                    "EXTRACT(MONTH FROM task.deadline) AS month",
                    "task.priorityLevel AS priority",
                    "SUM(progress.completionTime) AS totalCompletionTime"
                ])
                .where("task.deadline < :currentDate", { currentDate })
                .andWhere("EXTRACT(YEAR FROM task.deadline) = :year", { year })
                .andWhere("progress.userId = :userId", { userId })
                .groupBy("month, task.priorityLevel")
                .orderBy("month", "ASC")
                .addOrderBy("task.priorityLevel", "ASC")
                .getRawMany();

            return data;
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
