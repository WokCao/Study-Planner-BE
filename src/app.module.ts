import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { TasksController } from './tasks/tasks.controller';
import { TasksModule } from './tasks/tasks.module';
import { CloudStorageService } from './cloud-storage/cloud-storage.service';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
import { FocusSessionController } from './focus-session/focus-session.controller';
import { FocusSessionModule } from './focus-session/focus-session.module';
import { Progress } from './focus-session/entities/focus-session.entity';

@Module({
  imports: [UsersModule, 
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Task, Progress],
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    RedisModule,
    TasksModule,
    CloudStorageModule,
    FocusSessionModule
  ],
  controllers: [AppController, TasksController, FocusSessionController],
  providers: [AppService, CloudStorageService],
})
export class AppModule {}
