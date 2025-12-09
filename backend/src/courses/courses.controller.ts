import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '../common/interfaces/current-user.interface';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==================== COURSES ====================

  @Post()
  @Roles('admin', 'teacher')
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.create(createCourseDto, user.userId);
  }

  @Get()
  findAll(
    @Query('gradeLevel') gradeLevel?: string,
    @Query('subject') subject?: string,
    @Query('active') active?: string,
    @CurrentUser() user?: ICurrentUser,
  ) {
    return this.coursesService.findAll(
      gradeLevel ? parseInt(gradeLevel) : undefined,
      subject,
      active ? active === 'true' : undefined,
      user?.userId,
      user?.role,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: ICurrentUser) {
    return this.coursesService.findOne(id, user?.userId, user?.role);
  }

  @Get(':id/structure')
  getCourseStructure(@Param('id') id: string, @CurrentUser() user?: ICurrentUser) {
    return this.coursesService.getCourseStructure(id, user?.userId, user?.role);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.update(id, updateCourseDto, user.userId, user.role);
  }

  @Delete(':id')
  @Roles('admin', 'teacher')
  remove(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.remove(id, user.userId, user.role);
  }

  // ==================== MODULES ====================

  @Post('modules')
  @Roles('admin', 'teacher')
  createModule(@Body() createModuleDto: CreateModuleDto, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.createModule(createModuleDto, user.userId, user.role);
  }

  @Get(':courseId/modules')
  findModulesByCourse(@Param('courseId') courseId: string, @CurrentUser() user?: ICurrentUser) {
    return this.coursesService.findModulesByCourse(courseId, user?.userId, user?.role);
  }

  @Get('modules/:moduleId')
  findModule(@Param('moduleId') moduleId: string, @CurrentUser() user?: ICurrentUser) {
    return this.coursesService.findModule(moduleId, user?.userId, user?.role);
  }

  @Patch('modules/:moduleId')
  @Roles('admin', 'teacher')
  updateModule(
    @Param('moduleId') moduleId: string,
    @Body() updateData: Partial<CreateModuleDto>,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.coursesService.updateModule(moduleId, updateData, user.userId, user.role);
  }

  @Delete('modules/:moduleId')
  @Roles('admin', 'teacher')
  removeModule(@Param('moduleId') moduleId: string, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.removeModule(moduleId, user.userId, user.role);
  }

  // ==================== SECTIONS ====================

  @Post('sections')
  @Roles('admin', 'teacher')
  createSection(@Body() createSectionDto: CreateSectionDto, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.createSection(createSectionDto, user.userId, user.role);
  }

  @Get('modules/:moduleId/sections')
  findSectionsByModule(@Param('moduleId') moduleId: string, @CurrentUser() user?: ICurrentUser) {
    return this.coursesService.findSectionsByModule(moduleId, user?.userId, user?.role);
  }

  @Get('sections/:sectionId')
  findSection(@Param('sectionId') sectionId: string, @CurrentUser() user?: ICurrentUser) {
    return this.coursesService.findSection(sectionId, user?.userId, user?.role);
  }

  @Get('sections/:sectionId/knowledge-points')
  getSectionKnowledgePoints(@Param('sectionId') sectionId: string, @CurrentUser() user?: ICurrentUser) {
    return this.coursesService.getSectionKnowledgePoints(sectionId, user?.userId, user?.role);
  }

  @Patch('sections/:sectionId')
  @Roles('admin', 'teacher')
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateData: Partial<CreateSectionDto>,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.coursesService.updateSection(sectionId, updateData, user.userId, user.role);
  }

  @Delete('sections/:sectionId')
  @Roles('admin', 'teacher')
  removeSection(@Param('sectionId') sectionId: string, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.removeSection(sectionId, user.userId, user.role);
  }

  // ==================== TEACHER ASSIGNMENTS ====================

  @Post(':courseId/teachers/:teacherId')
  @Roles('admin')
  assignTeacher(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
    @Body('role') role: 'creator' | 'collaborator',
  ) {
    return this.coursesService.assignTeacherToCourse(courseId, teacherId, role);
  }

  @Get(':courseId/teachers')
  @Roles('admin', 'teacher')
  getCourseTeachers(@Param('courseId') courseId: string, @CurrentUser() user: ICurrentUser) {
    return this.coursesService.getCourseTeachers(courseId, user.userId, user.role);
  }
}
