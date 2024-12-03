import { Injectable, InternalServerErrorException, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { GoogleAccountInfo } from './dto/google-account-info.dto';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService, private readonly redisService: RedisService) { }
    async login(loginUserDto: LoginUserDto): Promise<{ loginResponseDto: LoginResponseDto, token: string, id: number }> {
        try {
            const user = await this.usersService.login(loginUserDto);

            const { password, ...result } = user;
            const payload = { sub: result.id, fullname: result.fullname, email: result.email };
            const token = await this.jwtService.signAsync(payload);
            await this.redisService.saveToken(user.id, token, 120);

            return {
                loginResponseDto: {
                    email: result.email,
                    fullname: result.fullname,
                    avatarUrl: result.avatarUrl
                },
                token,
                id: result.id
            }
        } catch (error: any) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message);
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async signupWithGoogle(userInfo: GoogleAccountInfo) {
        try {
            const createUserDto: CreateUserDto = {
                email: userInfo.email,
                fullname: userInfo.name,
                googleAccount: true,
                avatarUrl: userInfo.picture
            }
            return await this.usersService.create(createUserDto);
        } catch (error: any) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message);
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async loginWithGoogle(email: string): Promise<{ loginResponseDto: LoginResponseDto, token: string, id: number }> {
        try {
            const user = await this.usersService.loginWithGoogle(email);
            const { password, ...result } = user;
            const payload = { sub: result.id, fullname: result.fullname, email: result.email };
            const token = await this.jwtService.signAsync(payload);
            await this.redisService.saveToken(user.id, token, 120);

            const response = {
                loginResponseDto: {
                    email: result.email,
                    fullname: result.fullname,
                    avatarUrl: result.avatarUrl
                },
                token,
                id: result.id
            }
            return response;
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
        if (ttl > 0) {
            try {
                await this.redisService.blacklistToken(token, ttl);
            } catch (error: any) {
                throw new NotImplementedException(error.message);
            }
        }
    }
}
