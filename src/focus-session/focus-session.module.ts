import { Module } from '@nestjs/common';
import { FocusSessionService } from './focus-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/tasks/entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import { FocusSessionController } from './focus-session.controller';
import { Progress } from './entities/focus-session.entity';

@Module({
  controllers: [FocusSessionController],
  providers: [FocusSessionService],
  exports: [FocusSessionService],
  imports: [
    TypeOrmModule.forFeature([Task]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Progress])
  ]
})
export class FocusSessionModule { }
