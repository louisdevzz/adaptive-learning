import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { and, desc, eq, gte } from 'drizzle-orm';
import {
  db,
  parentStudentMap,
  parentWeeklyReports,
  users,
} from '../../db';
import { AlertDispatcherService } from './alert-dispatcher.service';

@Injectable()
export class ParentAlertTriggersService {
  constructor(private readonly alertDispatcher: AlertDispatcherService) {}

  @Cron('0 8 * * *')
  async runParentTriggers() {
    const relations = await db
      .select({
        parentId: parentStudentMap.parentId,
        studentId: parentStudentMap.studentId,
        studentName: users.fullName,
      })
      .from(parentStudentMap)
      .innerJoin(users, eq(parentStudentMap.studentId, users.id));

    for (const relation of relations) {
      await this.triggerRiskEscalation(
        relation.parentId,
        relation.studentId,
        relation.studentName,
      );
      await this.triggerWeeklyReportReady(
        relation.parentId,
        relation.studentId,
        relation.studentName,
      );
    }
  }

  private async triggerRiskEscalation(
    parentId: string,
    studentId: string,
    studentName: string,
  ) {
    const reports = await db
      .select({
        riskKpsCount: parentWeeklyReports.riskKpsCount,
        weekStart: parentWeeklyReports.weekStart,
      })
      .from(parentWeeklyReports)
      .where(
        and(
          eq(parentWeeklyReports.parentId, parentId),
          eq(parentWeeklyReports.studentId, studentId),
        ),
      )
      .orderBy(desc(parentWeeklyReports.weekStart))
      .limit(2);

    if (reports.length < 2) return;

    const escalated =
      reports[0].riskKpsCount >= 3 && reports[1].riskKpsCount >= 3;

    if (!escalated) return;

    await this.alertDispatcher.dispatchOne({
      recipientId: parentId,
      relatedStudentId: studentId,
      type: 'parent_risk_escalation',
      title: 'Cảnh báo nguy cơ học tập',
      message: `${studentName} có từ 3 KP nguy cơ trở lên trong 2 tuần liên tiếp. Bạn nên phối hợp với giáo viên để hỗ trợ kịp thời.`,
      actionUrl: `/dashboard/parent/${studentId}`,
      metadata: {
        studentId,
        riskWeeks: 2,
      },
      dedupeWindowMinutes: 7 * 24 * 60,
    });
  }

  private async triggerWeeklyReportReady(
    parentId: string,
    studentId: string,
    studentName: string,
  ) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [latestReport] = await db
      .select({
        id: parentWeeklyReports.id,
        createdAt: parentWeeklyReports.createdAt,
      })
      .from(parentWeeklyReports)
      .where(
        and(
          eq(parentWeeklyReports.parentId, parentId),
          eq(parentWeeklyReports.studentId, studentId),
          gte(parentWeeklyReports.createdAt, sevenDaysAgo),
        ),
      )
      .orderBy(desc(parentWeeklyReports.createdAt))
      .limit(1);

    if (!latestReport) return;

    await this.alertDispatcher.dispatchOne({
      recipientId: parentId,
      relatedStudentId: studentId,
      type: 'weekly_report_ready',
      title: 'Báo cáo tuần mới',
      message: `Báo cáo tuần của ${studentName} đã sẵn sàng.`,
      actionUrl: `/dashboard/parent/${studentId}`,
      metadata: {
        reportId: latestReport.id,
        studentId,
      },
      dedupeWindowMinutes: 7 * 24 * 60,
    });
  }
}
