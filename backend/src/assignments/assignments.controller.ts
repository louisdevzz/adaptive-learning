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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignToStudentDto } from './dto/assign-to-student.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeStudentAssignmentDto } from './dto/grade-student-assignment.dto';
import { AssignToSectionDto } from './dto/assign-to-section.dto';
import { CreateAssignmentTargetDto } from './dto/create-assignment-target.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles('admin', 'teacher')
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  findAll(
    @Query('teacherId') teacherId?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    return this.assignmentsService.findAll(
      teacherId,
      isPublished ? isPublished === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Get(':id/details')
  findOneWithDetails(@Param('id') id: string) {
    return this.assignmentsService.findOneWithDetails(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @Roles('admin', 'teacher')
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }

  // ==================== STUDENT ASSIGNMENTS ====================

  @Post('assign-to-students')
  @Roles('admin', 'teacher')
  assignToStudents(@Body() assignDto: AssignToStudentDto) {
    return this.assignmentsService.assignToStudents(assignDto);
  }

  @Get('students/:studentId/assignments/:assignmentId')
  getStudentAssignment(
    @Param('studentId') studentId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentsService.getStudentAssignment(
      studentId,
      assignmentId,
    );
  }

  @Post('submit')
  @Roles('student')
  submitAssignment(@Body() submitDto: SubmitAssignmentDto) {
    return this.assignmentsService.submitAssignment(submitDto);
  }

  @Get('students/:studentId')
  @Roles('student', 'teacher', 'admin', 'parent')
  getStudentAssignments(@Param('studentId') studentId: string) {
    return this.assignmentsService.getStudentAssignments(studentId);
  }

  @Get(':assignmentId/results')
  @Roles('teacher', 'admin')
  getAssignmentResults(@Param('assignmentId') assignmentId: string) {
    return this.assignmentsService.getAssignmentResults(assignmentId);
  }

  @Patch('student-assignments/:studentAssignmentId/grade')
  @Roles('teacher', 'admin')
  gradeStudentAssignment(
    @Param('studentAssignmentId') studentAssignmentId: string,
    @Body() gradeDto: GradeStudentAssignmentDto,
  ) {
    return this.assignmentsService.gradeStudentAssignment(
      studentAssignmentId,
      gradeDto,
    );
  }

  // ==================== SECTION ASSIGNMENTS ====================

  @Post('assign-to-section')
  @Roles('admin', 'teacher')
  assignToSection(@Body() assignDto: AssignToSectionDto) {
    return this.assignmentsService.assignToSection(assignDto);
  }

  @Get('sections/:sectionId/assignments')
  getSectionAssignments(@Param('sectionId') sectionId: string) {
    return this.assignmentsService.getSectionAssignments(sectionId);
  }

  @Delete('sections/:sectionId/assignments/:assignmentId')
  @Roles('admin', 'teacher')
  removeSectionAssignment(
    @Param('sectionId') sectionId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentsService.removeSectionAssignment(
      sectionId,
      assignmentId,
    );
  }

  // ==================== ASSIGNMENT TARGETS ====================

  @Post('targets')
  @Roles('admin', 'teacher')
  createAssignmentTarget(@Body() createTargetDto: CreateAssignmentTargetDto) {
    return this.assignmentsService.createAssignmentTarget(createTargetDto);
  }

  @Get(':assignmentId/targets')
  @Roles('admin', 'teacher')
  getAssignmentTargets(@Param('assignmentId') assignmentId: string) {
    return this.assignmentsService.getAssignmentTargets(assignmentId);
  }

  @Delete('targets/:targetId')
  @Roles('admin', 'teacher')
  removeAssignmentTarget(@Param('targetId') targetId: string) {
    return this.assignmentsService.removeAssignmentTarget(targetId);
  }
}
