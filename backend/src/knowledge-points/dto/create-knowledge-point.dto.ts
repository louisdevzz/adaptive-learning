import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class KpResourceDto {
  @IsEnum(['video', 'article', 'interactive', 'quiz', 'other'])
  resourceType: 'video' | 'article' | 'interactive' | 'quiz' | 'other';

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  orderIndex: number;
}

class KpQuestionDto {
  @IsEnum(['multiple_choice', 'true_false', 'fill_blank', 'game'])
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'game';

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsEnum(['flashcard', 'matching', 'sorting'])
  gameType?: 'flashcard' | 'matching' | 'sorting';

  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class CreateKnowledgePointDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  content: any;

  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  prerequisites?: string[]; // Array of KP IDs

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpResourceDto)
  @IsOptional()
  resources?: KpResourceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpQuestionDto)
  @IsOptional()
  questions?: KpQuestionDto[];
}
