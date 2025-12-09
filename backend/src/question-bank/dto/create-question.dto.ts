import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuestionMetadataDto {
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  discrimination: number; // IRT parameter (0-1): 0.2-0.39=avg, 0.4-0.69=good, 0.7-1.0=excellent

  @IsUUID()
  @IsNotEmpty()
  skillId: string; // KP ID

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsInt()
  @Min(1)
  estimatedTime: number; // seconds
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsNotEmpty()
  options: any; // JSON - can be array for multiple choice, object for other types

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @IsEnum(['multiple_choice', 'true_false', 'short_answer', 'multi_select'])
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'multi_select';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateNested()
  @Type(() => QuestionMetadataDto)
  @IsNotEmpty()
  metadata: QuestionMetadataDto;
}
