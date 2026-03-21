import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { eq, and, sql, gte, desc } from 'drizzle-orm';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  db,
  studentInsights,
  studentKpProgress,
  studentKpHistory,
  knowledgePoint,
  questionAttempts,
  timeOnTask,
  students,
  classEnrollment,
} from '../../db';
import {
  computeInsights,
  KpProgressData,
  KpHistoryRecord,
  AttemptData,
  InsightsResult,
} from './student-insights-analyzer';
import { createChatModel } from '../common/ai/chat-model.factory';

@Injectable()
export class StudentInsightsService {
  private readonly logger = new Logger(StudentInsightsService.name);
  private readonly processingStudents = new Set<string>();

  /**
   * Daily cron at 2am: compute insights for all active students
   */
  @Cron('0 2 * * *')
  async computeAllStudentInsights() {
    this.logger.log('Starting daily student insights computation...');

    try {
      const activeStudents = await this.getActiveStudents();
      this.logger.log(
        `Processing insights for ${activeStudents.length} students`,
      );

      let successCount = 0;
      let errorCount = 0;

      for (const studentId of activeStudents) {
        try {
          await this.computeAndSaveInsights(studentId);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to compute insights for student ${studentId}:`,
            error instanceof Error ? error.message : 'Unknown error',
          );
          errorCount++;
        }
      }

      this.logger.log(
        `Insights computation completed. Success: ${successCount}, Errors: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error(
        'Critical error in insights computation:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Event-driven: react to significant progress changes
   */
  @OnEvent('progress.updated')
  async handleProgressUpdate(payload: {
    studentId: string;
    kpId: string;
    newMasteryScore: number;
    oldMasteryScore?: number;
  }) {
    const { studentId, newMasteryScore, oldMasteryScore } = payload;

    // Only react to significant changes (|delta| >= 15)
    if (
      oldMasteryScore !== undefined &&
      Math.abs(newMasteryScore - oldMasteryScore) < 15
    ) {
      return;
    }

    try {
      await this.computeAndSaveInsights(studentId);
    } catch (error) {
      this.logger.error(
        `Failed to update insights for student ${studentId}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Main pipeline: gather data, compute, optionally enrich with AI, save
   */
  async computeAndSaveInsights(studentId: string): Promise<void> {
    if (this.processingStudents.has(studentId)) {
      return;
    }

    this.processingStudents.add(studentId);
    try {
      // Gather data
      const progressData = await this.getProgressData(studentId);
      const historyRecords = await this.getHistoryRecords(studentId);
      const attempts = await this.getAttemptData(studentId);
      const recentStudyMinutes = await this.getRecentStudyMinutes(studentId);

      // Compute insights
      const insights = computeInsights(
        progressData,
        historyRecords,
        attempts,
        recentStudyMinutes,
      );

      // AI enrichment if enough data
      const totalAttempts = progressData.reduce(
        (sum, p) => sum + p.totalAttempts,
        0,
      );
      if (totalAttempts >= 10) {
        await this.enrichWithAi(insights);
      }

      // Save to DB
      await this.saveInsights(studentId, insights);
    } finally {
      this.processingStudents.delete(studentId);
    }
  }

  private async getProgressData(
    studentId: string,
  ): Promise<KpProgressData[]> {
    const rows = await db
      .select({
        kpId: studentKpProgress.kpId,
        masteryScore: studentKpProgress.masteryScore,
        lastUpdated: studentKpProgress.lastUpdated,
        kpTitle: knowledgePoint.title,
        totalAttempts: sql<number>`(
          SELECT COUNT(*) FROM question_attempts qa
          WHERE qa.student_id = ${studentKpProgress.studentId}
          AND qa.kp_id = ${studentKpProgress.kpId}
        )`,
      })
      .from(studentKpProgress)
      .innerJoin(knowledgePoint, eq(studentKpProgress.kpId, knowledgePoint.id))
      .where(eq(studentKpProgress.studentId, studentId));

    return rows.map((r) => ({
      kpId: r.kpId,
      kpTitle: r.kpTitle,
      masteryScore: r.masteryScore,
      lastUpdated: r.lastUpdated,
      totalAttempts: Number(r.totalAttempts),
    }));
  }

  private async getHistoryRecords(
    studentId: string,
  ): Promise<KpHistoryRecord[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        kpId: studentKpHistory.kpId,
        oldScore: studentKpHistory.oldScore,
        newScore: studentKpHistory.newScore,
        timestamp: studentKpHistory.timestamp,
      })
      .from(studentKpHistory)
      .where(
        and(
          eq(studentKpHistory.studentId, studentId),
          gte(studentKpHistory.timestamp, sevenDaysAgo),
        ),
      );

    return rows;
  }

  private async getAttemptData(studentId: string): Promise<AttemptData[]> {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        attemptTime: questionAttempts.attemptTime,
        timeSpent: questionAttempts.timeSpent,
        isCorrect: questionAttempts.isCorrect,
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, fourteenDaysAgo),
        ),
      )
      .orderBy(desc(questionAttempts.attemptTime));

    return rows;
  }

  private async getRecentStudyMinutes(studentId: string): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [result] = await db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0)`,
      })
      .from(timeOnTask)
      .where(
        and(
          eq(timeOnTask.studentId, studentId),
          gte(timeOnTask.computedAt, sevenDaysAgo),
        ),
      );

    return Math.round((result?.totalSeconds || 0) / 60);
  }

  /**
   * AI enrichment: generate reasons for strengths/weaknesses
   */
  private async enrichWithAi(insights: InsightsResult): Promise<void> {
    try {
      const { chatModel } = createChatModel({ temperature: 0.3 });

      const prompt = this.buildAiPrompt(insights);
      const response = await chatModel.invoke([
        new SystemMessage(
          'You are an educational analytics AI. Respond in Vietnamese. ' +
            'Analyze student learning data and provide brief explanations. ' +
            'Return valid JSON only.',
        ),
        new HumanMessage(prompt),
      ]);

      const parsed = JSON.parse(response.content);

      // Enrich strengths
      if (parsed.strengths && Array.isArray(parsed.strengths)) {
        for (const enriched of parsed.strengths) {
          const match = insights.strengths.find(
            (s) => s.kpId === enriched.kpId,
          );
          if (match && enriched.reason) {
            match.reason = enriched.reason;
          }
        }
      }

      // Enrich weaknesses
      if (parsed.weaknesses && Array.isArray(parsed.weaknesses)) {
        for (const enriched of parsed.weaknesses) {
          const match = insights.weaknesses.find(
            (w) => w.kpId === enriched.kpId,
          );
          if (match && enriched.reason) {
            match.reason = enriched.reason;
          }
        }
      }
    } catch (error) {
      // Graceful fallback: keep rule-based results without AI reasons
      this.logger.warn(
        'AI enrichment failed, using rule-based insights:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  private buildAiPrompt(insights: InsightsResult): string {
    const strengthsList = insights.strengths
      .slice(0, 5)
      .map((s) => `- ${s.kpTitle} (mastery: ${s.masteryScore}%)`)
      .join('\n');
    const weaknessesList = insights.weaknesses
      .slice(0, 5)
      .map((w) => `- ${w.kpTitle} (mastery: ${w.masteryScore}%)`)
      .join('\n');

    return (
      `Analyze this student's learning data:\n\n` +
      `Strengths:\n${strengthsList || 'None'}\n\n` +
      `Weaknesses:\n${weaknessesList || 'None'}\n\n` +
      `Learning velocity: ${insights.learningPattern.velocityTrend}\n` +
      `Engagement: ${insights.engagementScore}%\n\n` +
      `Return JSON with format:\n` +
      `{"strengths":[{"kpId":"...","reason":"brief reason in Vietnamese"}],` +
      `"weaknesses":[{"kpId":"...","reason":"brief reason in Vietnamese"}]}`
    );
  }

  private async saveInsights(
    studentId: string,
    insights: InsightsResult,
  ): Promise<void> {
    const existing = await db
      .select()
      .from(studentInsights)
      .where(eq(studentInsights.studentId, studentId))
      .limit(1);

    const data = {
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
      riskKps: insights.riskKps,
      learningPattern: insights.learningPattern,
      engagementScore: insights.engagementScore,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db
        .update(studentInsights)
        .set(data)
        .where(eq(studentInsights.id, existing[0].id));
    } else {
      await db.insert(studentInsights).values({
        studentId,
        ...data,
      });
    }
  }

  private async getActiveStudents(): Promise<string[]> {
    const rows = await db
      .select({
        studentId: classEnrollment.studentId,
      })
      .from(classEnrollment)
      .where(eq(classEnrollment.status, 'active'))
      .groupBy(classEnrollment.studentId);

    return rows.map((r) => r.studentId);
  }
}
