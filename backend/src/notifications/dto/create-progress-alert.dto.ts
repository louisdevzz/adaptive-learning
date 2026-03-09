import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProgressAlertDto {
  @IsString()
  @MinLength(3)
  message: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  courseName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  masteryScore?: number;

  @IsOptional()
  @IsString()
  actionUrl?: string;
}
