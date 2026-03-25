import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { UpdateKpProgressDto } from './dto/update-kp-progress.dto';
import { SubmitQuestionAttemptDto } from './dto/submit-question-attempt.dto';
import { SubmitContentQuestionDto } from './dto/submit-content-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { StudentsService } from '../students/students.service';

@Controller('student-progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentProgressController {
  constructor(
    private readonly progressService: StudentProgressService,
    private readonly studentsService: StudentsService,
  ) {}

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

  // ==================== QUESTION ATTEMPTS ====================

  @Post('submit-question')
  @Roles('admin', 'teacher', 'student')
  submitQuestionAttempt(
    @Body() submitDto: SubmitQuestionAttemptDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    // Ensure student can only submit for themselves
    if (user.role === 'student' && submitDto.studentId !== user.userId) {
      submitDto.studentId = user.userId;
    }
    return this.progressService.submitQuestionAttempt(submitDto);
  }

  @Post('submit-content-question')
  @Roles('admin', 'teacher', 'student')
  submitContentQuestion(
    @Body() submitDto: SubmitContentQuestionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (user.role === 'student' && submitDto.studentId !== user.userId) {
      submitDto.studentId = user.userId;
    }
    return this.progressService.submitContentQuestion(submitDto);
  }

  @Get('students/:studentId/kps/:kpId/attempts')
  @Roles('admin', 'teacher', 'student')
  getStudentQuestionAttempts(
    @Param('studentId') studentId: string,
    @Param('kpId') kpId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    // Ensure student can only get their own attempts
    const actualStudentId = user.role === 'student' ? user.userId : studentId;
    return this.progressService.getStudentQuestionAttempts(
      actualStudentId,
      kpId,
    );
  }

  @Get('students/:studentId/kps/:kpId/adaptive-questions')
  @Roles('admin', 'teacher', 'student')
  getAdaptiveQuestions(
    @Param('studentId') studentId: string,
    @Param('kpId') kpId: string,
    @Query('forceRefresh') forceRefresh: string | undefined,
    @CurrentUser() user: ICurrentUser,
  ) {
    const actualStudentId = user.role === 'student' ? user.userId : studentId;
    return this.progressService.getAdaptiveQuestions(
      actualStudentId,
      kpId,
      forceRefresh === 'true',
    );
  }

  // ==================== TIME TRACKING ====================

  @Post('track-time')
  @Roles('admin', 'teacher', 'student')
  trackTimeOnTask(
    @Body() body: { studentId: string; kpId: string; timeSpentSeconds: number },
    @CurrentUser() user: ICurrentUser,
  ) {
    // Ensure student can only track time for themselves
    const actualStudentId =
      user.role === 'student' ? user.userId : body.studentId;
    return this.progressService.trackTimeOnTask(
      actualStudentId,
      body.kpId,
      body.timeSpentSeconds,
    );
  }

  @Get('students/:studentId/study-time')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getTotalStudyTime(
    @Param('studentId') studentId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    // If parent, verify parent-child relationship
    if (user.role === 'parent') {
      await this.studentsService.assertParentCanAccessStudent(
        user.userId,
        studentId,
      );
    }
    // Ensure student can only get their own study time
    const actualStudentId = user.role === 'student' ? user.userId : studentId;
    return this.progressService.getTotalStudyTime(actualStudentId);
  }

  @Get('students/:studentId/kps/:kpId/attempt-stats')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getKpAttemptStats(
    @Param('studentId') studentId: string,
    @Param('kpId') kpId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    // If parent, verify parent-child relationship
    if (user.role === 'parent') {
      await this.studentsService.assertParentCanAccessStudent(
        user.userId,
        studentId,
      );
    }
    // Ensure student can only get their own stats
    const actualStudentId = user.role === 'student' ? user.userId : studentId;
    return this.progressService.getKpAttemptStats(actualStudentId, kpId);
  }

  @Get('students/:studentId/weekly-activity')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getWeeklyActivity(
    @Param('studentId') studentId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    // If parent, verify parent-child relationship
    if (user.role === 'parent') {
      await this.studentsService.assertParentCanAccessStudent(
        user.userId,
        studentId,
      );
    }
    // Ensure student can only get their own activity
    const actualStudentId = user.role === 'student' ? user.userId : studentId;
    return this.progressService.getWeeklyActivity(actualStudentId);
  }
}
