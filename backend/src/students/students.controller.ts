import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(@CurrentUser() user: ICurrentUser) {
    if (user.role === 'teacher') {
      return this.studentsService.findByTeacher(user.userId);
    }
    return this.studentsService.findAll();
  }

  @Get('me/courses')
  getMyCourses(@CurrentUser() user: ICurrentUser) {
    return this.studentsService.getMyCourses(user.userId);
  }

  @Get('me/courses-with-progress')
  getMyCoursesWithProgress(@CurrentUser() user: ICurrentUser) {
    return this.studentsService.getMyCoursesWithProgress(user.userId);
  }

  @Get('me/dashboard-stats')
  getMyDashboardStats(@CurrentUser() user: ICurrentUser) {
    return this.studentsService.getMyDashboardStats(user.userId);
  }

  @Get('me/children')
  getMyChildren(@CurrentUser() user: ICurrentUser) {
    // For parents to get their linked students
    if (user.role === 'parent') {
      return this.studentsService.findByParent(user.userId);
    }
    return [];
  }

  @Get(':id/courses-with-progress')
  getStudentCoursesWithProgress(@Param('id') id: string) {
    return this.studentsService.getMyCoursesWithProgress(id);
  }

  @Get(':id/dashboard-stats')
  getStudentDashboardStats(@Param('id') id: string) {
    return this.studentsService.getMyDashboardStats(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
