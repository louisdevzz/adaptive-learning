import { Controller, Get, UseGuards, Query, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('teacher-stats')
  @Roles('teacher')
  async getTeacherStats(@Req() req: any) {
    const teacherId = req.user.userId;
    return this.dashboardService.getTeacherStats(teacherId);
  }

  @Get('stats')
  @Roles('admin')
  async getAdminStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    return this.dashboardService.getAdminStats(
      startDate,
      endDate,
      gradeLevel ? parseInt(gradeLevel) : undefined,
    );
  }

  @Get('top-courses')
  @Roles('admin')
  async getTopCourses(@Query('limit') limit?: string) {
    return this.dashboardService.getTopCourses(limit ? parseInt(limit) : 5);
  }

  @Get('difficult-kps')
  @Roles('admin')
  async getDifficultKPs(@Query('limit') limit?: string) {
    return this.dashboardService.getDifficultKPs(limit ? parseInt(limit) : 5);
  }

  @Get('game-completions')
  @Roles('admin')
  async getGameCompletions(@Query('limit') limit?: string) {
    return this.dashboardService.getGameCompletions(
      limit ? parseInt(limit) : 5,
    );
  }

  @Get('class-distribution')
  @Roles('admin')
  async getClassDistribution() {
    return this.dashboardService.getClassDistribution();
  }

  @Get('learning-health')
  @Roles('admin')
  async getLearningHealth(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getLearningHealth(startDate, endDate);
  }

  @Get('teacher-highlights')
  @Roles('admin')
  async getTeacherHighlights(@Query('limit') limit?: string) {
    return this.dashboardService.getTeacherHighlights(
      limit ? parseInt(limit) : 3,
    );
  }

  @Get('low-progress-classes')
  @Roles('admin')
  async getLowProgressClasses(@Query('limit') limit?: string) {
    return this.dashboardService.getLowProgressClasses(
      limit ? parseInt(limit) : 3,
    );
  }

  @Get('admin-report-insights')
  @Roles('admin')
  async getAdminReportInsights(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getAdminReportInsights(startDate, endDate);
  }

  @Get('teacher-report-insights')
  @Roles('teacher')
  async getTeacherReportInsights(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const teacherId = req.user.userId;
    return this.dashboardService.getTeacherReportInsights(
      teacherId,
      startDate,
      endDate,
    );
  }

  @Get('search')
  @Roles('admin', 'teacher', 'student', 'parent')
  async search(
    @Req() req: any,
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.search({
      userId: req.user.userId,
      role: req.user.role,
      query: query || '',
      category: category || 'all',
      limit: limit ? parseInt(limit) : 12,
    });
  }
}
