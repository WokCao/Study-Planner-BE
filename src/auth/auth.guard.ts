import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as dotenv from 'dotenv';
import { RedisService } from 'src/redis/redis.service';
dotenv.config();

@Injectable()
export class AuthenGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token has expired');
        }

        const checkValidToken = await this.redisService.isTokenBlacklisted(token);
        if (checkValidToken) {
            throw new BadRequestException('Token is no longer in use');
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_CONSTANT
                }
            );
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
