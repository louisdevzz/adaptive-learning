import { IsString, IsNotEmpty, IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  thumbnailUrl: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsInt()
  @Min(1)
  @Max(12)
  gradeLevel: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
