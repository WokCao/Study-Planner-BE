import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }
    async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
        try {
            const user = await this.usersService.login(loginUserDto);
            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            const { password, ...result } = user;
            const payload = { sub: result.id, username: result.username, email: result.email };
            return {
                access_token: await this.jwtService.signAsync(payload)
            }
        } catch (error: any) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message);
            }
            throw new InternalServerErrorException(error);
        }
    }
}
