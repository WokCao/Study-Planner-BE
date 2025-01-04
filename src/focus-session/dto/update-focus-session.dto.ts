import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdateFocusSessionDto {
    @IsNotEmpty()
    completionTime: number;

    @IsEnum(['Completed', 'Skipped', 'Ongoing', 'Idle'], { message: 'status must be Completed, Skipped, or Idle' })
    status: 'Completed' | 'Skipped' | 'Ongoing' | 'Idle';
}