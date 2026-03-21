import { Module } from '@nestjs/common';
import { StudentInsightsService } from './student-insights.service';

@Module({
  providers: [StudentInsightsService],
  exports: [StudentInsightsService],
})
export class StudentInsightsModule {}
