import { IsUUID, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class AssignToKpDto {
  @IsUUID()
  @IsNotEmpty()
  kpId: string;

  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;
}
