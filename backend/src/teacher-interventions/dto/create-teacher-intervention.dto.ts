import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTeacherInterventionDto {
  @IsUUID()
  studentId!: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsIn(['ai_suggestion', 'manual', 'recommendation_override'])
  type!: 'ai_suggestion' | 'manual' | 'recommendation_override';

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(3000)
  description!: string;

  @IsOptional()
  @IsArray()
  suggestedActions?: unknown[];

  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed', 'dismissed'])
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority?: 'low' | 'medium' | 'high' | 'critical';

  @IsOptional()
  @IsArray()
  relatedKpIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  aiConfidence?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  teacherNotes?: string;
}
