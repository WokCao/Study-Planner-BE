import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }
    async login(loginUserDto: LoginUserDto): Promise<{ loginResponseDto: LoginResponseDto, id: number }> {
        try {
            const user = await this.usersService.login(loginUserDto);
            console.log(user)
            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            const { password, ...result } = user;
            const payload = { sub: result.id, username: result.username, email: result.email };
            return {
                loginResponseDto: {
                    token: await this.jwtService.signAsync(payload),
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
            throw new InternalServerErrorException(error);
        }
    }
}
