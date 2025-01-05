import {
    Controller,
    Body,
    InternalServerErrorException,
    Post,
    UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
                throw new InternalServerErrorException(error.message);
            }
        }
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