import { IsString, IsEnum, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsEnum(['time', 'allday'])
  category: 'time' | 'allday';

  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsEnum(['Todo', 'In Progress', 'Completed', 'Expired'])
  status: 'Todo' | 'In Progress' | 'Completed' | 'Expired';
}
