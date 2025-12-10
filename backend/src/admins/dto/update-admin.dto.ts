import { IsString, IsEnum, IsArray, IsOptional, IsEmail, MinLength } from 'class-validator';
import { AdminLevel } from './create-admin.dto';

export class UpdateAdminDto {
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

  @IsEnum(AdminLevel)
  @IsOptional()
  adminLevel?: AdminLevel;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
