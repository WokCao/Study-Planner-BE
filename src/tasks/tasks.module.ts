import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { RedisModule } from 'src/redis/redis.module';

@Module({
	controllers: [TasksController],
	providers: [TasksService],
	exports: [TasksService],
	imports: [
		TypeOrmModule.forFeature([Task]),
        TypeOrmModule.forFeature([User]), // Import orm module in order to use entity,
		RedisModule
	]
})
export class TasksModule {}
