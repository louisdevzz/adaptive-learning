import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class GenerateContentDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  theoryContent?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsNotEmpty()
  @IsEnum(['visualization'])
  contentType: 'visualization';

  @IsNotEmpty()
  @IsEnum(['openai', 'gemini'])
  aiModel: 'openai' | 'gemini';
}
