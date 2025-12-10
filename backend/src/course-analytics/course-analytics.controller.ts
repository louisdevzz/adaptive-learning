import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CourseAnalyticsService } from './course-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('course-analytics')
@UseGuards(JwtAuthGuard)
export class CourseAnalyticsController {
  constructor(private readonly analyticsService: CourseAnalyticsService) {}

  @Get('courses/:courseId')
  @Roles('admin', 'teacher')
  getCourseAnalytics(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseAnalytics(courseId);
  }

  @Get('courses/:courseId/modules/:moduleId')
  @Roles('admin', 'teacher')
  getModuleAnalytics(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.analyticsService.getModuleAnalytics(courseId, moduleId);
  }
}

