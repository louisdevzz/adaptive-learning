import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateTeacherInterventionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(3000)
  description?: string;

  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed', 'dismissed'])
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority?: 'low' | 'medium' | 'high' | 'critical';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  teacherNotes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  aiConfidence?: number;
}
