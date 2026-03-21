import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { GetWeeklyReportsQueryDto } from './dto/get-weekly-reports-query.dto';
import { SendParentMessageDto } from './dto/send-parent-message.dto';
import { ParentDashboardService } from './parent-dashboard.service';
import { ParentMessagingService } from './parent-messaging.service';

@Controller('parent-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('parent')
export class ParentDashboardController {
  constructor(
    private readonly parentDashboardService: ParentDashboardService,
    private readonly parentMessagingService: ParentMessagingService,
  ) {}

  @Get('overview')
  getOverview(@CurrentUser() user: ICurrentUser) {
    return this.parentDashboardService.getOverview(user.userId);
  }

  @Get('children/:studentId/summary')
  getChildSummary(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
  ) {
    return this.parentDashboardService.getChildSummary(user.userId, studentId);
  }

  @Get('children/:studentId/weekly-reports')
  getChildWeeklyReports(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
    @Query() query: GetWeeklyReportsQueryDto,
  ) {
    return this.parentDashboardService.getChildWeeklyReports(
      user.userId,
      studentId,
      query.page,
      query.limit,
    );
  }

  @Get('children/:studentId/recommendations')
  getChildRecommendations(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
  ) {
    return this.parentDashboardService.getChildRecommendations(
      user.userId,
      studentId,
    );
  }

  @Get('children/:studentId/risk-alerts')
  getChildRiskAlerts(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
  ) {
    return this.parentDashboardService.getChildRiskAlerts(user.userId, studentId);
  }

  @Get('messages/:studentId')
  getMessages(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.parentMessagingService.getMessages(user.userId, studentId, query);
  }

  @Post('messages/:studentId')
  sendMessage(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
    @Body() payload: SendParentMessageDto,
  ) {
    return this.parentMessagingService.sendMessage(user.userId, studentId, payload);
  }
}
