import { IsIn } from 'class-validator';

export class UpdatePacePreferenceDto {
  @IsIn(['slow', 'moderate', 'fast'])
  pacePreference: 'slow' | 'moderate' | 'fast';
}
