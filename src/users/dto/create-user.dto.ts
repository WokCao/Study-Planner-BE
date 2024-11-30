import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    fullname: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    confirmPassword: string;
}
