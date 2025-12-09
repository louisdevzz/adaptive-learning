import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, inArray, SQL } from 'drizzle-orm';
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
} from '../../db';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignToStudentDto } from './dto/assign-to-student.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

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
    if (createAssignmentDto.questions && createAssignmentDto.questions.length > 0) {
      const questionIds = createAssignmentDto.questions.map((q) => q.questionId);
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
          dueDate: createAssignmentDto.dueDate ? new Date(createAssignmentDto.dueDate) : null,
          isPublished: createAssignmentDto.isPublished ?? false,
        })
        .returning();

      // 2. Create assignment items (questions) if provided
      if (createAssignmentDto.questions && createAssignmentDto.questions.length > 0) {
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
    if (isPublished !== undefined) conditions.push(eq(assignments.isPublished, isPublished));

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
      const questionIds = updateAssignmentDto.questions.map((q) => q.questionId);
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
      if (updateAssignmentDto.teacherId) updateData.teacherId = updateAssignmentDto.teacherId;
      if (updateAssignmentDto.title) updateData.title = updateAssignmentDto.title;
      if (updateAssignmentDto.description) updateData.description = updateAssignmentDto.description;
      if (updateAssignmentDto.assignmentType) updateData.assignmentType = updateAssignmentDto.assignmentType;
      if (updateAssignmentDto.dueDate !== undefined) {
        updateData.dueDate = updateAssignmentDto.dueDate ? new Date(updateAssignmentDto.dueDate) : null;
      }
      if (updateAssignmentDto.isPublished !== undefined) updateData.isPublished = updateAssignmentDto.isPublished;

      const [updated] = await tx
        .update(assignments)
        .set(updateData)
        .where(eq(assignments.id, id))
        .returning();

      // 2. Update assignment items if provided
      if (updateAssignmentDto.questions !== undefined) {
        // Delete existing items
        await tx.delete(assignmentItems).where(eq(assignmentItems.assignmentId, id));

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
          eq(studentAssignments.assignmentId, assignmentId)
        )
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

    const [updated] = await db
      .update(studentAssignments)
      .set({
        status: 'in_progress',
        startTime: new Date(),
      })
      .where(eq(studentAssignments.id, studentAssignmentId))
      .returning();

    return updated;
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
      .where(eq(assignmentItems.assignmentId, studentAssignment[0].assignmentId));

    return await db.transaction(async (tx) => {
      let totalScore = 0;
      let maxScore = 0;
      let correctCount = 0;

      // Process each answer
      for (const answer of submitDto.answers) {
        const item = items.find((i) => i.question.id === answer.questionId);
        if (!item) continue;

        const isCorrect = String(answer.answer) === String(item.question.correctAnswer);
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

      // Create result
      const accuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
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
      .innerJoin(assignments, eq(studentAssignments.assignmentId, assignments.id))
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
        eq(studentAssignments.id, studentAssignmentResults.studentAssignmentId)
      )
      .where(eq(studentAssignments.assignmentId, assignmentId));

    return result;
  }
}
