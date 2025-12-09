import { IsUUID, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class UpdateKpProgressDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  kpId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  masteryScore: number;

  @IsInt()
  @Min(0)
  @Max(100)
  confidence: number;

  @IsUUID()
  @IsNotEmpty()
  lastAttemptId: string;
}
