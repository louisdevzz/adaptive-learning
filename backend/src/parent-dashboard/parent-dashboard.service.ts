import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import {
  db,
  parentStudentMap,
  parentWeeklyReports,
  questionAttempts,
  studentInsights,
  studentKpProgress,
  students,
  timeOnTask,
  users,
} from '../../db';
import { ResourceRecommendationsService } from '../resource-recommendations/resource-recommendations.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class ParentDashboardService {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly resourceRecommendationsService: ResourceRecommendationsService,
  ) {}

  async getOverview(parentId: string) {
    const children = await db
      .select({
        studentId: students.id,
        fullName: users.fullName,
        gradeLevel: students.gradeLevel,
        schoolName: students.schoolName,
      })
      .from(parentStudentMap)
      .innerJoin(students, eq(parentStudentMap.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .where(eq(parentStudentMap.parentId, parentId));

    const childCards = await Promise.all(
      children.map(async (child) => {
        const [mastery] = await db
          .select({
            value: sql<number>`COALESCE(ROUND(AVG(${studentKpProgress.masteryScore})), 0)`,
          })
          .from(studentKpProgress)
          .where(eq(studentKpProgress.studentId, child.studentId));

        const [latestInsights] = await db
          .select({ riskKps: studentInsights.riskKps })
          .from(studentInsights)
          .where(eq(studentInsights.studentId, child.studentId))
          .orderBy(desc(studentInsights.updatedAt))
          .limit(1);

        const [latestReport] = await db
          .select({
            id: parentWeeklyReports.id,
            weekStart: parentWeeklyReports.weekStart,
            weekEnd: parentWeeklyReports.weekEnd,
            overallMastery: parentWeeklyReports.overallMastery,
            masteryChange: parentWeeklyReports.masteryChange,
          })
          .from(parentWeeklyReports)
          .where(
            and(
              eq(parentWeeklyReports.parentId, parentId),
              eq(parentWeeklyReports.studentId, child.studentId),
            ),
          )
          .orderBy(desc(parentWeeklyReports.weekStart))
          .limit(1);

        const riskCount = Array.isArray(latestInsights?.riskKps)
          ? latestInsights.riskKps.length
          : 0;

        return {
          studentId: child.studentId,
          fullName: child.fullName,
          gradeLevel: child.gradeLevel,
          schoolName: child.schoolName,
          overallMastery: Number(mastery?.value || 0),
          riskKpsCount: riskCount,
          latestReport,
        };
      }),
    );

    const averageMastery =
      childCards.length > 0
        ? Math.round(
            childCards.reduce((sum, child) => sum + child.overallMastery, 0) /
              childCards.length,
          )
        : 0;

    return {
      parentId,
      totalChildren: childCards.length,
      averageMastery,
      children: childCards,
    };
  }

  async getChildSummary(parentId: string, studentId: string) {
    await this.studentsService.assertParentCanAccessStudent(parentId, studentId);

    const [student] = await db
      .select({
        studentId: students.id,
        fullName: users.fullName,
        gradeLevel: students.gradeLevel,
        schoolName: students.schoolName,
      })
      .from(students)
      .innerJoin(users, eq(students.id, users.id))
      .where(eq(students.id, studentId))
      .limit(1);

    const [mastery] = await db
      .select({
        value: sql<number>`COALESCE(ROUND(AVG(${studentKpProgress.masteryScore})), 0)`,
      })
      .from(studentKpProgress)
      .where(eq(studentKpProgress.studentId, studentId));

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [weeklyAttempts] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, sevenDaysAgo),
        ),
      );

    const [weeklyStudyTime] = await db
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

    const [insights] = await db
      .select({
        strengths: studentInsights.strengths,
        weaknesses: studentInsights.weaknesses,
        riskKps: studentInsights.riskKps,
        learningPattern: studentInsights.learningPattern,
        engagementScore: studentInsights.engagementScore,
        updatedAt: studentInsights.updatedAt,
      })
      .from(studentInsights)
      .where(eq(studentInsights.studentId, studentId))
      .orderBy(desc(studentInsights.updatedAt))
      .limit(1);

    const [latestReport] = await db
      .select()
      .from(parentWeeklyReports)
      .where(
        and(
          eq(parentWeeklyReports.parentId, parentId),
          eq(parentWeeklyReports.studentId, studentId),
        ),
      )
      .orderBy(desc(parentWeeklyReports.weekStart))
      .limit(1);

    return {
      student,
      overallMastery: Number(mastery?.value || 0),
      weeklyActivity: {
        attemptsCount: Number(weeklyAttempts?.count || 0),
        studyTimeMinutes: Math.round(Number(weeklyStudyTime?.totalSeconds || 0) / 60),
      },
      insights: insights || null,
      latestReport: latestReport || null,
    };
  }

  async getChildWeeklyReports(
    parentId: string,
    studentId: string,
    page = 1,
    limit = 10,
  ) {
    await this.studentsService.assertParentCanAccessStudent(parentId, studentId);

    const offset = (page - 1) * limit;

    const items = await db
      .select()
      .from(parentWeeklyReports)
      .where(
        and(
          eq(parentWeeklyReports.parentId, parentId),
          eq(parentWeeklyReports.studentId, studentId),
        ),
      )
      .orderBy(desc(parentWeeklyReports.weekStart))
      .limit(limit)
      .offset(offset);

    const [count] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(parentWeeklyReports)
      .where(
        and(
          eq(parentWeeklyReports.parentId, parentId),
          eq(parentWeeklyReports.studentId, studentId),
        ),
      );

    const total = Number(count?.total || 0);

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

  async getChildRecommendations(parentId: string, studentId: string) {
    await this.studentsService.assertParentCanAccessStudent(parentId, studentId);
    return this.resourceRecommendationsService.getSuggestedForWeakKps(studentId);
  }

  async getChildRiskAlerts(parentId: string, studentId: string) {
    await this.studentsService.assertParentCanAccessStudent(parentId, studentId);

    const [insights] = await db
      .select({ riskKps: studentInsights.riskKps, updatedAt: studentInsights.updatedAt })
      .from(studentInsights)
      .where(eq(studentInsights.studentId, studentId))
      .orderBy(desc(studentInsights.updatedAt))
      .limit(1);

    if (insights?.riskKps && Array.isArray(insights.riskKps)) {
      return {
        studentId,
        source: 'student_insights',
        updatedAt: insights.updatedAt,
        riskKps: insights.riskKps,
      };
    }

    const fallback = await db
      .select({
        kpId: studentKpProgress.kpId,
        masteryScore: studentKpProgress.masteryScore,
      })
      .from(studentKpProgress)
      .where(
        and(
          eq(studentKpProgress.studentId, studentId),
          lt(studentKpProgress.masteryScore, 50),
        ),
      )
      .orderBy(studentKpProgress.masteryScore)
      .limit(10);

    return {
      studentId,
      source: 'mastery_fallback',
      updatedAt: null,
      riskKps: fallback,
    };
  }
}
