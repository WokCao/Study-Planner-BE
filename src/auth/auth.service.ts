import { Injectable, InternalServerErrorException, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService, private readonly redisService: RedisService) { }
    async login(loginUserDto: LoginUserDto): Promise<{ loginResponseDto: LoginResponseDto, id: number }> {
        try {
            const user = await this.usersService.login(loginUserDto);
            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            const { password, ...result } = user;
            const payload = { sub: result.id, username: result.username, email: result.email };
            const token = await this.jwtService.signAsync(payload);
            await this.redisService.saveToken(user.id, token, 120);

            return {
                loginResponseDto: {
                    token,
                    username: result.username,
                    email: result.email,
                    fullname: result.fullname,
                    avatarUrl: result.avatarUrl
                },
                id: result.id
            }
        } catch (error: any) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message);
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async logout(token: string): Promise<void> {
        const decoded = this.jwtService.decode(token) as any;
        const ttl = Math.floor((decoded.exp * 1000 - Date.now()) / 1000);
        try {
            await this.redisService.blacklistToken(token, ttl);
        } catch (error: any) {
            throw new NotImplementedException(error.message);
        }
    }
}
