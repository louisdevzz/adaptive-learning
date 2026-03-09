import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { CreateProgressAlertDto } from './dto/create-progress-alert.dto';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  getMyNotifications(
    @CurrentUser() user: ICurrentUser,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationsService.getMyNotifications(user.userId, query);
  }

  @Get('me/unread-count')
  getUnreadCount(@CurrentUser() user: ICurrentUser) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch('me/read-all')
  markAllAsRead(@CurrentUser() user: ICurrentUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: ICurrentUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Post('students/:studentId/progress-alert')
  @Roles('admin', 'teacher')
  createProgressAlert(
    @Param('studentId') studentId: string,
    @Body() dto: CreateProgressAlertDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.notificationsService.createProgressAlert(
      studentId,
      dto,
      user.userId,
    );
  }
}
