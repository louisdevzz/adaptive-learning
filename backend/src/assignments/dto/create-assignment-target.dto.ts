import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateAssignmentTargetDto {
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;

  @IsEnum(['student', 'class', 'group', 'auto', 'section'])
  targetType: 'student' | 'class' | 'group' | 'auto' | 'section';

  @IsUUID()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  assignedBy: string; // teacher_id or 'system'
}
