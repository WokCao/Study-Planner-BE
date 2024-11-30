import { Controller, Request, Get, UseGuards, Body, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';

@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() signInDto: LoginUserDto) {
        try {
            const user = await this.authService.login(signInDto);
            return {
                "data": {
                    userInfo: user.loginResponseDto,
                    "ref": `https://study-planner-be.onrender.com/api/v1/users/${user.id}`
                },
                "statusCode": 200,
             };
        } catch (error) {
            if (error.status === 401) {
                throw new UnauthorizedException(error.message);
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
