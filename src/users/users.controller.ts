import { Controller, Get, Post, Body, Patch, Param, Delete, Put, NotImplementedException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { instanceToPlain } from 'class-transformer';
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
        "data": {
          response,
          "ref": `https://study-planner-be.onrender.com/api/v1/users/${createdUser.id}`
        },
        "statusCode": 201,
        "message": 'Account has been successfully created'
      }
    } catch (error: any) {
      throw new NotImplementedException("Account hasn't been created");
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
      throw new NotFoundException(`User with id=${userId} can't be found`);
    }
  }

  @Put(':id')
  async update(@Param('id') userId: number, @Body() updateUserDto: UpdateUserDto) {
    const userExist: User = await this.usersService.findOne(userId);
    if (!userExist) {
      throw new NotFoundException(`User with id=${userId} can't be found`);
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
        "message": 'All user information has been successfully updated'
      }
    } catch (error: any) {
      throw new NotImplementedException(`Information of user with id=${userId} can't be updated`);
    }
  }

  @Patch(':id/fn-change')
  changeFullname(@Param('id') id: number, @Body() changeFullname: Record<string, string>) {
    return instanceToPlain(this.usersService.changeFullname(id, changeFullname.fullname));
  }

  @Patch(':id/pw-change')
  changePassword(@Param('id') id: number, @Body() changePassword: Record<string, string>) {
    return this.usersService.changePassword(id, changePassword.password);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return instanceToPlain(this.usersService.remove(id));
  }
}
