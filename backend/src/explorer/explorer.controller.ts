import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ExplorerService } from './explorer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('explorer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}

  /**
   * GET /explorer/courses
   * Get all public courses
   */
  @Get('courses')
  @Roles('admin', 'teacher')
  getPublicCourses(
    @Query('gradeLevel') gradeLevel?: string,
    @Query('subject') subject?: string,
  ) {
    return this.explorerService.getPublicCourses(
      gradeLevel ? parseInt(gradeLevel) : undefined,
      subject,
    );
  }

  /**
   * GET /explorer/courses/:id
   * Get public course details
   */
  @Get('courses/:id')
  @Roles('admin', 'teacher')
  getPublicCourseDetails(@Param('id') id: string) {
    return this.explorerService.getPublicCourseDetails(id);
  }

  /**
   * POST /explorer/courses/:id/clone
   * Clone a public course to teacher's account
   */
  @Post('courses/:id/clone')
  @Roles('admin', 'teacher')
  cloneCourse(
    @Param('id') courseId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.explorerService.cloneCourse(courseId, user.userId);
  }
}
