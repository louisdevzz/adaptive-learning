import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';

export class AssignToSectionDto {
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @IsUUID()
  @IsNotEmpty()
  kpId: string;

  @IsInt()
  @Min(0)
  orderIndex: number;
}
