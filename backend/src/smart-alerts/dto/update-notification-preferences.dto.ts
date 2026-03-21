import { IsIn, IsObject, IsOptional, Matches } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsObject()
  enabledTypes?: Record<string, boolean>;

  @IsOptional()
  @IsIn(['realtime', 'daily', 'weekly'])
  digestFrequency?: 'realtime' | 'daily' | 'weekly';

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  quietHoursStart?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  quietHoursEnd?: string;
}
