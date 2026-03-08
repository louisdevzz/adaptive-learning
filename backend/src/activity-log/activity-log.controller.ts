import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get('users/:userId/login-history')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getLoginHistory(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: ICurrentUser,
  ) {
    if (user?.role !== 'admin' && user?.userId !== userId) {
      throw new ForbiddenException('You can only view your own login history');
    }

    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    return this.activityLogService.getLoginHistory(
      userId,
      parsedPage,
      parsedLimit,
    );
  }

  @Get('users/:userId/recent')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getRecentActivities(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: ICurrentUser,
  ) {
    if (user?.role !== 'admin' && user?.userId !== userId) {
      throw new ForbiddenException(
        'You can only view your own activity history',
      );
    }

    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    return this.activityLogService.getRecentActivities(
      userId,
      parsedPage,
      parsedLimit,
    );
  }

  @Get('recent')
  @Roles('admin')
  async getGlobalRecentActivities(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    return this.activityLogService.getGlobalRecentActivities(
      parsedPage,
      parsedLimit,
    );
  }
}
