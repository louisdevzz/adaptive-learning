import {
  IsIn,
  IsObject,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsObject()
  enabledTypes?: Record<string, boolean>;

  @IsOptional()
  @IsIn(['realtime', 'daily', 'weekly'])
  digestFrequency?: 'realtime' | 'daily' | 'weekly';

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  quietHoursStart?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  quietHoursEnd?: string | null;
}
