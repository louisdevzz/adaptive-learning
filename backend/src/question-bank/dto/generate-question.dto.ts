import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class GenerateQuestionDto {
  @IsString()
  @IsNotEmpty()
  knowledgePointTitle: string;

  @IsString()
  @IsOptional()
  knowledgePointDescription?: string;

  @IsEnum(['openai', 'gemini', 'kimi-code', 'kimi'])
  @IsOptional()
  aiModel?: 'openai' | 'gemini' | 'kimi-code' | 'kimi';

  @IsEnum(['multiple_choice', 'true_false', 'fill_in_blank', 'short_answer'])
  @IsNotEmpty()
  questionType:
    | 'multiple_choice'
    | 'true_false'
    | 'fill_in_blank'
    | 'short_answer';

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  difficulty: number;

  @IsUUID()
  @IsOptional()
  skillId?: string;
}
