import { Controller, Get, Post, Body, Delete, Put, NotFoundException, UnauthorizedException, InternalServerErrorException, UseGuards, Req, ValidationPipe, ForbiddenException, BadRequestException, UseInterceptors, UploadedFile, Param, Headers, NotImplementedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthenGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('api/v1/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly cloudStorageService: CloudStorageService) { }

    @Post()
    async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
        try {
            const createdUser: User = await this.usersService.create(createUserDto);
            const { id, password, updatedAt, createdAt, ...response } = createdUser;
            return {
                data: {
                    response,
                    ref: `https://study-planner-be.onrender.com/api/v1/users/${createdUser.id}`
                },
                statusCode: 201,
                message: 'Account has been successfully created'
            }
        } catch (error: any) {
            if (error.statusCode === 409) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else if (error.statusCode === 501) {
                throw new NotImplementedException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Get('activate/:token')
    async activateAccount(@Param('token') token: string) {
        try {
            await this.usersService.activateAccount(token);
            return `<p>Your account has been activated successfully. Back to <a href="${process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.FE_HOST}/Study-Planner-FE/login">Login</a> page.</p>`
        } catch (error: any) {
            if (error.statusCode === 404) {
                throw new NotFoundException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Post('reset-password')
    async resetPassword(@Body(new ValidationPipe()) body: ResetPasswordDto) {
        try {
            await this.usersService.resetPassword(body.email);
            return {
                statusCode: 200,
                message: 'New password has been sent to your email. Please change it after having logged in'
            }
        } catch (error: any) {
            if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Get()
    async findOne(@Req() req: any) {
        try {
            const user: User = await this.usersService.findOne(req.user.sub);
            const { id, password, updatedAt, createdAt, ...response } = user;
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'Successfully'
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Put()
    async update(@Req() req: any, @Body(new ValidationPipe({ whitelist: true })) updateUserDto: UpdateUserDto) {
        try {
            const user: User = await this.usersService.update(req.user.sub, updateUserDto);
            const { id, password, updatedAt, createdAt, ...response } = user;
            return {
                data: {
                    response
                },
                statusCode: 200,
                message: 'All account information has been successfully updated'
            }
        } catch (error: any) {
            if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Put('/updateAvatar')
    @UseInterceptors(FileInterceptor('file'))
    async updateAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
        try {
            const imageUrl = await this.cloudStorageService.uploadImage(file, req.user.sub);
            const updateUserDto: UpdateUserDto = {
                avatarUrl: imageUrl
            }

            const extractAvatar: User = await this.usersService.findOne(req.user.sub);
            const { avatarUrl, ...remains } = extractAvatar;
            await this.cloudStorageService.deleteImage(avatarUrl);

            const user: User = await this.usersService.update(req.user.sub, updateUserDto);
            return {
                data: user.avatarUrl,
                statusCode: 200,
                message: 'Avatar updated successfully',
            };
        } catch (error) {
            if (error.statusCode === 400) {
                throw new BadRequestException(error.message);
            } else if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new NotImplementedException('Failed to change avatar. Please try again');
            }
        }
    }

    @UseGuards(AuthenGuard)
    @Delete()
    async remove(@Req() req: any) {
        try {
            await this.usersService.remove(req.user.sub);
            return {
                statusCode: 200,
                message: `User has been successfully deleted`
            }
        } catch (error: any) {
            if (error.statusCode === 500) {
                throw new InternalServerErrorException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }

    @Get('logout')
    async logout(
        @Headers('Authorization') authHeader: string,
    ): Promise<{ statusCode: number; message: string }> {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new BadRequestException('Authorization header is missing or malformed');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            await this.usersService.logout(token);
            return {
                statusCode: 200,
                message: 'Logged out successfully',
            };
        } catch (error: any) {
            if (error.statusCode === 401) {
                throw new UnauthorizedException(error.message);
            } else if (error.statusCode === 501) {
                throw new NotImplementedException(error.message);
            } else {
                throw new BadRequestException(error.message);
            }
        }
    }
}
