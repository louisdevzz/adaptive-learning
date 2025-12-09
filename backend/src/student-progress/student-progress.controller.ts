import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { UpdateKpProgressDto } from './dto/update-kp-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('student-progress')
@UseGuards(JwtAuthGuard)
export class StudentProgressController {
  constructor(private readonly progressService: StudentProgressService) {}

  @Post('kp-progress')
  @Roles('admin', 'teacher', 'student')
  updateKpProgress(@Body() updateDto: UpdateKpProgressDto) {
    return this.progressService.updateKpProgress(updateDto);
  }

  @Get('students/:studentId/kps/:kpId')
  getStudentKpProgress(
    @Param('studentId') studentId: string,
    @Param('kpId') kpId: string,
  ) {
    return this.progressService.getStudentKpProgress(studentId, kpId);
  }

  @Get('students/:studentId/all-progress')
  getAllStudentProgress(@Param('studentId') studentId: string) {
    return this.progressService.getAllStudentProgress(studentId);
  }

  @Get('students/:studentId/kps/:kpId/history')
  getKpHistory(
    @Param('studentId') studentId: string,
    @Param('kpId') kpId: string,
  ) {
    return this.progressService.getKpHistory(studentId, kpId);
  }

  @Get('students/:studentId/mastery/:courseId')
  getStudentMastery(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getStudentMastery(studentId, courseId);
  }

  @Get('students/:studentId/mastery')
  getAllStudentMastery(@Param('studentId') studentId: string) {
    return this.progressService.getAllStudentMastery(studentId);
  }

  @Get('students/:studentId/insights')
  @Roles('admin', 'teacher', 'student', 'parent')
  getStudentInsights(@Param('studentId') studentId: string) {
    return this.progressService.getStudentInsights(studentId);
  }
}
