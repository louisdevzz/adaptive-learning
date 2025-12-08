import { IsUUID, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  TRANSFERRED = 'transferred',
  GRADUATED = 'graduated',
}

export class EnrollStudentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}
