import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import * as dotenv from 'dotenv';
import { RedisModule } from 'src/redis/redis.module';
import { GoogleStrategy } from './google.strategy';
import { PassportModule } from '@nestjs/passport';
dotenv.config();

@Module({
  imports: [UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANT,
      signOptions: { expiresIn: '3600s' },
    }),
    RedisModule,
    PassportModule.register({ defaultStrategy: 'google' })
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy]
})
export class AuthModule {}
