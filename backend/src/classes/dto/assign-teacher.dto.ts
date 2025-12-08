import { IsUUID, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum TeacherClassRole {
  HOMEROOM = 'homeroom',
  SUBJECT_TEACHER = 'subject_teacher',
  ASSISTANT = 'assistant',
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export class AssignTeacherToClassDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsEnum(TeacherClassRole)
  @IsNotEmpty()
  role: TeacherClassRole;

  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;
}
