import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class RecommendationOverrideDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  recommendationEventId: string;

  @IsIn(['approved', 'rejected', 'modified'])
  action: 'approved' | 'rejected' | 'modified';

  @IsObject()
  originalRecommendation: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  modifiedRecommendation?: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;
}
