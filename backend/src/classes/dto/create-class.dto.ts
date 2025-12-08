import { IsString, IsNotEmpty, IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  className: string;

  @IsInt()
  @IsNotEmpty()
  gradeLevel: number;

  @IsString()
  @IsNotEmpty()
  schoolYear: string; // "2024-2025"

  @IsUUID()
  @IsOptional()
  homeroomTeacherId?: string;
}
