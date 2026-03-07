import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';

export enum AdminLevel {
  SUPER = 'super',
  SYSTEM = 'system',
  SUPPORT = 'support',
}

export class CreateAdminDto {
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

  @IsEnum(AdminLevel)
  @IsNotEmpty()
  adminLevel: AdminLevel;

  @IsArray()
  @IsNotEmpty()
  permissions: string[];

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
