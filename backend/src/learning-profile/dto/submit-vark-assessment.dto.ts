import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class VarkAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsIn(['a', 'b', 'c', 'd'])
  selectedOptionKey: string;
}

export class SubmitVarkAssessmentDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VarkAnswerDto)
  answers: VarkAnswerDto[];
}
