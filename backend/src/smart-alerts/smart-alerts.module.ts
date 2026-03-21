import { Module } from '@nestjs/common';
import { SmartAlertsController } from './smart-alerts.controller';
import { SmartAlertsService } from './smart-alerts.service';
import { AlertDispatcherService } from './alert-dispatcher.service';
import { DigestGeneratorService } from './digest-generator.service';
import { StudentAlertTriggersService } from './student-alert-triggers.service';
import { ParentAlertTriggersService } from './parent-alert-triggers.service';
import { TeacherAlertTriggersService } from './teacher-alert-triggers.service';

@Module({
  controllers: [SmartAlertsController],
  providers: [
    SmartAlertsService,
    AlertDispatcherService,
    DigestGeneratorService,
    StudentAlertTriggersService,
    ParentAlertTriggersService,
    TeacherAlertTriggersService,
  ],
  exports: [AlertDispatcherService, SmartAlertsService],
})
export class SmartAlertsModule {}
