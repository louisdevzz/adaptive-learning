import { Controller, Get, Patch, Query, UseGuards, Body } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetDigestsQueryDto } from './dto/get-digests-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { SmartAlertsService } from './smart-alerts.service';

@Controller('smart-alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher', 'student', 'parent')
export class SmartAlertsController {
  constructor(private readonly smartAlertsService: SmartAlertsService) {}

  @Get('preferences')
  getPreferences(@CurrentUser() user: ICurrentUser) {
    return this.smartAlertsService.getPreferences(user.userId);
  }

  @Patch('preferences')
  updatePreferences(
    @CurrentUser() user: ICurrentUser,
    @Body() payload: UpdateNotificationPreferencesDto,
  ) {
    return this.smartAlertsService.updatePreferences(user.userId, payload);
  }

  @Get('digests')
  getDigests(
    @CurrentUser() user: ICurrentUser,
    @Query() query: GetDigestsQueryDto,
  ) {
    return this.smartAlertsService.getDigests(user.userId, query.page, query.limit);
  }
}
