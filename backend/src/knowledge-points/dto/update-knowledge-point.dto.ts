import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export class UpdateKnowledgePointDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  prerequisites?: string[];

  @IsOptional()
  resources?: any[];

  @IsOptional()
  questions?: any[];
}
