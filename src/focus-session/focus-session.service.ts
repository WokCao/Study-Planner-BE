import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
        private readonly taskRepository: Repository<Task>,
    ) { }

    async createFocusSession(createFocusSessionDto: CreateFocusSessionDto, userId: number): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        const task = await this.taskRepository.findOne({ where: { taskId: createFocusSessionDto.taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
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

    async updateFocusSession(taskId: number, updateFocusSession: UpdateFocusSessionDto, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        const task = await this.taskRepository.findOne({ where: { taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        
        try {
            const focusSession = await this.getFocusSession(taskId, userId);
            const updatedFocusSession = this.focusSessionRepository.merge(focusSession, updateFocusSession);
            return await this.focusSessionRepository.save(updatedFocusSession);
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getFocusSession(taskId: number, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        const task = await this.taskRepository.findOne({ where: { taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        try {
            return await this.focusSessionRepository.findOne({ where: { task: { taskId }, user: { id: userId } } });
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
