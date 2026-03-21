import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { and, desc, eq, lt } from 'drizzle-orm';
import {
  db,
  classes,
  teacherInterventions,
  teacherClassMap,
  users,
} from '../../db';
import { AlertDispatcherService } from './alert-dispatcher.service';

@Injectable()
export class TeacherAlertTriggersService {
  constructor(private readonly alertDispatcher: AlertDispatcherService) {}

  @Cron('30 8 * * *')
  async runTeacherTriggers() {
    const activeTeacherClasses = await db
      .select({
        teacherId: teacherClassMap.teacherId,
        classId: teacherClassMap.classId,
        className: classes.className,
      })
      .from(teacherClassMap)
      .innerJoin(classes, eq(teacherClassMap.classId, classes.id))
      .where(eq(teacherClassMap.status, 'active'));

    for (const item of activeTeacherClasses) {
      await this.triggerOutlierDetected(
        item.teacherId,
        item.classId,
        item.className,
      );
    }

    await this.triggerOverdueInterventions();
  }

  private async triggerOutlierDetected(
    teacherId: string,
    classId: string,
    className: string,
  ) {
    const outlierCount = await db
      .select({
        count: teacherInterventions.id,
      })
      .from(teacherInterventions)
      .where(
        and(
          eq(teacherInterventions.teacherId, teacherId),
          eq(teacherInterventions.classId, classId),
          eq(teacherInterventions.status, 'pending'),
          eq(teacherInterventions.priority, 'critical'),
        ),
      );

    if (outlierCount.length === 0) {
      return;
    }

    await this.alertDispatcher.dispatchOne({
      recipientId: teacherId,
      type: 'teacher_outlier_detected',
      title: 'Lớp có học sinh cần can thiệp',
      message: `Lớp ${className} hiện có can thiệp mức critical đang chờ xử lý.`,
      actionUrl: `/dashboard/interventions/class/${classId}`,
      metadata: {
        classId,
        className,
      },
    });
  }

  private async triggerOverdueInterventions() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const overdue = await db
      .select({
        id: teacherInterventions.id,
        teacherId: teacherInterventions.teacherId,
        studentId: teacherInterventions.studentId,
        title: teacherInterventions.title,
      })
      .from(teacherInterventions)
      .where(
        and(
          eq(teacherInterventions.status, 'pending'),
          lt(teacherInterventions.createdAt, sevenDaysAgo),
        ),
      )
      .orderBy(desc(teacherInterventions.createdAt));

    for (const item of overdue) {
      await this.alertDispatcher.dispatchOne({
        recipientId: item.teacherId,
        relatedStudentId: item.studentId,
        type: 'teacher_intervention_overdue',
        title: 'Intervention quá hạn',
        message: `Intervention "${item.title}" đã quá hạn xử lý.`,
        actionUrl: `/dashboard/interventions/student/${item.studentId}`,
        metadata: {
          interventionId: item.id,
          studentId: item.studentId,
        },
      });
    }
  }
}
