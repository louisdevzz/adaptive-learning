import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsInt,
  IsDateString,
  IsArray,
  ValidateIf,
  IsOptional
} from 'class-validator';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  ADMIN = 'admin',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
}

export enum AdminLevel {
  SUPER = 'super',
  SYSTEM = 'system',
  SUPPORT = 'support',
}

export class CreateUserDto {
  // Common fields for all roles
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

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  // Student-specific fields (required when role = 'student')
  @ValidateIf(o => o.role === 'student')
  @IsString()
  @IsNotEmpty()
  studentCode?: string;

  @ValidateIf(o => o.role === 'student')
  @IsInt()
  @IsNotEmpty()
  gradeLevel?: number;

  @ValidateIf(o => o.role === 'student')
  @IsString()
  @IsNotEmpty()
  schoolName?: string;

  @ValidateIf(o => o.role === 'student')
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth?: string;

  @ValidateIf(o => o.role === 'student')
  @IsEnum(Gender)
  @IsNotEmpty()
  gender?: Gender;

  // Teacher-specific fields (required when role = 'teacher')
  @ValidateIf(o => o.role === 'teacher')
  @IsArray()
  @IsNotEmpty()
  specialization?: string[];

  @ValidateIf(o => o.role === 'teacher')
  @IsInt()
  @IsNotEmpty()
  experienceYears?: number;

  @ValidateIf(o => o.role === 'teacher')
  @IsArray()
  @IsNotEmpty()
  certifications?: string[];

  @ValidateIf(o => o.role === 'teacher')
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ValidateIf(o => o.role === 'teacher')
  @IsString()
  @IsOptional()
  bio?: string;

  // Parent-specific fields (required when role = 'parent')
  @ValidateIf(o => o.role === 'parent')
  @IsString()
  @IsNotEmpty()
  parentPhone?: string;

  @ValidateIf(o => o.role === 'parent')
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ValidateIf(o => o.role === 'parent')
  @IsEnum(RelationshipType)
  @IsNotEmpty()
  relationshipType?: RelationshipType;

  // Admin-specific fields (required when role = 'admin')
  @ValidateIf(o => o.role === 'admin')
  @IsEnum(AdminLevel)
  @IsNotEmpty()
  adminLevel?: AdminLevel;

  @ValidateIf(o => o.role === 'admin')
  @IsArray()
  @IsNotEmpty()
  permissions?: string[];
}
