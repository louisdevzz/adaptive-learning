import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { AdminLevel } from './create-admin.dto';

export class UpdateAdminDto {
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
