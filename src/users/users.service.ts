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
import { randomBytes } from 'crypto';
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
                if (user.isActive) {
                    return user;
                } else {
                    throw new BadRequestException("The email hasn't been activated yet. Please click the link in the email.")
                }
            }

            throw new UnauthorizedException('Password is wrong');
        } catch (error) {
            if (error.status === 400) throw new BadRequestException(error.message);
            else if (error.status === 401) throw new UnauthorizedException(error.message);
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
            await this.sendActivationEmail(email, activationToken, 0);
            return await this.userRepository.save(newUser);
        } catch (error: any) {
            throw new InternalServerErrorException('Database errors occur. Please try again...');
        }
    }

    async sendActivationEmail(email: string, token: string, type: number): Promise<void> {
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
            subject: 'StudyGem: Activate your account',
            html: `<p>Click <a href="http://localhost:3000/api/v1/users/activate/${token}">here</a> to activate your account.</p>`,
        };

        if (type === 1) {
            mailOptions.subject = 'StudyGem: Reset your password';
            mailOptions.html = `
            <div>
                <p>This is your new password. Please don't reveal to anyone and remember to <i>change</i> your password after login</p>
                <p>Password: <strong>${token}</strong></p>
            </div>
            `
        }

        try {
            await transporter.sendMail(mailOptions);
        } catch (error: any) {
            if (error.responseCode === 550 || error.code === 'EENVELOPE') {
                throw new Error('Invalid email address provided.');
            } else {
                throw new Error(`An error occurred while sending the ${type === 0 ? 'activation' : 'reset-password'} email.`);
            }
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

    async resetPassword(email: string) {
        try {
            const user = await this.userRepository.findOne({ where: { email } });

            if (user === null) {
                throw new UnauthorizedException('Email doesn\'t exist');
            }

            const rawToken = randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(rawToken, 10);

            user.password = hashedPassword;
            await this.userRepository.save(user);
            await this.sendActivationEmail(email, rawToken, 1);
        } catch (error) {
            if (error.status === 401) throw new UnauthorizedException(error.message);
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
