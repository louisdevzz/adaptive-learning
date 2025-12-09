import { IsString, IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class CreateModuleDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

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
