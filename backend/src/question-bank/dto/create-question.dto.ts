import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsInt,
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

  @IsInt()
  @Min(1)
  @Max(10)
  discrimination: number;

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
