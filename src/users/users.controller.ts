import { Controller, Get, Post, Body, Patch, Param, Delete, Put, NotImplementedException } from '@nestjs/common';
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
  findOne(@Param('id') id: number) {
    return instanceToPlain(this.usersService.findOne(id));
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return instanceToPlain(this.usersService.update(id, updateUserDto));
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
