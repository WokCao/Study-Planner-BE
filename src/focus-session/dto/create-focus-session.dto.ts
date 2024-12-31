import { IsEnum, IsNotEmpty } from "class-validator";

export class CreateFocusSessionDto {
    @IsNotEmpty()
    taskId: number;

    @IsEnum(['Completed', 'Ended early', 'Idle'], { message: 'status must be Completed, Ended early, or Idle' })
    status: 'Completed' | 'Ended early' | 'Idle';
}