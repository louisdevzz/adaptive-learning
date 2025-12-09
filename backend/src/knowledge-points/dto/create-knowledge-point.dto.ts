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
import { Type } from 'class-transformer';

class KpResourceDto {
  @IsEnum(['video', 'article', 'interactive'])
  resourceType: 'video' | 'article' | 'interactive';

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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
