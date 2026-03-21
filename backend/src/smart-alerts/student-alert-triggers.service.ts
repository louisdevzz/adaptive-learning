import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { and, desc, eq, gte, lt } from 'drizzle-orm';
import {
  db,
  questionAttempts,
  studentKpHistory,
  students,
  users,
} from '../../db';
import { AlertDispatcherService } from './alert-dispatcher.service';

@Injectable()
export class StudentAlertTriggersService {
  constructor(private readonly alertDispatcher: AlertDispatcherService) {}

  @Cron('0 */6 * * *')
  async runStudentTriggers() {
    const allStudents = await db
      .select({ id: students.id, fullName: users.fullName })
      .from(students)
      .innerJoin(users, eq(students.id, users.id));

    for (const student of allStudents) {
      await this.triggerInactivityAlert(student.id, student.fullName);
      await this.triggerFailureStreakAlert(student.id, student.fullName);
      await this.triggerMasteredCelebration(student.id, student.fullName);
    }
  }

  private async triggerInactivityAlert(studentId: string, fullName: string) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const [recentAttempt] = await db
      .select({ id: questionAttempts.id })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, threeDaysAgo),
        ),
      )
      .limit(1);

    if (recentAttempt) return;

    await this.alertDispatcher.dispatchOne({
      recipientId: studentId,
      type: 'study_inactivity',
      title: 'Nhắc nhở học tập',
      message: `${fullName}, bạn đã 3 ngày chưa luyện tập. Hãy quay lại để duy trì tiến độ!`,
      actionUrl: '/dashboard/my-courses',
      metadata: { studentId },
      dedupeWindowMinutes: 24 * 60,
    });
  }

  private async triggerFailureStreakAlert(studentId: string, fullName: string) {
    const recentAttempts = await db
      .select({ isCorrect: questionAttempts.isCorrect })
      .from(questionAttempts)
      .where(eq(questionAttempts.studentId, studentId))
      .orderBy(desc(questionAttempts.attemptTime))
      .limit(5);

    if (recentAttempts.length < 5) return;

    const allWrong = recentAttempts.every((item) => !item.isCorrect);
    if (!allWrong) return;

    await this.alertDispatcher.dispatchOne({
      recipientId: studentId,
      type: 'failure_streak',
      title: 'Bạn có thể cần trợ giúp',
      message: `${fullName}, bạn đang có chuỗi 5 câu sai liên tiếp. Hãy xem lại tài liệu hoặc hỏi giáo viên để được hỗ trợ.`,
      actionUrl: '/dashboard/progress',
      metadata: { studentId, streak: 5 },
      dedupeWindowMinutes: 12 * 60,
    });
  }

  private async triggerMasteredCelebration(studentId: string, fullName: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const masteredRows = await db
      .select({ kpId: studentKpHistory.kpId })
      .from(studentKpHistory)
      .where(
        and(
          eq(studentKpHistory.studentId, studentId),
          gte(studentKpHistory.timestamp, sevenDaysAgo),
          lt(studentKpHistory.oldScore, 80),
          gte(studentKpHistory.newScore, 80),
        ),
      );

    const uniqueKpIds = [...new Set(masteredRows.map((item) => item.kpId))];
    if (uniqueKpIds.length < 3) return;

    await this.alertDispatcher.dispatchOne({
      recipientId: studentId,
      type: 'mastery_celebration',
      title: 'Chúc mừng tiến bộ nổi bật!',
      message: `${fullName}, bạn đã nắm vững ${uniqueKpIds.length} điểm kiến thức trong tuần này. Tiếp tục phát huy nhé!`,
      actionUrl: '/dashboard/progress',
      metadata: { studentId, masteredCount: uniqueKpIds.length },
      dedupeWindowMinutes: 7 * 24 * 60,
    });
  }
}
