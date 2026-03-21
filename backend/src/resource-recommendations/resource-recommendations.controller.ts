import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { RecordResourceInteractionDto } from './dto/record-resource-interaction.dto';
import { ResourceRecommendationsService } from './resource-recommendations.service';

@Controller('resource-recommendations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourceRecommendationsController {
  constructor(
    private readonly resourceRecommendationsService: ResourceRecommendationsService,
  ) {}

  @Get(':studentId/kp/:kpId')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getRecommendationsForKp(
    @Param('studentId') studentId: string,
    @Param('kpId') kpId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    await this.resourceRecommendationsService.assertCanAccessStudentProfile(
      user,
      studentId,
    );

    return this.resourceRecommendationsService.getRecommendationsForKp(
      studentId,
      kpId,
    );
  }

  @Get(':studentId/suggested')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getSuggestedForWeakKps(
    @Param('studentId') studentId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    await this.resourceRecommendationsService.assertCanAccessStudentProfile(
      user,
      studentId,
    );

    return this.resourceRecommendationsService.getSuggestedForWeakKps(studentId);
  }

  @Post('interaction')
  @Roles('admin', 'teacher', 'student', 'parent')
  async recordInteraction(
    @Body() dto: RecordResourceInteractionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    await this.resourceRecommendationsService.assertCanAccessStudentProfile(
      user,
      dto.studentId,
    );

    return this.resourceRecommendationsService.recordInteraction(dto);
  }
}
