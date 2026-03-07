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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }

  // Course Assignment Endpoints
  @Post(':id/courses')
  @HttpCode(HttpStatus.CREATED)
  assignCourse(
    @Param('id') id: string,
    @Body() assignCourseDto: AssignCourseDto,
  ) {
    return this.teachersService.assignCourse(id, assignCourseDto);
  }

  @Get(':id/courses')
  getTeacherCourses(@Param('id') id: string) {
    return this.teachersService.getTeacherCourses(id);
  }

  @Delete(':id/courses/:courseId')
  @HttpCode(HttpStatus.OK)
  removeCourseFromTeacher(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.teachersService.removeCourseFromTeacher(id, courseId);
  }
}
