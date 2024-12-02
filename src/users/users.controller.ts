import { Controller, Get, Post, Body, Patch, Param, Delete, Put, NotImplementedException, NotFoundException, Header, Headers, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
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
      }
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') userId: number) {
    try {
      const user: User = await this.usersService.findOne(userId);
      const { id, password, updatedAt, createdAt, ...response } = user;
      return {
        "data": {
          response,
          "ref": `https://study-planner-be.onrender.com/api/v1/users/${userId}`
        },
        "statusCode": 200,
        "message": 'Successfully'
      }
    } catch (error: any) {
      throw new NotFoundException(`Account with id=${userId} can't be found`);
    }
  }

  @Put(':id')
  async update(@Param('id') userId: number, @Body() updateUserDto: UpdateUserDto) {
    const userExist: User = await this.usersService.findOne(userId);
    if (!userExist) {
      throw new NotFoundException(`Account with id=${userId} can't be found`);
    }

    try {
      const user: User = await this.usersService.update(userId, updateUserDto);
      const { id, password, updatedAt, createdAt, ...response } = user;
      return {
        "data": {
          response,
          "ref": `https://study-planner-be.onrender.com/api/v1/users/${userId}`
        },
        "statusCode": 200,
        "message": 'All account information has been successfully updated'
      }
    } catch (error: any) {
      throw new NotImplementedException(`Information of account with id=${userId} can't be updated`);
    }
  }

  @Patch(':id/fn-change')
  async changeFullname(@Param('id') userId: number, @Body() changeFullname: Record<string, string>) {
    const userExist: User = await this.usersService.findOne(userId);
    if (!userExist) {
      throw new NotFoundException(`Account with id=${userId} can't be found`);
    }

    try {
      const user: User = await this.usersService.changeFullname(userId, changeFullname.fullname);
      const { id, password, updatedAt, createdAt, ...response } = user;
      return {
        "data": {
          response,
          "ref": `https://study-planner-be.onrender.com/api/v1/users/${userId}`
        },
        "statusCode": 200,
        "message": "Account's fullname has been successfully updated"
      }
    } catch (error: any) {
      throw new NotImplementedException(`Fullname of account with id=${userId} can't be updated`);
    }
  }

  @Patch(':id/pw-change')
  async changePassword(@Param('id') userId: number, @Body() changePassword: Record<string, string>) {
    const userExist: User = await this.usersService.findOne(userId);
    if (!userExist) {
      throw new NotFoundException(`Account with id=${userId} can't be found`);
    }

    try {
      const user: User = await this.usersService.changePassword(userId, changePassword.password);
      const { id, password, updatedAt, createdAt, ...response } = user;
      return {
        "data": {
          response,
          "ref": `https://study-planner-be.onrender.com/api/v1/users/${userId}`
        },
        "statusCode": 200,
        "message": "Account's password has been successfully updated"
      }
    } catch (error: any) {
      throw new NotImplementedException(`Password of account with id=${userId} can't be updated`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.usersService.remove(id);
      return {
        "statusCode": 200,
        "message": `User with id=${id} has been successfully deleted`
      }
    } catch (error: any) {
      throw new NotImplementedException(`Account with id=${id} can't be deleted`);
    }

  }
}
