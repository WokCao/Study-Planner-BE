import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    fullname?: string;

    @IsOptional()
    @IsString()
    oldPassword?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;
}
