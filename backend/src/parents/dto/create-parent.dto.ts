import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
}

export class CreateParentDto {
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
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(RelationshipType)
  @IsNotEmpty()
  relationshipType: RelationshipType;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one student must be selected' })
  studentIds: string[];
}
