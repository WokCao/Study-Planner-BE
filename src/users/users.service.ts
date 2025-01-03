import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private jwtService: JwtService,
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
            throw new ConflictException(`Email ${createUserDto.email} has already been used`);
        }

        const { email, fullname, password, confirmPassword, googleAccount, avatarUrl } = createUserDto;
        if (password && password !== confirmPassword) {
            throw new ConflictException(`Passwords do not match`);
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const activationToken = this.jwtService.sign({ email });

        const newUser = this.userRepository.create({
            email,
            fullname,
            activationToken,
            ...(avatarUrl && { avatarUrl: avatarUrl }),
            ...(googleAccount && { isGoogleAccount: true }),
            ...(hashedPassword && { password: hashedPassword }),
        });

        try {
            await this.sendActivationEmail(email, activationToken);
            return await this.userRepository.save(newUser);
        } catch (error: any) {
            throw new InternalServerErrorException('Database errors occur. Please try again...');
        }
    }

    async sendActivationEmail(email: string, token: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            ignoreTLS: true,
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Study Planner: Activate your account',
            html: `<p>Click <a href="http://localhost:3000/api/v1/users/activate/${token}">here</a> to activate your account.</p>`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error: any) {
            console.log(error)
            throw new Error('Cannot send activation mail to user')
        }
    }

    async activateAccount(token: string): Promise<void> {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.userRepository.findOne({ where: { email: decoded.email } });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            user.isActive = true;
            user.activationToken = '';
            try {
                await this.userRepository.save(user);
            } catch (error: any) {
                throw new InternalServerErrorException('Database errors occur. Please try again...');
            }
        } catch (error) {
            throw new BadRequestException('Invalid or expired token');
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
            if (!updateUserDto.oldPassword) {
                throw new BadRequestException(`Old password not provided`);
            }

            if (!(await bcrypt.compare(updateUserDto.oldPassword, user.password))) {
                throw new BadRequestException(`Old password does not match`);
            }

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
