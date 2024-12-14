import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email: loginUserDto.email } });

      if (user === null) {
        throw new UnauthorizedException('Email doesn\'t exist');
      }

      if (user && await bcrypt.compare(loginUserDto.password, user.password)) {
        return user;
      }

      throw new UnauthorizedException('Password is wrong');
    } catch (error) {
      if (error.status === 401) throw new UnauthorizedException(error.message);
      throw new InternalServerErrorException('Database errors occur. Please try again...');
    }
  }

  async loginWithGoogle(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email, isGoogleAccount: true } });

      if (user === null) {
        throw new UnauthorizedException('Email doesn\'t exist');
      }

      return user;
    } catch (error) {
      if (error.status === 401) throw new UnauthorizedException(error.message);
      throw new InternalServerErrorException('Database errors occur. Please try again...');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const validateEmail: User = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (validateEmail) {
      throw new ConflictException(`Email: ${createUserDto.email} has been used. Please try another email`);
    }

    const { email, fullname, password, confirmPassword, googleAccount, avatarUrl } = createUserDto;
    if (password && password !== confirmPassword) return null;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const newUser = this.userRepository.create({
      email,
      fullname,
      ...(avatarUrl && { avatarUrl: avatarUrl }),
      ...(googleAccount && { isGoogleAccount: true }),
      ...(hashedPassword && { password: hashedPassword }),
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error: any) {
      throw new InternalServerErrorException('Database errors occur. Please try again...');
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User can't be found`);
    }

    if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const result = this.userRepository.merge(user, updateUserDto);

    try {
        return await this.userRepository.save(result);
    } catch (error) {
        throw new ForbiddenException(`Error updating user: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete({ id });
  }
}
