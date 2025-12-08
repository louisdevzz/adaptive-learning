import { IsUUID, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum TeacherCourseRole {
  CREATOR = 'creator',
  COLLABORATOR = 'collaborator',
}

export class AssignCourseDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsEnum(TeacherCourseRole)
  @IsOptional()
  role?: TeacherCourseRole;
}
