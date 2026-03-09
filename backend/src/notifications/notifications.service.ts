import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { and, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';
import {
  db,
  assignments,
  knowledgePoint,
  notifications,
  parentStudentMap,
  students,
  users,
} from '../../db';
import { CreateProgressAlertDto } from './dto/create-progress-alert.dto';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';

interface CreateNotificationInput {
  recipientId: string;
  actorUserId?: string | null;
  relatedStudentId?: string | null;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
}

interface ProgressUpdatedEvent {
  studentId: string;
  kpId: string;
  newMasteryScore: number;
  oldMasteryScore?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async getMyNotifications(
    userId: string,
    query: GetNotificationsQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(notifications.recipientId, userId)];
    if (query.unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }
    if (query.type?.trim()) {
      conditions.push(eq(notifications.type, query.type.trim()));
    }

    const whereClause =
      conditions.length === 1 ? conditions[0] : and(...conditions)!;

    const items = await db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(whereClause);

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

  async getUnreadCount(userId: string) {
    const [result] = await db
      .select({ unreadCount: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, userId),
          eq(notifications.isRead, false),
        ),
      );

    return { unreadCount: Number(result?.unreadCount || 0) };
  }

  async markAsRead(userId: string, notificationId: string) {
    const [updated] = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientId, userId),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Notification not found');
    }

    return updated;
  }

  async markAllAsRead(userId: string) {
    const updatedRows = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.recipientId, userId),
          eq(notifications.isRead, false),
        ),
      )
      .returning({ one: sql<number>`1` });

    return { updatedCount: updatedRows.length };
  }

  async createProgressAlert(
    studentId: string,
    dto: CreateProgressAlertDto,
    actorUserId?: string,
  ) {
    const studentRows = await db
      .select({
        id: students.id,
        fullName: users.fullName,
      })
      .from(students)
      .innerJoin(users, eq(students.id, users.id))
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentRows.length === 0) {
      throw new NotFoundException('Student not found');
    }

    const student = studentRows[0];
    const parentLinks = await this.getParentLinks([studentId]);
    const parentsOfStudent = parentLinks.filter((p) => p.studentId === studentId);

    const title = dto.title?.trim() || 'Cập nhật tiến độ học tập';
    const studentMessage = dto.message.trim();
    const parentMessage = `${student.fullName}: ${studentMessage}`;
    const actionUrl =
      dto.actionUrl?.trim() || '/dashboard/children-progress';

    const payloads: CreateNotificationInput[] = [
      {
        recipientId: studentId,
        actorUserId: actorUserId || null,
        relatedStudentId: studentId,
        type: 'progress_alert',
        title,
        message: studentMessage,
        actionUrl: '/dashboard/progress',
        metadata: {
          courseName: dto.courseName || null,
          masteryScore: dto.masteryScore ?? null,
        },
      },
      ...parentsOfStudent.map((parent) => ({
        recipientId: parent.parentId,
        actorUserId: actorUserId || null,
        relatedStudentId: studentId,
        type: 'child_progress_alert',
        title,
        message: parentMessage,
        actionUrl,
        metadata: {
          studentId,
          studentName: student.fullName,
          courseName: dto.courseName || null,
          masteryScore: dto.masteryScore ?? null,
        },
      })),
    ];

    await this.createMany(payloads);

    return {
      message: 'Progress notifications sent',
      recipients: payloads.length,
    };
  }

  async notifyAssignmentAssignedToStudents(
    studentIds: string[],
    assignmentId: string,
    actorUserId?: string,
  ) {
    const uniqueStudentIds = [...new Set(studentIds)];
    if (uniqueStudentIds.length === 0) return;

    const [assignment] = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        dueDate: assignments.dueDate,
      })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) return;

    const studentRows = await db
      .select({ id: users.id, fullName: users.fullName })
      .from(users)
      .where(inArray(users.id, uniqueStudentIds));

    const studentNameMap = new Map(
      studentRows.map((student) => [student.id, student.fullName]),
    );

    const parentLinks = await this.getParentLinks(uniqueStudentIds);
    const dueDateText = assignment.dueDate
      ? ` Hạn nộp: ${new Date(assignment.dueDate).toLocaleDateString('vi-VN')}.`
      : '';

    const payloads: CreateNotificationInput[] = [];

    for (const studentId of uniqueStudentIds) {
      payloads.push({
        recipientId: studentId,
        actorUserId: actorUserId || null,
        relatedStudentId: studentId,
        type: 'assignment_assigned',
        title: 'Bạn có bài tập mới',
        message: `Bài tập "${assignment.title}" đã được giao cho bạn.${dueDateText}`,
        actionUrl: '/dashboard/assignments',
        metadata: {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          dueDate: assignment.dueDate,
        },
      });
    }

    for (const parentLink of parentLinks) {
      const studentName =
        studentNameMap.get(parentLink.studentId) || 'Con của bạn';
      payloads.push({
        recipientId: parentLink.parentId,
        actorUserId: actorUserId || null,
        relatedStudentId: parentLink.studentId,
        type: 'child_assignment_assigned',
        title: 'Con bạn có bài tập mới',
        message: `${studentName} vừa nhận bài tập "${assignment.title}".${dueDateText}`,
        actionUrl: '/dashboard/children-progress',
        metadata: {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          studentId: parentLink.studentId,
          studentName,
          dueDate: assignment.dueDate,
        },
      });
    }

    await this.createMany(payloads);
  }

  async notifyAssignmentGraded(
    studentId: string,
    assignmentId: string,
    totalScore: number,
    maxScore: number,
    accuracy: number,
    actorUserId?: string,
  ) {
    const [assignment] = await db
      .select({ id: assignments.id, title: assignments.title })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) return;

    const studentRows = await db
      .select({ id: users.id, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);

    if (studentRows.length === 0) return;

    const studentName = studentRows[0].fullName;
    const parentLinks = await this.getParentLinks([studentId]);
    const scoreText = `${totalScore}/${maxScore} (${accuracy}%)`;

    const payloads: CreateNotificationInput[] = [
      {
        recipientId: studentId,
        actorUserId: actorUserId || null,
        relatedStudentId: studentId,
        type: 'assignment_graded',
        title: 'Bài tập đã được chấm',
        message: `Bạn nhận ${scoreText} cho "${assignment.title}".`,
        actionUrl: '/dashboard/assignments',
        metadata: {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          totalScore,
          maxScore,
          accuracy,
        },
      },
      ...parentLinks.map((parent) => ({
        recipientId: parent.parentId,
        actorUserId: actorUserId || null,
        relatedStudentId: studentId,
        type: 'child_assignment_graded',
        title: 'Bài tập của con đã được chấm',
        message: `${studentName} nhận ${scoreText} cho "${assignment.title}".`,
        actionUrl: '/dashboard/children-progress',
        metadata: {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          studentId,
          studentName,
          totalScore,
          maxScore,
          accuracy,
        },
      })),
    ];

    await this.createMany(payloads);
  }

  @OnEvent('progress.updated')
  async handleProgressUpdated(event: ProgressUpdatedEvent) {
    const oldScore = event.oldMasteryScore ?? 0;
    const newScore = event.newMasteryScore;
    const delta = newScore - oldScore;

    const crossedMastery = oldScore < 60 && newScore >= 60;
    const crossedExcellent = oldScore < 80 && newScore >= 80;
    const droppedNotably = oldScore >= 60 && newScore < 50;
    const largeChange = Math.abs(delta) >= 20;

    if (
      !crossedMastery &&
      !crossedExcellent &&
      !droppedNotably &&
      !largeChange
    ) {
      return;
    }

    try {
      const [student] = await db
        .select({ id: users.id, fullName: users.fullName })
        .from(users)
        .where(eq(users.id, event.studentId))
        .limit(1);
      if (!student) return;

      const [kp] = await db
        .select({ id: knowledgePoint.id, title: knowledgePoint.title })
        .from(knowledgePoint)
        .where(eq(knowledgePoint.id, event.kpId))
        .limit(1);
      if (!kp) return;

      const parentLinks = await this.getParentLinks([event.studentId]);

      let studentTitle = 'Cập nhật tiến độ học tập';
      if (crossedExcellent) {
        studentTitle = 'Xuất sắc! Bạn đang tiến bộ rất tốt';
      } else if (crossedMastery) {
        studentTitle = 'Bạn đã nắm vững một điểm kiến thức';
      } else if (droppedNotably) {
        studentTitle = 'Cần ôn lại điểm kiến thức này';
      }

      const directionText = delta >= 0 ? `+${delta}` : `${delta}`;
      const studentMessage = `Điểm "${kp.title}" hiện là ${newScore}% (${directionText}%).`;
      const parentMessage = `${student.fullName} có cập nhật ở "${kp.title}": ${newScore}% (${directionText}%).`;

      const payloads: CreateNotificationInput[] = [
        {
          recipientId: event.studentId,
          relatedStudentId: event.studentId,
          type: 'progress_update',
          title: studentTitle,
          message: studentMessage,
          actionUrl: '/dashboard/progress',
          metadata: {
            kpId: kp.id,
            kpTitle: kp.title,
            oldScore,
            newScore,
            delta,
          },
        },
        ...parentLinks.map((parent) => ({
          recipientId: parent.parentId,
          relatedStudentId: event.studentId,
          type: 'child_progress_update',
          title: `Tiến độ học của ${student.fullName} vừa thay đổi`,
          message: parentMessage,
          actionUrl: '/dashboard/children-progress',
          metadata: {
            studentId: event.studentId,
            studentName: student.fullName,
            kpId: kp.id,
            kpTitle: kp.title,
            oldScore,
            newScore,
            delta,
          },
        })),
      ];

      await this.createMany(payloads);
    } catch (error) {
      this.logger.error(
        `Failed to create progress notifications for student ${event.studentId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async getParentLinks(studentIds: string[]) {
    if (studentIds.length === 0) return [];
    return await db
      .select({
        parentId: parentStudentMap.parentId,
        studentId: parentStudentMap.studentId,
      })
      .from(parentStudentMap)
      .where(inArray(parentStudentMap.studentId, [...new Set(studentIds)]));
  }

  private async createMany(payloads: CreateNotificationInput[]) {
    if (payloads.length === 0) return;

    await db.insert(notifications).values(
      payloads.map((payload) => ({
        recipientId: payload.recipientId,
        actorUserId: payload.actorUserId || null,
        relatedStudentId: payload.relatedStudentId || null,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        actionUrl: payload.actionUrl || null,
        metadata: payload.metadata ?? {},
      })),
    );
  }
}
