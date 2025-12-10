import { IsString, IsInt, IsArray, IsOptional, IsEmail, MinLength } from 'class-validator';

export class UpdateTeacherDto {
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

  @IsArray()
  @IsOptional()
  specialization?: string[];

  @IsInt()
  @IsOptional()
  experienceYears?: number;

  @IsArray()
  @IsOptional()
  certifications?: string[];

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
