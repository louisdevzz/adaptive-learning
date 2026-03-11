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
  ForbiddenException,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @Roles('admin', 'teacher')
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'teacher')
  findOne(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    if (user.role === 'teacher' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (user.role === 'teacher' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }

  // Course Assignment Endpoints
  @Post(':id/courses')
  @Roles('admin', 'teacher')
  @HttpCode(HttpStatus.CREATED)
  assignCourse(
    @Param('id') id: string,
    @Body() assignCourseDto: AssignCourseDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (user.role === 'teacher' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.teachersService.assignCourse(id, assignCourseDto);
  }

  @Get(':id/courses')
  @Roles('admin', 'teacher')
  getTeacherCourses(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    if (user.role === 'teacher' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.teachersService.getTeacherCourses(id);
  }

  @Delete(':id/courses/:courseId')
  @Roles('admin', 'teacher')
  @HttpCode(HttpStatus.OK)
  removeCourseFromTeacher(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (user.role === 'teacher' && user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.teachersService.removeCourseFromTeacher(id, courseId);
  }
}
