import { Module } from '@nestjs/common';
import { ResourceRecommendationsModule } from '../resource-recommendations/resource-recommendations.module';
import { StudentsModule } from '../students/students.module';
import { ParentDashboardController } from './parent-dashboard.controller';
import { ParentDashboardService } from './parent-dashboard.service';
import { ParentMessagingService } from './parent-messaging.service';
import { WeeklyReportGeneratorService } from './weekly-report-generator.service';

@Module({
  imports: [StudentsModule, ResourceRecommendationsModule],
  controllers: [ParentDashboardController],
  providers: [
    ParentDashboardService,
    WeeklyReportGeneratorService,
    ParentMessagingService,
  ],
})
export class ParentDashboardModule {}
