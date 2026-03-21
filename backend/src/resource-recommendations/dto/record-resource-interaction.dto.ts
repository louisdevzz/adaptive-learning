import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class RecordResourceInteractionDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  resourceId!: string;

  @IsUUID()
  kpId!: string;

  @IsIn(['viewed', 'completed', 'helpful', 'not_helpful'])
  action!: 'viewed' | 'completed' | 'helpful' | 'not_helpful';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  masteryBefore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  masteryAfter?: number;
}
