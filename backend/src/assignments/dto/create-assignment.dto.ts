import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class AssignmentQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsInt()
  @Min(1)
  points: number;
}

export class CreateAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['practice', 'quiz', 'exam', 'adaptive'])
  assignmentType: 'practice' | 'quiz' | 'exam' | 'adaptive';

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentQuestionDto)
  @IsOptional()
  questions?: AssignmentQuestionDto[];
}
