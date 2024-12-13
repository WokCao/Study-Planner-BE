import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity'

@Module({
	controllers: [TasksController],
	providers: [TasksService],
	exports: [TasksService],
	imports: [
		TypeOrmModule.forFeature([Task]) // Import orm module in order to use entity
	]
})
export class TasksModule {}
