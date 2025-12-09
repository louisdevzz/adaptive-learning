import { IsString, IsEnum, IsOptional, IsArray, IsUUID, IsEmail, MinLength } from 'class-validator';
import { RelationshipType } from './create-parent.dto';

export class UpdateParentDto {
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
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(RelationshipType)
  @IsOptional()
  relationshipType?: RelationshipType;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  studentIds?: string[];
}
