import { IsUUID, IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class SubmitQuestionAttemptDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsUUID()
  @IsNotEmpty()
  kpId: string;

  @IsString()
  @IsNotEmpty()
  selectedAnswer: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number; // seconds
}

