import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
        throw new ConflictException('Duplicate username or email');
      } else {
        throw new InternalServerErrorException('Database errors occur. Please try again...');
      }
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.findOneBy({ id });
  }

  async changeFullname(id: number, fullname: string): Promise<User> {
    const user: User = await this.userRepository.findOne({ where: { id }});
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    try {
      await this.userRepository.update(id, { fullname: fullname });
      return user;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changePassword(id: number, password: string): Promise<string> {
    const user: User = await this.userRepository.findOne({ where: { id } });

    if (user && await bcrypt.compare(password, user.password)) {
      const hashedPassword = await bcrypt.hash(password, 10);
      try {
        await this.userRepository.update(id, { password: hashedPassword });
        return 'Successfully';
      } catch (error: any) {
        throw new InternalServerErrorException(error.message);
      }
    } else {
      throw new NotFoundException(`User with ID ${id} not found or password is incorrect`)
    }
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete({ id });
  }
}
