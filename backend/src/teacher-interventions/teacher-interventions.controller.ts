import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTeacherInterventionDto } from './dto/create-teacher-intervention.dto';
import { RecommendationOverrideDto } from './dto/recommendation-override.dto';
import { UpdateTeacherInterventionDto } from './dto/update-teacher-intervention.dto';
import { TeacherInterventionsService } from './teacher-interventions.service';

@Controller('teacher-interventions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
export class TeacherInterventionsController {
  constructor(
    private readonly teacherInterventionsService: TeacherInterventionsService,
  ) {}

  @Get('class/:classId/overview')
  getClassOverview(
    @CurrentUser() user: ICurrentUser,
    @Param('classId') classId: string,
  ) {
    return this.teacherInterventionsService.getClassOverview(user.userId, classId);
  }

  @Get('student/:studentId/detail')
  getStudentDetail(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
  ) {
    return this.teacherInterventionsService.getStudentDetail(user.userId, studentId);
  }

  @Get('student/:studentId/suggestions')
  getStudentSuggestions(
    @CurrentUser() user: ICurrentUser,
    @Param('studentId') studentId: string,
  ) {
    return this.teacherInterventionsService.getStudentSuggestions(
      user.userId,
      studentId,
    );
  }

  @Post()
  createIntervention(
    @CurrentUser() user: ICurrentUser,
    @Body() payload: CreateTeacherInterventionDto,
  ) {
    return this.teacherInterventionsService.createIntervention(user.userId, payload);
  }

  @Patch(':id')
  updateIntervention(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() payload: UpdateTeacherInterventionDto,
  ) {
    return this.teacherInterventionsService.updateIntervention(
      user.userId,
      id,
      payload,
    );
  }

  @Post('recommendation-override')
  createRecommendationOverride(
    @CurrentUser() user: ICurrentUser,
    @Body() payload: RecommendationOverrideDto,
  ) {
    return this.teacherInterventionsService.createRecommendationOverride(
      user.userId,
      payload,
    );
  }
}
