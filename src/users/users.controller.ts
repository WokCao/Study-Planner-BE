import { Controller, Get, Post, Body, Delete, Put, NotFoundException, UnauthorizedException, InternalServerErrorException, UseGuards, Req, ValidationPipe, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthenGuard } from '../auth/auth.guard';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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
        "data": {
          response
        },
        "statusCode": 200,
        "message": 'Successfully'
      }
    } catch (error: any) {
      throw new NotFoundException(`User can't be found`);
    }
  }

	@UseGuards(AuthenGuard)
  @Put()
  async update(@Req() req: any, @Body(new ValidationPipe({ whitelist: true })) updateUserDto: UpdateUserDto) {
    try {
      const user: User = await this.usersService.update(req.user.sub, updateUserDto);
      const { id, password, updatedAt, createdAt, ...response } = user;
      return {
        "data": {
          response
        },
        "statusCode": 200,
        "message": 'All account information has been successfully updated'
      }
    } catch (error: any) {
      throw error;
    }
  }

	@UseGuards(AuthenGuard)
  @Delete()
  async remove(@Req() req: any) {
    try {
      await this.usersService.remove(req.user.sub);
      return {
        "statusCode": 200,
        "message": `User has been successfully deleted`
      }
    } catch (error: any) {
      throw new ForbiddenException(`User can't be deleted`);
    }
  }
}
