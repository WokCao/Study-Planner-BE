import { IsNotEmpty } from "class-validator";

export class UpdateUserDto {
    @IsNotEmpty()
    fullname: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    avatar: string
}
