import { IsUUID, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class AssignToSectionDto {
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;

  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @IsBoolean()
  @IsOptional()
  autoAssign?: boolean;
}

