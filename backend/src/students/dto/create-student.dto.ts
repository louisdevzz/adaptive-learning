import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, IsDateString, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateStudentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  studentCode: string;

  @IsInt()
  @IsNotEmpty()
  gradeLevel: number;

  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  avatarUrl?: string;
}
