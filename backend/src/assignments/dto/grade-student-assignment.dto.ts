import { IsInt, Min } from 'class-validator';

export class GradeStudentAssignmentDto {
  @IsInt()
  @Min(0)
  totalScore: number;
}
