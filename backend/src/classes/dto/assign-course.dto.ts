import { IsUUID, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum ClassCourseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class AssignCourseToClassDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsUUID()
  @IsOptional()
  assignedBy?: string;

  @IsEnum(ClassCourseStatus)
  @IsOptional()
  status?: ClassCourseStatus;
}
