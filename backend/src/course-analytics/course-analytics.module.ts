import { Module } from '@nestjs/common';
import { CourseAnalyticsService } from './course-analytics.service';
import { CourseAnalyticsController } from './course-analytics.controller';

@Module({
  controllers: [CourseAnalyticsController],
  providers: [CourseAnalyticsService],
  exports: [CourseAnalyticsService],
})
export class CourseAnalyticsModule {}
