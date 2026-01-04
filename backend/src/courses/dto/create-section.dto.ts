import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKnowledgePointData {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  content: any;

  @IsInt()
  @Min(1)
  difficultyLevel: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  prerequisites?: string[];
}

export class CreateSectionDto {
  @IsUUID()
  @IsNotEmpty()
  moduleId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKnowledgePointData)
  @IsOptional()
  knowledgePoints?: CreateKnowledgePointData[];
}
