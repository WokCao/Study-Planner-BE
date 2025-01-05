import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { CloudStorageModule } from 'src/cloud-storage/cloud-storage.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]), // Import orm module in order to use entity
    CloudStorageModule,
    RedisModule
  ]
})
export class UsersModule {}
