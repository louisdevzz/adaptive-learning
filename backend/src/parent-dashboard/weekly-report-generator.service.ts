import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import {
  db,
  notifications,
  parentStudentMap,
  parentWeeklyReports,
  questionAttempts,
  studentInsights,
  studentKpProgress,
  timeOnTask,
  users,
} from '../../db';
import { createChatModel } from '../common/ai/chat-model.factory';

interface WeeklyMetrics {
  overallMastery: number;
  masteryChange: number;
  studyTimeMinutes: number;
  attemptsCount: number;
  strengthsCount: number;
  weaknessesCount: number;
  riskKpsCount: number;
  detailedData: Record<string, unknown>;
}

@Injectable()
export class WeeklyReportGeneratorService {
  private readonly logger = new Logger(WeeklyReportGeneratorService.name);

  @Cron('0 6 * * 1')
  async generateWeeklyReports() {
    const { weekStart, weekEnd } = this.getPreviousWeekRange();

    this.logger.log(
      `Generating parent weekly reports for ${weekStart.toISOString()} - ${weekEnd.toISOString()}`,
    );

    try {
      const links = await db
        .select({
          parentId: parentStudentMap.parentId,
          studentId: parentStudentMap.studentId,
        })
        .from(parentStudentMap);

      for (const link of links) {
        await this.generateForParentStudent(
          link.parentId,
          link.studentId,
          weekStart,
          weekEnd,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to generate weekly reports',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async generateForParentStudent(
    parentId: string,
    studentId: string,
    weekStart: Date,
    weekEnd: Date,
  ) {
    const [existing] = await db
      .select({ id: parentWeeklyReports.id })
      .from(parentWeeklyReports)
      .where(
        and(
          eq(parentWeeklyReports.parentId, parentId),
          eq(parentWeeklyReports.studentId, studentId),
          eq(parentWeeklyReports.weekStart, weekStart),
        ),
      )
      .limit(1);

    if (existing) {
      return;
    }

    const metrics = await this.computeWeeklyMetrics(studentId, weekStart, weekEnd);
    const aiSummary = await this.generateAiSummary(metrics);

    await db.insert(parentWeeklyReports).values({
      parentId,
      studentId,
      weekStart,
      weekEnd,
      overallMastery: metrics.overallMastery,
      masteryChange: metrics.masteryChange,
      studyTimeMinutes: metrics.studyTimeMinutes,
      attemptsCount: metrics.attemptsCount,
      strengthsCount: metrics.strengthsCount,
      weaknessesCount: metrics.weaknessesCount,
      riskKpsCount: metrics.riskKpsCount,
      aiSummary,
      detailedData: metrics.detailedData,
    });

    await this.createParentNotification(parentId, studentId, weekStart, weekEnd);
  }

  private async computeWeeklyMetrics(
    studentId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<WeeklyMetrics> {
    const [overallMasteryResult] = await db
      .select({
        value: sql<number>`COALESCE(ROUND(AVG(${studentKpProgress.masteryScore})), 0)`,
      })
      .from(studentKpProgress)
      .where(eq(studentKpProgress.studentId, studentId));

    const [latestInsight] = await db
      .select({
        strengths: studentInsights.strengths,
        weaknesses: studentInsights.weaknesses,
        riskKps: studentInsights.riskKps,
      })
      .from(studentInsights)
      .where(eq(studentInsights.studentId, studentId))
      .orderBy(desc(studentInsights.updatedAt))
      .limit(1);

    const [studyTimeResult] = await db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0)`,
      })
      .from(timeOnTask)
      .where(
        and(
          eq(timeOnTask.studentId, studentId),
          gte(timeOnTask.computedAt, weekStart),
          lt(timeOnTask.computedAt, weekEnd),
        ),
      );

    const [attemptsResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, weekStart),
          lt(questionAttempts.attemptTime, weekEnd),
        ),
      );

    const [previousReport] = await db
      .select({ overallMastery: parentWeeklyReports.overallMastery })
      .from(parentWeeklyReports)
      .where(eq(parentWeeklyReports.studentId, studentId))
      .orderBy(desc(parentWeeklyReports.weekStart))
      .limit(1);

    const overallMastery = Number(overallMasteryResult?.value || 0);
    const previousMastery = Number(previousReport?.overallMastery || 0);
    const strengths = Array.isArray(latestInsight?.strengths)
      ? latestInsight.strengths
      : [];
    const weaknesses = Array.isArray(latestInsight?.weaknesses)
      ? latestInsight.weaknesses
      : [];
    const riskKps = Array.isArray(latestInsight?.riskKps)
      ? latestInsight.riskKps
      : [];

    return {
      overallMastery,
      masteryChange: overallMastery - previousMastery,
      studyTimeMinutes: Math.round(Number(studyTimeResult?.totalSeconds || 0) / 60),
      attemptsCount: Number(attemptsResult?.count || 0),
      strengthsCount: strengths.length,
      weaknessesCount: weaknesses.length,
      riskKpsCount: riskKps.length,
      detailedData: {
        strengths,
        weaknesses,
        riskKps,
      },
    };
  }

  private async generateAiSummary(metrics: WeeklyMetrics) {
    try {
      const { chatModel } = createChatModel({ temperature: 0.2 });
      const response = await chatModel.invoke([
        {
          role: 'system',
          content:
            'Bạn là trợ lý giáo dục. Viết tóm tắt ngắn bằng tiếng Việt cho phụ huynh, giọng điệu tích cực, rõ ràng, 2-3 câu.',
        },
        {
          role: 'user',
          content: `Dữ liệu tuần: mastery ${metrics.overallMastery}, thay đổi ${metrics.masteryChange}, thời gian học ${metrics.studyTimeMinutes} phút, số lần làm bài ${metrics.attemptsCount}, điểm mạnh ${metrics.strengthsCount}, điểm yếu ${metrics.weaknessesCount}, nguy cơ ${metrics.riskKpsCount}.`,
        },
      ]);

      const raw =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      const summary = raw.trim();
      if (summary.length > 0) {
        return summary;
      }
    } catch (error) {
      this.logger.warn(
        `AI summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return this.buildFallbackSummary(metrics);
  }

  private buildFallbackSummary(metrics: WeeklyMetrics) {
    const trend =
      metrics.masteryChange > 0
        ? 'có tiến bộ'
        : metrics.masteryChange < 0
          ? 'cần hỗ trợ thêm'
          : 'duy trì ổn định';

    return `Tuần này con ${trend} với mức nắm vững trung bình ${metrics.overallMastery}%. Con đã học ${metrics.studyTimeMinutes} phút và thực hiện ${metrics.attemptsCount} lượt làm bài. Hệ thống ghi nhận ${metrics.riskKpsCount} điểm kiến thức cần theo dõi thêm.`;
  }

  private async createParentNotification(
    parentId: string,
    studentId: string,
    weekStart: Date,
    weekEnd: Date,
  ) {
    const [student] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);

    const weekStartText = weekStart.toLocaleDateString('vi-VN');
    const weekEndText = new Date(weekEnd.getTime() - 1).toLocaleDateString(
      'vi-VN',
    );

    await db.insert(notifications).values({
      recipientId: parentId,
      relatedStudentId: studentId,
      type: 'parent_weekly_report',
      title: `Báo cáo tuần của ${student?.fullName || 'học sinh'}`,
      message: `Báo cáo tuần ${weekStartText} - ${weekEndText} đã sẵn sàng.`,
      actionUrl: `/dashboard/parent/${studentId}`,
      metadata: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      },
    });
  }

  private getPreviousWeekRange() {
    const now = new Date();
    const day = now.getDay();
    const currentMondayOffset = day === 0 ? -6 : 1 - day;

    const currentWeekMonday = new Date(now);
    currentWeekMonday.setHours(0, 0, 0, 0);
    currentWeekMonday.setDate(now.getDate() + currentMondayOffset);

    const previousWeekMonday = new Date(currentWeekMonday);
    previousWeekMonday.setDate(currentWeekMonday.getDate() - 7);

    return {
      weekStart: previousWeekMonday,
      weekEnd: currentWeekMonday,
    };
  }
}
