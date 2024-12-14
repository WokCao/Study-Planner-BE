import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low'], { message: 'priorityLevel must be High, Medium, or Low' })
  priorityLevel?: 'High' | 'Medium' | 'Low';

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  @IsEnum(['Todo', 'In Progress', 'Completed', 'Expired'], { message: 'status must be Todo, In Progress, Completed, or Expired' })
  status?: 'Todo' | 'In Progress' | 'Completed' | 'Expired';

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
