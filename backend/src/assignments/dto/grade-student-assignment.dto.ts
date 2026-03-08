import { IsInt, Min, IsEnum, IsOptional, IsString } from 'class-validator';

export class GradeStudentAssignmentDto {
  @IsInt()
  @Min(0)
  totalScore: number;

  @IsEnum(['manual', 'ai_approved'])
  @IsOptional()
  gradingSource?: 'manual' | 'ai_approved';

  @IsString()
  @IsOptional()
  approvalNote?: string;
}
