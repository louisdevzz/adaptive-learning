import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import {
  classEnrollment,
  classes,
  db,
  parentTeacherMessages,
  teacherClassMap,
  users,
} from '../../db';
import { StudentsService } from '../students/students.service';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { SendParentMessageDto } from './dto/send-parent-message.dto';

@Injectable()
export class ParentMessagingService {
  constructor(private readonly studentsService: StudentsService) {}

  async getMessages(
    parentId: string,
    studentId: string,
    query: GetMessagesQueryDto,
  ) {
    await this.studentsService.assertParentCanAccessStudent(parentId, studentId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    const offset = (page - 1) * limit;

    const teacherIds = await this.getStudentTeacherIds(studentId);

    if (teacherIds.length === 0) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const whereClause = and(
      eq(parentTeacherMessages.studentId, studentId),
      or(
        and(
          eq(parentTeacherMessages.senderId, parentId),
          inArray(parentTeacherMessages.recipientId, teacherIds),
        ),
        and(
          inArray(parentTeacherMessages.senderId, teacherIds),
          eq(parentTeacherMessages.recipientId, parentId),
        ),
      ),
    );

    const items = await db
      .select({
        id: parentTeacherMessages.id,
        senderId: parentTeacherMessages.senderId,
        recipientId: parentTeacherMessages.recipientId,
        studentId: parentTeacherMessages.studentId,
        message: parentTeacherMessages.message,
        isRead: parentTeacherMessages.isRead,
        readAt: parentTeacherMessages.readAt,
        createdAt: parentTeacherMessages.createdAt,
        senderName: users.fullName,
      })
      .from(parentTeacherMessages)
      .innerJoin(users, eq(parentTeacherMessages.senderId, users.id))
      .where(whereClause)
      .orderBy(desc(parentTeacherMessages.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(parentTeacherMessages)
      .where(whereClause);

    await db
      .update(parentTeacherMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(parentTeacherMessages.studentId, studentId),
          inArray(parentTeacherMessages.senderId, teacherIds),
          eq(parentTeacherMessages.recipientId, parentId),
          eq(parentTeacherMessages.isRead, false),
        ),
      );

    const total = Number(countResult?.total || 0);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async sendMessage(
    parentId: string,
    studentId: string,
    payload: SendParentMessageDto,
  ) {
    await this.studentsService.assertParentCanAccessStudent(parentId, studentId);

    const teacherIds = await this.getStudentTeacherIds(studentId);
    if (teacherIds.length === 0) {
      throw new NotFoundException('No teacher found for this student');
    }

    const recipientId = payload.recipientTeacherId || teacherIds[0];
    if (!teacherIds.includes(recipientId)) {
      throw new BadRequestException(
        'Recipient teacher is not assigned to this student',
      );
    }

    const [created] = await db
      .insert(parentTeacherMessages)
      .values({
        senderId: parentId,
        recipientId,
        studentId,
        message: payload.message.trim(),
      })
      .returning();

    return created;
  }

  private async getStudentTeacherIds(studentId: string) {
    const homeroomRows = await db
      .select({ teacherId: classes.homeroomTeacherId })
      .from(classEnrollment)
      .innerJoin(classes, eq(classEnrollment.classId, classes.id))
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
        ),
      );

    const classTeacherRows = await db
      .select({ teacherId: teacherClassMap.teacherId })
      .from(classEnrollment)
      .innerJoin(
        teacherClassMap,
        eq(classEnrollment.classId, teacherClassMap.classId),
      )
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
          eq(teacherClassMap.status, 'active'),
        ),
      );

    const allTeacherIds = [...homeroomRows, ...classTeacherRows]
      .map((row) => row.teacherId)
      .filter((id): id is string => Boolean(id));

    return [...new Set(allTeacherIds)];
  }
}
