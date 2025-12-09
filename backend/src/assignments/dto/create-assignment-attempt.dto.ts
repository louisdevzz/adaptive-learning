import { IsUUID, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateAssignmentAttemptDto {
  @IsUUID()
  @IsNotEmpty()
  studentAssignmentId: string;

  @IsEnum(['in_progress', 'abandoned', 'submitted'])
  @IsOptional()
  attemptStatus?: 'in_progress' | 'abandoned' | 'submitted';
}

export class UpdateAssignmentAttemptDto {
  @IsEnum(['in_progress', 'abandoned', 'submitted'])
  @IsOptional()
  attemptStatus?: 'in_progress' | 'abandoned' | 'submitted';

  @IsDateString()
  @IsOptional()
  endedAt?: string;
}

