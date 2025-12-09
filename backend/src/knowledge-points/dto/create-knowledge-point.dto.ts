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
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class CreateKnowledgePointDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  prerequisites?: string[]; // Array of KP IDs

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpResourceDto)
  @IsOptional()
  resources?: KpResourceDto[];
}
