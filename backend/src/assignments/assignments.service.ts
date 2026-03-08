import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, inArray, SQL } from 'drizzle-orm';
import {
  db,
  assignments,
  studentAssignments,
  studentAssignmentResults,
  users,
  teachers,
  students,
  sections,
  classes,
  classEnrollment,
  sectionAssignments,
  assignmentTargets,
} from '../../db';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignToStudentDto } from './dto/assign-to-student.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeStudentAssignmentDto } from './dto/grade-student-assignment.dto';
import { AssignToSectionDto } from './dto/assign-to-section.dto';
import { CreateAssignmentTargetDto } from './dto/create-assignment-target.dto';

@Injectable()
export class AssignmentsService {
  // ==================== ASSIGNMENTS ====================

  async create(createAssignmentDto: CreateAssignmentDto) {
    // Validate teacher exists
    const teacherResult = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, createAssignmentDto.teacherId))
      .limit(1);

    if (teacherResult.length === 0) {
      throw new NotFoundException('Teacher not found');
    }

    const [assignment] = await db
      .insert(assignments)
      .values({
        teacherId: createAssignmentDto.teacherId,
        title: createAssignmentDto.title,
        description: createAssignmentDto.description?.trim() || null,
        attachmentName: createAssignmentDto.attachmentName?.trim() || null,
        attachmentMimeType: createAssignmentDto.attachmentMimeType || null,
        attachmentUrl: createAssignmentDto.attachmentUrl || null,
        assignmentType: createAssignmentDto.assignmentType,
        dueDate: createAssignmentDto.dueDate
          ? new Date(createAssignmentDto.dueDate)
          : null,
        isPublished: createAssignmentDto.isPublished ?? false,
      })
      .returning();

    return assignment;
  }

  async findAll(teacherId?: string, isPublished?: boolean) {
    let query = db.select().from(assignments);

    const conditions: SQL[] = [];
    if (teacherId) conditions.push(eq(assignments.teacherId, teacherId));
    if (isPublished !== undefined)
      conditions.push(eq(assignments.isPublished, isPublished));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Assignment not found');
    }

    return result[0];
  }

  async findOneWithDetails(id: string) {
    const assignment = await this.findOne(id);
    return assignment;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
    await this.findOne(id);

    // Validate teacher if provided
    if (updateAssignmentDto.teacherId) {
      const teacherResult = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, updateAssignmentDto.teacherId))
        .limit(1);

      if (teacherResult.length === 0) {
        throw new NotFoundException('Teacher not found');
      }
    }

    const updateData: any = { updatedAt: new Date() };
    if (updateAssignmentDto.teacherId)
      updateData.teacherId = updateAssignmentDto.teacherId;
    if (updateAssignmentDto.title) updateData.title = updateAssignmentDto.title;
    if (updateAssignmentDto.description !== undefined) {
      updateData.description = updateAssignmentDto.description?.trim() || null;
    }
    if (updateAssignmentDto.attachmentName !== undefined) {
      updateData.attachmentName =
        updateAssignmentDto.attachmentName?.trim() || null;
    }
    if (updateAssignmentDto.attachmentMimeType !== undefined) {
      updateData.attachmentMimeType =
        updateAssignmentDto.attachmentMimeType || null;
    }
    if (updateAssignmentDto.attachmentUrl !== undefined) {
      updateData.attachmentUrl = updateAssignmentDto.attachmentUrl || null;
    }
    if (updateAssignmentDto.assignmentType)
      updateData.assignmentType = updateAssignmentDto.assignmentType;
    if (updateAssignmentDto.dueDate !== undefined) {
      updateData.dueDate = updateAssignmentDto.dueDate
        ? new Date(updateAssignmentDto.dueDate)
        : null;
    }
    if (updateAssignmentDto.isPublished !== undefined)
      updateData.isPublished = updateAssignmentDto.isPublished;

    const [updated] = await db
      .update(assignments)
      .set(updateData)
      .where(eq(assignments.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    await db.delete(assignments).where(eq(assignments.id, id));

    return { message: 'Assignment deleted successfully' };
  }

  // ==================== STUDENT ASSIGNMENTS ====================

  async assignToStudents(assignDto: AssignToStudentDto) {
    // Validate assignment exists
    await this.findOne(assignDto.assignmentId);

    // Validate students exist
    const existingStudents = await db
      .select()
      .from(students)
      .where(inArray(students.id, assignDto.studentIds));

    if (existingStudents.length !== assignDto.studentIds.length) {
      throw new BadRequestException('One or more students do not exist');
    }

    // Create student assignments
    const studentAssignmentValues = assignDto.studentIds.map((studentId) => ({
      studentId,
      assignmentId: assignDto.assignmentId,
      status: 'not_started' as const,
    }));

    await db.insert(studentAssignments).values(studentAssignmentValues);

    return { message: 'Assignment assigned to students successfully' };
  }

  async getStudentAssignment(studentId: string, assignmentId: string) {
    const result = await db
      .select()
      .from(studentAssignments)
      .where(
        and(
          eq(studentAssignments.studentId, studentId),
          eq(studentAssignments.assignmentId, assignmentId),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Student assignment not found');
    }

    return result[0];
  }

  async submitAssignment(submitDto: SubmitAssignmentDto) {
    // Get student assignment
    const studentAssignment = await db
      .select()
      .from(studentAssignments)
      .where(eq(studentAssignments.id, submitDto.studentAssignmentId))
      .limit(1);

    if (studentAssignment.length === 0) {
      throw new NotFoundException('Student assignment not found');
    }

    const hasAnswers = Array.isArray(submitDto.answers) && submitDto.answers.length > 0;
    const hasSubmissionFile = Boolean(submitDto.submissionUrl);

    if (!hasAnswers && !hasSubmissionFile) {
      throw new BadRequestException(
        'Submission must include answers or an uploaded file',
      );
    }

    return await db.transaction(async (tx) => {
      // Update student assignment status
      await tx
        .update(studentAssignments)
        .set({
          status: 'submitted',
          submittedTime: new Date(),
          submissionUrl: submitDto.submissionUrl || null,
          submissionName: submitDto.submissionName || null,
          submissionMimeType: submitDto.submissionMimeType || null,
        })
        .where(eq(studentAssignments.id, submitDto.studentAssignmentId));

      // Create or update default result row (manual grading flow)
      const totalScore = 0;
      const maxScore = 10;
      const accuracy = 0;
      const timeSpent = 0;

      const existingResult = await tx
        .select()
        .from(studentAssignmentResults)
        .where(
          eq(
            studentAssignmentResults.studentAssignmentId,
            submitDto.studentAssignmentId,
          ),
        )
        .limit(1);

      let result;
      if (existingResult.length > 0) {
        [result] = await tx
          .update(studentAssignmentResults)
          .set({
            totalScore,
            maxScore,
            accuracy,
            timeSpent,
            gradedAt: new Date(),
          })
          .where(
            eq(
              studentAssignmentResults.studentAssignmentId,
              submitDto.studentAssignmentId,
            ),
          )
          .returning();
      } else {
        [result] = await tx
          .insert(studentAssignmentResults)
          .values({
            studentAssignmentId: submitDto.studentAssignmentId,
            totalScore,
            maxScore,
            accuracy,
            timeSpent,
          })
          .returning();
      }

      return result;
    });
  }

  async getStudentAssignments(studentId: string) {
    const result = await db
      .select({
        studentAssignment: studentAssignments,
        assignment: assignments,
      })
      .from(studentAssignments)
      .innerJoin(
        assignments,
        eq(studentAssignments.assignmentId, assignments.id),
      )
      .where(eq(studentAssignments.studentId, studentId));

    return result.map((row) => ({
      ...row.studentAssignment,
      assignment: row.assignment,
    }));
  }

  async getAssignmentResults(assignmentId: string) {
    const result = await db
      .select({
        studentAssignment: studentAssignments,
        result: studentAssignmentResults,
        student: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(studentAssignments)
      .innerJoin(students, eq(studentAssignments.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .leftJoin(
        studentAssignmentResults,
        eq(studentAssignments.id, studentAssignmentResults.studentAssignmentId),
      )
      .where(eq(studentAssignments.assignmentId, assignmentId));

    return result;
  }

  async gradeStudentAssignment(
    studentAssignmentId: string,
    gradeDto: GradeStudentAssignmentDto,
  ) {
    const target = await db
      .select()
      .from(studentAssignments)
      .where(eq(studentAssignments.id, studentAssignmentId))
      .limit(1);

    if (target.length === 0) {
      throw new NotFoundException('Student assignment not found');
    }

    if (target[0].status === 'not_started') {
      throw new BadRequestException('Student has not submitted this assignment');
    }

    const maxScore = 10;
    const totalScore = Math.max(0, Math.min(gradeDto.totalScore, maxScore));
    const accuracy = Math.round((totalScore / maxScore) * 100);

    return await db.transaction(async (tx) => {
      await tx
        .update(studentAssignments)
        .set({
          status: 'graded',
        })
        .where(eq(studentAssignments.id, studentAssignmentId));

      const existing = await tx
        .select()
        .from(studentAssignmentResults)
        .where(eq(studentAssignmentResults.studentAssignmentId, studentAssignmentId))
        .limit(1);

      if (existing.length > 0) {
        const [updated] = await tx
          .update(studentAssignmentResults)
          .set({
            totalScore,
            maxScore,
            accuracy,
            gradedAt: new Date(),
          })
          .where(eq(studentAssignmentResults.studentAssignmentId, studentAssignmentId))
          .returning();

        return updated;
      }

      const [created] = await tx
        .insert(studentAssignmentResults)
        .values({
          studentAssignmentId,
          totalScore,
          maxScore,
          accuracy,
          timeSpent: 0,
        })
        .returning();

      return created;
    });
  }

  // ==================== SECTION ASSIGNMENTS ====================

  async assignToSection(assignDto: AssignToSectionDto) {
    // Validate assignment exists
    await this.findOne(assignDto.assignmentId);

    // Validate section exists
    const sectionResult = await db
      .select()
      .from(sections)
      .where(eq(sections.id, assignDto.sectionId))
      .limit(1);

    if (sectionResult.length === 0) {
      throw new NotFoundException('Section not found');
    }

    // Check if assignment is already assigned to this section
    const existing = await db
      .select()
      .from(sectionAssignments)
      .where(
        and(
          eq(sectionAssignments.assignmentId, assignDto.assignmentId),
          eq(sectionAssignments.sectionId, assignDto.sectionId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException(
        'Assignment is already assigned to this section',
      );
    }

    const [result] = await db
      .insert(sectionAssignments)
      .values({
        assignmentId: assignDto.assignmentId,
        sectionId: assignDto.sectionId,
        autoAssign: assignDto.autoAssign ?? false,
      })
      .returning();

    // If autoAssign is true, expand to students in section
    if (result.autoAssign) {
      await this.expandSectionAssignmentToStudents(
        assignDto.assignmentId,
        assignDto.sectionId,
      );
    }

    return result;
  }

  async getSectionAssignments(sectionId: string) {
    const result = await db
      .select({
        sectionAssignment: sectionAssignments,
        assignment: assignments,
      })
      .from(sectionAssignments)
      .innerJoin(
        assignments,
        eq(sectionAssignments.assignmentId, assignments.id),
      )
      .where(eq(sectionAssignments.sectionId, sectionId));

    return result.map((row) => ({
      ...row.sectionAssignment,
      assignment: row.assignment,
    }));
  }

  async removeSectionAssignment(sectionId: string, assignmentId: string) {
    await db
      .delete(sectionAssignments)
      .where(
        and(
          eq(sectionAssignments.sectionId, sectionId),
          eq(sectionAssignments.assignmentId, assignmentId),
        ),
      );

    return { message: 'Section assignment removed successfully' };
  }

  // ==================== ASSIGNMENT TARGETS ====================

  async createAssignmentTarget(createTargetDto: CreateAssignmentTargetDto) {
    // Validate assignment exists
    await this.findOne(createTargetDto.assignmentId);

    // Validate target based on type
    if (createTargetDto.targetType === 'student') {
      const studentResult = await db
        .select()
        .from(students)
        .where(eq(students.id, createTargetDto.targetId))
        .limit(1);

      if (studentResult.length === 0) {
        throw new NotFoundException('Student not found');
      }
    } else if (createTargetDto.targetType === 'class') {
      const classResult = await db
        .select()
        .from(classes)
        .where(eq(classes.id, createTargetDto.targetId))
        .limit(1);

      if (classResult.length === 0) {
        throw new NotFoundException('Class not found');
      }
    } else if (createTargetDto.targetType === 'section') {
      const sectionResult = await db
        .select()
        .from(sections)
        .where(eq(sections.id, createTargetDto.targetId))
        .limit(1);

      if (sectionResult.length === 0) {
        throw new NotFoundException('Section not found');
      }
    }

    const [result] = await db
      .insert(assignmentTargets)
      .values({
        assignmentId: createTargetDto.assignmentId,
        targetType: createTargetDto.targetType,
        targetId: createTargetDto.targetId,
        assignedBy: createTargetDto.assignedBy,
      })
      .returning();

    // Expand target to StudentAssignments if applicable
    await this.expandAssignmentTarget(createTargetDto.assignmentId, result.id);

    return result;
  }

  async getAssignmentTargets(assignmentId: string) {
    return await db
      .select()
      .from(assignmentTargets)
      .where(eq(assignmentTargets.assignmentId, assignmentId));
  }

  async removeAssignmentTarget(targetId: string) {
    await db
      .delete(assignmentTargets)
      .where(eq(assignmentTargets.id, targetId));

    return { message: 'Assignment target removed successfully' };
  }

  // ==================== HELPER METHODS ====================

  private async expandSectionAssignmentToStudents(
    assignmentId: string,
    sectionId: string,
  ) {
    // Get all students enrolled in classes that have access to this section
    // This is a simplified version - you may need to adjust based on your enrollment logic
    const studentsInSection = await db
      .select({ studentId: students.id })
      .from(students)
      .innerJoin(classEnrollment, eq(students.id, classEnrollment.studentId))
      .where(eq(classEnrollment.status, 'active'));

    const studentIds = studentsInSection.map((s) => s.studentId);

    if (studentIds.length > 0) {
      // Check for existing student assignments to avoid duplicates
      const existing = await db
        .select()
        .from(studentAssignments)
        .where(
          and(
            eq(studentAssignments.assignmentId, assignmentId),
            inArray(studentAssignments.studentId, studentIds),
          ),
        );

      const existingStudentIds = new Set(existing.map((e) => e.studentId));
      const newStudentIds = studentIds.filter(
        (id) => !existingStudentIds.has(id),
      );

      if (newStudentIds.length > 0) {
        const studentAssignmentValues = newStudentIds.map((studentId) => ({
          studentId,
          assignmentId,
          status: 'not_started' as const,
        }));

        await db.insert(studentAssignments).values(studentAssignmentValues);
      }
    }
  }

  private async expandAssignmentTarget(assignmentId: string, targetId: string) {
    const target = await db
      .select()
      .from(assignmentTargets)
      .where(eq(assignmentTargets.id, targetId))
      .limit(1);

    if (target.length === 0) return;

    const assignmentTarget = target[0];
    let studentIds: string[] = [];

    if (assignmentTarget.targetType === 'student') {
      studentIds = [assignmentTarget.targetId];
    } else if (assignmentTarget.targetType === 'class') {
      const enrollments = await db
        .select({ studentId: classEnrollment.studentId })
        .from(classEnrollment)
        .where(
          and(
            eq(classEnrollment.classId, assignmentTarget.targetId),
            eq(classEnrollment.status, 'active'),
          ),
        );

      studentIds = enrollments.map((e) => e.studentId);
    } else if (assignmentTarget.targetType === 'section') {
      // Get students who have access to this section
      // This is simplified - you may need to adjust based on your access logic
      const enrollments = await db
        .select({ studentId: classEnrollment.studentId })
        .from(classEnrollment)
        .where(eq(classEnrollment.status, 'active'));

      studentIds = enrollments.map((e) => e.studentId);
    } else if (assignmentTarget.targetType === 'auto') {
      // Auto-assign based on section assignments
      const sectionAssigns = await db
        .select()
        .from(sectionAssignments)
        .where(
          and(
            eq(sectionAssignments.assignmentId, assignmentId),
            eq(sectionAssignments.autoAssign, true),
          ),
        );

      for (const sectionAssign of sectionAssigns) {
        await this.expandSectionAssignmentToStudents(
          assignmentId,
          sectionAssign.sectionId,
        );
      }
      return; // Already handled in expandSectionAssignmentToStudents
    }

    if (studentIds.length > 0) {
      // Check for existing student assignments to avoid duplicates
      const existing = await db
        .select()
        .from(studentAssignments)
        .where(
          and(
            eq(studentAssignments.assignmentId, assignmentId),
            inArray(studentAssignments.studentId, studentIds),
          ),
        );

      const existingStudentIds = new Set(existing.map((e) => e.studentId));
      const newStudentIds = studentIds.filter(
        (id) => !existingStudentIds.has(id),
      );

      if (newStudentIds.length > 0) {
        const studentAssignmentValues = newStudentIds.map((studentId) => ({
          studentId,
          assignmentId,
          status: 'not_started' as const,
        }));

        await db.insert(studentAssignments).values(studentAssignmentValues);
      }
    }
  }
}
