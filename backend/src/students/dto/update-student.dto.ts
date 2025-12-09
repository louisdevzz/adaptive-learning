import { IsString, IsInt, IsDateString, IsEnum, IsOptional, IsEmail, MinLength } from 'class-validator';
import { Gender } from './create-student.dto';

export class UpdateStudentDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  studentCode?: string;

  @IsInt()
  @IsOptional()
  gradeLevel?: number;

  @IsString()
  @IsOptional()
  schoolName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
