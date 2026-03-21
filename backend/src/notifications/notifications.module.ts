import { Module } from '@nestjs/common';
import { SmartAlertsModule } from '../smart-alerts/smart-alerts.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [SmartAlertsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
