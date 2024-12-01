import { Controller, Request, Get, UseGuards, Body, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException, Headers } from '@nestjs/common';
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

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Headers('Authorization') authHeader: string): Promise<{ message: string }> {
        const token = authHeader.replace('Bearer ', '');
        await this.authService.logout(token);
        return { message: 'Logged out successfully' };
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
