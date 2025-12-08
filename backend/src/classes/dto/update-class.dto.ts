import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  className?: string;

  @IsInt()
  @IsOptional()
  gradeLevel?: number;

  @IsString()
  @IsOptional()
  schoolYear?: string;

  @IsUUID()
  @IsOptional()
  homeroomTeacherId?: string;
}
