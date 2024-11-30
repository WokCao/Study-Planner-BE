import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser: User = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword
    })

    try {
      return await this.userRepository.save(newUser);
    } catch (error: any) {
      if (error.code === '23505') {
        // Duplicate username or email error code in PostgreSQL
        throw new ConflictException(error.message);
      } else {
        throw new InternalServerErrorException('Database errors occur. Please try again...');
      }
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id: id }});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto);
    
    if (result.affected === 0) {
        throw new NotFoundError(`User with ID ${id} not found`);
    }
    
    return this.userRepository.findOneBy({ id });
  }

  async changeFullname(id: number, fullname: string) {

  }

  async changePassword(id: number, password: string) {

  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.userRepository.delete({ id });
    console.log(deleteResult)
  }
}
