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

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==================== COURSES ====================

  @Post()
  @Roles('admin', 'teacher')
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll(
    @Query('gradeLevel') gradeLevel?: string,
    @Query('subject') subject?: string,
    @Query('active') active?: string,
  ) {
    return this.coursesService.findAll(
      gradeLevel ? parseInt(gradeLevel) : undefined,
      subject,
      active ? active === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/structure')
  getCourseStructure(@Param('id') id: string) {
    return this.coursesService.getCourseStructure(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  // ==================== MODULES ====================

  @Post('modules')
  @Roles('admin', 'teacher')
  createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.coursesService.createModule(createModuleDto);
  }

  @Get(':courseId/modules')
  findModulesByCourse(@Param('courseId') courseId: string) {
    return this.coursesService.findModulesByCourse(courseId);
  }

  @Get('modules/:moduleId')
  findModule(@Param('moduleId') moduleId: string) {
    return this.coursesService.findModule(moduleId);
  }

  @Patch('modules/:moduleId')
  @Roles('admin', 'teacher')
  updateModule(
    @Param('moduleId') moduleId: string,
    @Body() updateData: Partial<CreateModuleDto>,
  ) {
    return this.coursesService.updateModule(moduleId, updateData);
  }

  @Delete('modules/:moduleId')
  @Roles('admin', 'teacher')
  removeModule(@Param('moduleId') moduleId: string) {
    return this.coursesService.removeModule(moduleId);
  }

  // ==================== SECTIONS ====================

  @Post('sections')
  @Roles('admin', 'teacher')
  createSection(@Body() createSectionDto: CreateSectionDto) {
    return this.coursesService.createSection(createSectionDto);
  }

  @Get('modules/:moduleId/sections')
  findSectionsByModule(@Param('moduleId') moduleId: string) {
    return this.coursesService.findSectionsByModule(moduleId);
  }

  @Get('sections/:sectionId')
  findSection(@Param('sectionId') sectionId: string) {
    return this.coursesService.findSection(sectionId);
  }

  @Get('sections/:sectionId/knowledge-points')
  getSectionKnowledgePoints(@Param('sectionId') sectionId: string) {
    return this.coursesService.getSectionKnowledgePoints(sectionId);
  }

  @Patch('sections/:sectionId')
  @Roles('admin', 'teacher')
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateData: Partial<CreateSectionDto>,
  ) {
    return this.coursesService.updateSection(sectionId, updateData);
  }

  @Delete('sections/:sectionId')
  @Roles('admin', 'teacher')
  removeSection(@Param('sectionId') sectionId: string) {
    return this.coursesService.removeSection(sectionId);
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
  getCourseTeachers(@Param('courseId') courseId: string) {
    return this.coursesService.getCourseTeachers(courseId);
  }
}
