import { IsString, IsInt, IsArray, IsOptional } from 'class-validator';

export class UpdateTeacherDto {
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
