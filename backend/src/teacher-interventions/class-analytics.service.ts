import { ForbiddenException, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  classEnrollment,
  classes,
  db,
  studentInsights,
  studentKpProgress,
  students,
  teacherClassMap,
  users,
} from '../../db';

interface StudentClassMetric {
  studentId: string;
  fullName: string;
  avgMastery: number;
  engagementScore: number;
  riskKpsCount: number;
}

@Injectable()
export class ClassAnalyticsService {
  async getClassOverview(teacherId: string, classId: string) {
    await this.assertTeacherCanAccessClass(teacherId, classId);

    const metrics = await this.getClassStudentMetrics(classId);
    const outliers = this.detectOutliers(metrics);

    const meanMastery =
      metrics.length > 0
        ? metrics.reduce((sum, item) => sum + item.avgMastery, 0) /
          metrics.length
        : 0;

    const avgEngagement =
      metrics.length > 0
        ? Math.round(
            metrics.reduce((sum, item) => sum + item.engagementScore, 0) /
              metrics.length,
          )
        : 0;

    return {
      classId,
      studentCount: metrics.length,
      meanMastery: Math.round(meanMastery),
      averageEngagement: avgEngagement,
      outlierCount: outliers.length,
      students: metrics,
      outliers,
    };
  }

  detectOutliers(metrics: StudentClassMetric[]) {
    if (metrics.length === 0) {
      return [] as StudentClassMetric[];
    }

    const mean =
      metrics.reduce((sum, student) => sum + student.avgMastery, 0) /
      metrics.length;

    const variance =
      metrics.reduce(
        (sum, student) => sum + (student.avgMastery - mean) ** 2,
        0,
      ) / metrics.length;

    const stddev = Math.sqrt(variance);
    const masteryThreshold = mean - 1.5 * stddev;

    return metrics.filter(
      (student) =>
        student.avgMastery < masteryThreshold ||
        student.engagementScore < 30 ||
        student.riskKpsCount > 5,
    );
  }

  private async getClassStudentMetrics(classId: string): Promise<StudentClassMetric[]> {
    const enrollments = await db
      .select({
        studentId: classEnrollment.studentId,
        fullName: users.fullName,
      })
      .from(classEnrollment)
      .innerJoin(students, eq(classEnrollment.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .where(
        and(
          eq(classEnrollment.classId, classId),
          eq(classEnrollment.status, 'active'),
        ),
      );

    const studentIds = enrollments.map((item) => item.studentId);
    if (studentIds.length === 0) {
      return [];
    }

    const masteryRows = await db
      .select({
        studentId: studentKpProgress.studentId,
        avgMastery: sql<number>`COALESCE(ROUND(AVG(${studentKpProgress.masteryScore})), 0)`,
      })
      .from(studentKpProgress)
      .where(inArray(studentKpProgress.studentId, studentIds))
      .groupBy(studentKpProgress.studentId);

    const insightsRows = await db
      .select({
        studentId: studentInsights.studentId,
        engagementScore: studentInsights.engagementScore,
        riskKps: studentInsights.riskKps,
      })
      .from(studentInsights)
      .where(inArray(studentInsights.studentId, studentIds));

    const masteryMap = new Map(
      masteryRows.map((item) => [item.studentId, Number(item.avgMastery || 0)]),
    );

    const insightsMap = new Map(
      insightsRows.map((item) => [
        item.studentId,
        {
          engagementScore: item.engagementScore,
          riskKpsCount: Array.isArray(item.riskKps) ? item.riskKps.length : 0,
        },
      ]),
    );

    return enrollments.map((student) => {
      const insight = insightsMap.get(student.studentId);
      return {
        studentId: student.studentId,
        fullName: student.fullName,
        avgMastery: masteryMap.get(student.studentId) || 0,
        engagementScore: insight?.engagementScore || 0,
        riskKpsCount: insight?.riskKpsCount || 0,
      };
    });
  }

  async assertTeacherCanAccessClass(teacherId: string, classId: string) {
    const assigned = await db
      .select({ id: teacherClassMap.id })
      .from(teacherClassMap)
      .where(
        and(
          eq(teacherClassMap.teacherId, teacherId),
          eq(teacherClassMap.classId, classId),
          eq(teacherClassMap.status, 'active'),
        ),
      )
      .limit(1);

    if (assigned.length > 0) {
      return;
    }

    const homeroom = await db
      .select({ id: classes.id })
      .from(classes)
      .where(
        and(
          eq(classes.id, classId),
          eq(classes.homeroomTeacherId, teacherId),
        ),
      )
      .limit(1);

    if (homeroom.length === 0) {
      throw new ForbiddenException('Teacher does not have access to this class');
    }
  }
}
