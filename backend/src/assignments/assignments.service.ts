import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, inArray, SQL, or, desc } from 'drizzle-orm';
import {
  db,
  assignments,
  assignmentItems,
  studentAssignments,
  studentAssignmentResults,
  questionAttempts,
  questionBank,
  teachers,
  students,
  sections,
  classes,
  classEnrollment,
  sectionAssignments,
  assignmentTargets,
  assignmentAttempts,
} from '../../db';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignToStudentDto } from './dto/assign-to-student.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { AssignToSectionDto } from './dto/assign-to-section.dto';
import { CreateAssignmentTargetDto } from './dto/create-assignment-target.dto';
import {
  CreateAssignmentAttemptDto,
  UpdateAssignmentAttemptDto,
} from './dto/create-assignment-attempt.dto';

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

    // Validate questions exist if provided
    if (
      createAssignmentDto.questions &&
      createAssignmentDto.questions.length > 0
    ) {
      const questionIds = createAssignmentDto.questions.map(
        (q) => q.questionId,
      );
      const existingQuestions = await db
        .select()
        .from(questionBank)
        .where(inArray(questionBank.id, questionIds));

      if (existingQuestions.length !== questionIds.length) {
        throw new BadRequestException('One or more questions do not exist');
      }
    }

    // Use transaction to create assignment with items
    return await db.transaction(async (tx) => {
      // 1. Create the assignment
      const [assignment] = await tx
        .insert(assignments)
        .values({
          teacherId: createAssignmentDto.teacherId,
          title: createAssignmentDto.title,
          description: createAssignmentDto.description,
          assignmentType: createAssignmentDto.assignmentType,
          dueDate: createAssignmentDto.dueDate
            ? new Date(createAssignmentDto.dueDate)
            : null,
          isPublished: createAssignmentDto.isPublished ?? false,
        })
        .returning();

      // 2. Create assignment items (questions) if provided
      if (
        createAssignmentDto.questions &&
        createAssignmentDto.questions.length > 0
      ) {
        const itemValues = createAssignmentDto.questions.map((question) => ({
          assignmentId: assignment.id,
          questionId: question.questionId,
          orderIndex: question.orderIndex,
          points: question.points,
        }));

        await tx.insert(assignmentItems).values(itemValues);
      }

      return assignment;
    });
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

    // Get assignment items (questions)
    const items = await db
      .select({
        item: assignmentItems,
        question: questionBank,
      })
      .from(assignmentItems)
      .innerJoin(questionBank, eq(assignmentItems.questionId, questionBank.id))
      .where(eq(assignmentItems.assignmentId, id))
      .orderBy(assignmentItems.orderIndex);

    return {
      ...assignment,
      questions: items.map((item) => ({
        ...item.question,
        orderIndex: item.item.orderIndex,
        points: item.item.points,
      })),
    };
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

    // Validate questions if provided
    if (updateAssignmentDto.questions) {
      const questionIds = updateAssignmentDto.questions.map(
        (q) => q.questionId,
      );
      const existingQuestions = await db
        .select()
        .from(questionBank)
        .where(inArray(questionBank.id, questionIds));

      if (existingQuestions.length !== questionIds.length) {
        throw new BadRequestException('One or more questions do not exist');
      }
    }

    return await db.transaction(async (tx) => {
      // 1. Update the assignment
      const updateData: any = { updatedAt: new Date() };
      if (updateAssignmentDto.teacherId)
        updateData.teacherId = updateAssignmentDto.teacherId;
      if (updateAssignmentDto.title)
        updateData.title = updateAssignmentDto.title;
      if (updateAssignmentDto.description)
        updateData.description = updateAssignmentDto.description;
      if (updateAssignmentDto.assignmentType)
        updateData.assignmentType = updateAssignmentDto.assignmentType;
      if (updateAssignmentDto.dueDate !== undefined) {
        updateData.dueDate = updateAssignmentDto.dueDate
          ? new Date(updateAssignmentDto.dueDate)
          : null;
      }
      if (updateAssignmentDto.isPublished !== undefined)
        updateData.isPublished = updateAssignmentDto.isPublished;

      const [updated] = await tx
        .update(assignments)
        .set(updateData)
        .where(eq(assignments.id, id))
        .returning();

      // 2. Update assignment items if provided
      if (updateAssignmentDto.questions !== undefined) {
        // Delete existing items
        await tx
          .delete(assignmentItems)
          .where(eq(assignmentItems.assignmentId, id));

        // Insert new items
        if (updateAssignmentDto.questions.length > 0) {
          const itemValues = updateAssignmentDto.questions.map((question) => ({
            assignmentId: id,
            questionId: question.questionId,
            orderIndex: question.orderIndex,
            points: question.points,
          }));

          await tx.insert(assignmentItems).values(itemValues);
        }
      }

      return updated;
    });
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

  async startAssignment(studentAssignmentId: string) {
    const result = await db
      .select()
      .from(studentAssignments)
      .where(eq(studentAssignments.id, studentAssignmentId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Student assignment not found');
    }

    return await db.transaction(async (tx) => {
      // Update student assignment status
      const [updated] = await tx
        .update(studentAssignments)
        .set({
          status: 'in_progress',
          startTime: new Date(),
        })
        .where(eq(studentAssignments.id, studentAssignmentId))
        .returning();

      // Create assignment attempt
      await tx.insert(assignmentAttempts).values({
        studentAssignmentId,
        attemptStatus: 'in_progress',
      });

      return updated;
    });
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

    // Get assignment items
    const items = await db
      .select({
        item: assignmentItems,
        question: questionBank,
      })
      .from(assignmentItems)
      .innerJoin(questionBank, eq(assignmentItems.questionId, questionBank.id))
      .where(
        eq(assignmentItems.assignmentId, studentAssignment[0].assignmentId),
      );

    return await db.transaction(async (tx) => {
      let totalScore = 0;
      let maxScore = 0;
      let correctCount = 0;

      // Process each answer
      for (const answer of submitDto.answers) {
        const item = items.find((i) => i.question.id === answer.questionId);
        if (!item) continue;

        const isCorrect =
          String(answer.answer) === String(item.question.correctAnswer);
        if (isCorrect) {
          totalScore += item.item.points;
          correctCount++;
        }
        maxScore += item.item.points;

        // Create question attempt
        await tx.insert(questionAttempts).values({
          studentId: studentAssignment[0].studentId,
          questionId: answer.questionId,
          assignmentId: studentAssignment[0].assignmentId,
          selectedAnswer: String(answer.answer),
          isCorrect,
          timeSpent: 0, // TODO: Track time spent per question
        });
      }

      // Update student assignment status
      await tx
        .update(studentAssignments)
        .set({
          status: 'submitted',
          submittedTime: new Date(),
        })
        .where(eq(studentAssignments.id, submitDto.studentAssignmentId));

      // Update the latest assignment attempt to submitted
      const latestAttempt = await tx
        .select()
        .from(assignmentAttempts)
        .where(
          eq(
            assignmentAttempts.studentAssignmentId,
            submitDto.studentAssignmentId,
          ),
        )
        .orderBy(desc(assignmentAttempts.startedAt))
        .limit(1);

      if (latestAttempt.length > 0) {
        await tx
          .update(assignmentAttempts)
          .set({
            attemptStatus: 'submitted',
            endedAt: new Date(),
          })
          .where(eq(assignmentAttempts.id, latestAttempt[0].id));
      }

      // Create result
      const accuracy =
        maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const startTime = studentAssignment[0].startTime
        ? new Date(studentAssignment[0].startTime).getTime()
        : Date.now();
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      const [result] = await tx
        .insert(studentAssignmentResults)
        .values({
          studentAssignmentId: submitDto.studentAssignmentId,
          totalScore,
          maxScore,
          accuracy,
          timeSpent,
        })
        .returning();

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
      })
      .from(studentAssignments)
      .leftJoin(
        studentAssignmentResults,
        eq(studentAssignments.id, studentAssignmentResults.studentAssignmentId),
      )
      .where(eq(studentAssignments.assignmentId, assignmentId));

    return result;
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

  // ==================== ASSIGNMENT ATTEMPTS ====================

  async createAssignmentAttempt(createAttemptDto: CreateAssignmentAttemptDto) {
    // Validate student assignment exists
    const studentAssignment = await db
      .select()
      .from(studentAssignments)
      .where(eq(studentAssignments.id, createAttemptDto.studentAssignmentId))
      .limit(1);

    if (studentAssignment.length === 0) {
      throw new NotFoundException('Student assignment not found');
    }

    const [result] = await db
      .insert(assignmentAttempts)
      .values({
        studentAssignmentId: createAttemptDto.studentAssignmentId,
        attemptStatus: createAttemptDto.attemptStatus ?? 'in_progress',
      })
      .returning();

    return result;
  }

  async updateAssignmentAttempt(
    attemptId: string,
    updateAttemptDto: UpdateAssignmentAttemptDto,
  ) {
    const updateData: any = {};
    if (updateAttemptDto.attemptStatus)
      updateData.attemptStatus = updateAttemptDto.attemptStatus;
    if (updateAttemptDto.endedAt)
      updateData.endedAt = new Date(updateAttemptDto.endedAt);
    else if (
      updateAttemptDto.attemptStatus === 'submitted' ||
      updateAttemptDto.attemptStatus === 'abandoned'
    ) {
      updateData.endedAt = new Date();
    }

    const [updated] = await db
      .update(assignmentAttempts)
      .set(updateData)
      .where(eq(assignmentAttempts.id, attemptId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Assignment attempt not found');
    }

    return updated;
  }

  async getAssignmentAttempts(studentAssignmentId: string) {
    return await db
      .select()
      .from(assignmentAttempts)
      .where(eq(assignmentAttempts.studentAssignmentId, studentAssignmentId))
      .orderBy(desc(assignmentAttempts.startedAt));
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
