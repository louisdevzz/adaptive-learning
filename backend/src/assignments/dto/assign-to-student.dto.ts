import { IsUUID, IsNotEmpty, IsArray } from 'class-validator';

export class AssignToStudentDto {
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  studentIds: string[];
}
