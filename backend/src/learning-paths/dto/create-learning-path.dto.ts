import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class LearningPathItemDto {
  @IsEnum(['kp', 'section', 'assignment'])
  itemType: 'kp' | 'section' | 'assignment';

  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsEnum(['not_started', 'in_progress', 'completed'])
  @IsOptional()
  status?: 'not_started' | 'in_progress' | 'completed';
}

export class CreateLearningPathDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(['system', 'teacher', 'student'])
  createdBy: 'system' | 'teacher' | 'student';

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['active', 'paused', 'completed'])
  @IsOptional()
  status?: 'active' | 'paused' | 'completed';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LearningPathItemDto)
  @IsOptional()
  items?: LearningPathItemDto[];
}
