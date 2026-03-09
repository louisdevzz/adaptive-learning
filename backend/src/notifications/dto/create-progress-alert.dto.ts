import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProgressAlertDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
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
  @Matches(/^\/(?!\/)/, { message: 'actionUrl must be a relative path starting with / and not a protocol-relative URL' })
  actionUrl?: string;
}
