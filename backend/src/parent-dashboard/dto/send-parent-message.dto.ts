import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendParentMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsUUID()
  recipientTeacherId?: string;
}
