import {
    Controller,
    Request,
    Get,
    UseGuards,
    Body,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Post,
    Req,
    UnauthorizedException,
    Headers
} from '@nestjs/common';
import { AuthenGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() signInDto: LoginUserDto,
    ): Promise<{ data?: any; statusCode: number; message: string }> {
        try {
            const user = await this.authService.login(signInDto);
            return {
                data: {
                    userInfo: user.loginResponseDto,
                    token: user.token,
                    ref: `https://study-planner-be.onrender.com/api/v1/users/${user.id}`,
                },
                statusCode: 200,
                message: 'Successfully',
            };
        } catch (error) {
            if (error.status === 401) {
                throw new UnauthorizedException(error.message);
            } else {
                throw new InternalServerErrorException(
                    'Our service is being maintained! Please try later.',
                );
            }
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(
        @Headers('Authorization') authHeader: string,
    ): Promise<{ statusCode: number; message: string }> {
        const token = authHeader.replace('Bearer ', '');
        try {
            await this.authService.logout(token);
            return {
                statusCode: 200,
                message: 'Logged out successfully',
            };
        } catch (error: any) {
            throw new InternalServerErrorException('Failed to log out! Try again.');
        }
    }

    @UseGuards(AuthenGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Post('googleInfo')
    async googleInfo(@Body() tokenObj: any) {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${tokenObj.token}`,
            },
        });

        if (response) {
            const userInfo = response.data;
            const getUser = await this.authService.loginWithGoogle(userInfo.email);

            return {
                data: {
                    userInfo: getUser.loginResponseDto,
                    token: getUser.token,
                    ref: `https://study-planner-be.onrender.com/api/v1/users/${getUser.id}`,
                },
                statusCode: 200,
                message: 'Successfully',
            }
        } else {
            throw new UnauthorizedException('Invalid token');
        }
    }

    @Post('createGoogleAccount')
    async createGoogleAccount(@Body() tokenObj: any) {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${tokenObj.token}`,
            },
        });

        if (response) {
            const userInfo = response.data;
            const createdUser = await this.authService.signupWithGoogle(userInfo);

            const { id, password, updatedAt, createdAt, ...remains } = createdUser;
            return {
                data: {
                    remains,
                    ref: `https://study-planner-be.onrender.com/api/v1/users/${createdUser.id}`
                },
                statusCode: 201,
                message: 'Account has been successfully created'
            }
        }
    }
}