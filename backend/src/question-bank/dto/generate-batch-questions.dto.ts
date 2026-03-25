import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GenerateBatchQuestionsDto {
  @IsUUID()
  @IsNotEmpty()
  kpId: string;

  @IsInt()
  @Min(1)
  @Max(30)
  count: number;

  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;

  @IsEnum(['multiple_choice', 'true_false', 'fill_in_blank', 'short_answer'])
  questionType:
    | 'multiple_choice'
    | 'true_false'
    | 'fill_in_blank'
    | 'short_answer';

  @IsBoolean()
  @IsOptional()
  useSlides?: boolean;

  @IsBoolean()
  @IsOptional()
  useResources?: boolean;

  @IsBoolean()
  @IsOptional()
  useExistingQuestions?: boolean;

  @IsEnum(['openai', 'gemini', 'kimi-code', 'kimi'])
  @IsOptional()
  aiModel?: 'openai' | 'gemini' | 'kimi-code' | 'kimi';
}
