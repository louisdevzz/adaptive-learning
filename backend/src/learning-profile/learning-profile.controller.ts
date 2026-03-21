import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';
import { StudentsService } from '../students/students.service';
import { SubmitVarkAssessmentDto } from './dto/submit-vark-assessment.dto';
import { UpdatePacePreferenceDto } from './dto/update-pace-preference.dto';
import { LearningProfileService } from './learning-profile.service';

@Controller('learning-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningProfileController {
  constructor(
    private readonly learningProfileService: LearningProfileService,
    private readonly studentsService: StudentsService,
  ) {}

  @Get('me')
  @Roles('student')
  getMyProfile(@CurrentUser() user: ICurrentUser) {
    return this.learningProfileService.getOrCreateProfile(user.userId);
  }

  @Get('assessment/questions')
  @Roles('admin', 'teacher', 'student', 'parent')
  getAssessmentQuestions() {
    return this.learningProfileService.getAssessmentQuestions();
  }

  @Post('assessment')
  @Roles('student')
  submitAssessment(
    @CurrentUser() user: ICurrentUser,
    @Body() payload: SubmitVarkAssessmentDto,
  ) {
    return this.learningProfileService.processAssessment(user.userId, payload);
  }

  @Patch('me/pace')
  @Roles('student')
  updateMyPace(
    @CurrentUser() user: ICurrentUser,
    @Body() payload: UpdatePacePreferenceDto,
  ) {
    return this.learningProfileService.updatePacePreference(user.userId, payload);
  }

  @Get(':studentId')
  @Roles('admin', 'teacher', 'student', 'parent')
  async getProfileByStudentId(
    @Param('studentId') studentId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (user.role === 'student' && user.userId !== studentId) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === 'parent') {
      await this.studentsService.assertParentCanAccessStudent(user.userId, studentId);
    }

    if (user.role === 'teacher') {
      await this.learningProfileService.assertTeacherCanAccessStudent(
        user.userId,
        studentId,
      );
    }

    return this.learningProfileService.getOrCreateProfile(studentId);
  }
}
