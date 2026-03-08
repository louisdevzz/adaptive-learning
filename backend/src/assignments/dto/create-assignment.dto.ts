import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsUrl,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  attachmentName?: string;

  @IsString()
  @IsOptional()
  attachmentMimeType?: string;

  @IsUrl()
  @IsOptional()
  attachmentUrl?: string;

  @IsEnum(['practice', 'quiz', 'exam', 'homework', 'test', 'adaptive'])
  assignmentType:
    | 'practice'
    | 'quiz'
    | 'exam'
    | 'homework'
    | 'test'
    | 'adaptive';

  @IsBoolean()
  @IsOptional()
  aiGradingEnabled?: boolean;

  @IsString()
  @IsOptional()
  gradingRubric?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
