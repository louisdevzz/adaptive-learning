import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, IsArray, IsOptional } from 'class-validator';

export class CreateTeacherDto {
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

  @IsArray()
  @IsNotEmpty()
  specialization: string[]; // ["math", "physics"]

  @IsInt()
  @IsNotEmpty()
  experienceYears: number;

  @IsArray()
  @IsNotEmpty()
  certifications: string[];

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
