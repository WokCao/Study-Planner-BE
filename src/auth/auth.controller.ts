import { Controller, Request, Get, UseGuards, Body, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException, Headers } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';

@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() signInDto: LoginUserDto): Promise<{ data?: any, statusCode: number, message: string }> {
        try {
            const user = await this.authService.login(signInDto);
            console.log('passed')
            return {
                data: {
                    userInfo: user.loginResponseDto,
                    ref: `https://study-planner-be.onrender.com/api/v1/users/${user.id}`
                },
                statusCode: 200,
                message: 'Successfully'
            };
        } catch (error) {
            if (error.status === 401) {
                throw new UnauthorizedException(error.message);
            } else {
                throw new InternalServerErrorException('Our service is being maintained! Please try later.');
            }
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Headers('Authorization') authHeader: string): Promise<{ statusCode: number, message: string }> {
        const token = authHeader.replace('Bearer ', '');
        try {
            await this.authService.logout(token);
            return {
                statusCode: 200,
                message: 'Logged out successfully'
            };
        } catch (error: any) {
            throw new InternalServerErrorException('Failed to log out! Try again.');
        }
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
