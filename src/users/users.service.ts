import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users = []; // Mock database
  create(createUserDto: CreateUserDto) {
    const validateEmail = this.users.find(user => user.email === createUserDto.email);
    if (validateEmail) {
      throw new ConflictException('Email already exists');
    }

    const validateUsername = this.users.find(user => user.username === createUserDto.username);
    if (validateUsername) {
      throw new ConflictException('Username already exists');
    }
    
    const newUser = { id: Date.now(), ...createUserDto };
    this.users.push(newUser);
    return newUser;
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(user => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex >= 0) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
      return this.users[userIndex];
    }
    return null;
  }

  remove(id: number) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex >= 0) {
      const [removedUser] = this.users.splice(userIndex, 1);
      return removedUser;
    }
    return null;
  }
}
