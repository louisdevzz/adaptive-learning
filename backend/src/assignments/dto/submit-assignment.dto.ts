import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuestionAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  answer: any; // Can be string, number, array depending on question type
}

export class SubmitAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentAssignmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  @IsOptional()
  answers?: QuestionAnswerDto[];

  @IsUrl()
  @IsOptional()
  submissionUrl?: string;

  @IsString()
  @IsOptional()
  submissionName?: string;

  @IsString()
  @IsOptional()
  submissionMimeType?: string;
}
