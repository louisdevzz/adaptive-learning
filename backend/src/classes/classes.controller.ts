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
  Query,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { AssignTeacherToClassDto } from './dto/assign-teacher.dto';
import { AssignCourseToClassDto } from './dto/assign-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  // Student Enrollment Endpoints
  @Post(':id/students')
  @HttpCode(HttpStatus.CREATED)
  enrollStudent(@Param('id') id: string, @Body() enrollStudentDto: EnrollStudentDto) {
    return this.classesService.enrollStudent(id, enrollStudentDto);
  }

  @Get(':id/students')
  getClassStudents(@Param('id') id: string) {
    return this.classesService.getClassStudents(id);
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.OK)
  removeStudentFromClass(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classesService.removeStudentFromClass(id, studentId);
  }

  // Teacher Assignment Endpoints
  @Post(':id/teachers')
  @HttpCode(HttpStatus.CREATED)
  assignTeacher(@Param('id') id: string, @Body() assignTeacherDto: AssignTeacherToClassDto) {
    return this.classesService.assignTeacher(id, assignTeacherDto);
  }

  @Get(':id/teachers')
  getClassTeachers(@Param('id') id: string) {
    return this.classesService.getClassTeachers(id);
  }

  @Delete(':id/teachers/:teacherId')
  @HttpCode(HttpStatus.OK)
  removeTeacherFromClass(@Param('id') id: string, @Param('teacherId') teacherId: string) {
    return this.classesService.removeTeacherFromClass(id, teacherId);
  }

  // Course Assignment Endpoints
  @Post(':id/courses')
  @HttpCode(HttpStatus.CREATED)
  assignCourse(@Param('id') id: string, @Body() assignCourseDto: AssignCourseToClassDto) {
    return this.classesService.assignCourse(id, assignCourseDto);
  }

  @Get(':id/courses')
  getClassCourses(
    @Param('id') id: string,
    @Query('status') status?: string
  ) {
    if (status) {
      return this.classesService.getClassCoursesByStatus(id, status);
    }
    return this.classesService.getClassCourses(id);
  }

  @Patch(':id/courses/:courseId/status')
  updateClassCourseStatus(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @Body('status') status: string
  ) {
    return this.classesService.updateClassCourseStatus(id, courseId, status);
  }

  @Delete(':id/courses/:courseId')
  @HttpCode(HttpStatus.OK)
  removeCourseFromClass(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.classesService.removeCourseFromClass(id, courseId);
  }
}
