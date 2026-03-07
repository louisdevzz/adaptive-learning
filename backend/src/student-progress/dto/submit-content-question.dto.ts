import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class SubmitContentQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  kpId: string;

  @IsString()
  @IsNotEmpty()
  questionIndex: string; // e.g. "content-q-0"

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number; // seconds

  @IsOptional()
  @IsInt()
  @Min(0)
  totalQuestions?: number; // total content questions in this KP
}
