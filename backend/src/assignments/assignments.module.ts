import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { AssignmentAiGradingService } from './assignment-ai-grading.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentAiGradingService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
