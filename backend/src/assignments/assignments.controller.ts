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
  update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
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
    return this.assignmentsService.getStudentAssignment(studentId, assignmentId);
  }

  @Post('student-assignments/:studentAssignmentId/start')
  @Roles('student')
  startAssignment(@Param('studentAssignmentId') studentAssignmentId: string) {
    return this.assignmentsService.startAssignment(studentAssignmentId);
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
}
