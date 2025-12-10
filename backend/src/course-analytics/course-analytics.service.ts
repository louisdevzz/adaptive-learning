import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, sql, desc, gte, inArray } from 'drizzle-orm';
import {
  db,
  courses,
  modules,
  sections,
  sectionKpMap,
  knowledgePoint,
  studentKpProgress,
  studentKpHistory,
  questionAttempts,
  students,
  timeOnTask,
  studentSession,
} from '../../db';

@Injectable()
export class CourseAnalyticsService {
  // ==================== COURSE ANALYTICS ====================

  async getCourseAnalytics(courseId: string) {
    // Validate course exists
    const courseResult = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseResult.length === 0) {
      throw new NotFoundException('Course not found');
    }

    // Get all KPs in this course
    const courseKps = await db
      .select({
        kpId: sectionKpMap.kpId,
        kp: knowledgePoint,
        sectionId: sectionKpMap.sectionId,
        section: sections,
        moduleId: sections.moduleId,
        module: modules,
      })
      .from(modules)
      .innerJoin(sections, eq(sections.moduleId, modules.id))
      .innerJoin(sectionKpMap, eq(sectionKpMap.sectionId, sections.id))
      .innerJoin(knowledgePoint, eq(sectionKpMap.kpId, knowledgePoint.id))
      .where(eq(modules.courseId, courseId))
      .orderBy(sections.orderIndex, sectionKpMap.orderIndex);

    if (courseKps.length === 0) {
      return {
        courseId,
        completionRate: 0,
        highFailureKps: [],
        mostDifficultModules: [],
        averageSectionTime: 0,
        weeklyPerformance: [],
      };
    }

    const kpIds = courseKps.map((kp) => kp.kpId);

    // 1. Calculate completion rate (students who completed >= 80% of KPs)
    const completionRate = await this.calculateCompletionRate(courseId, kpIds);

    // 2. Find KPs with high error rate
    const highFailureKps = await this.findHighFailureKps(kpIds);

    // 3. Find most difficult modules
    const mostDifficultModules = await this.findMostDifficultModules(courseId, courseKps);

    // 4. Calculate average time per section
    const averageSectionTime = await this.calculateAverageSectionTime(courseId);

    // 5. Weekly class performance
    const weeklyPerformance = await this.getWeeklyPerformance(courseId);

    return {
      courseId,
      completionRate,
      highFailureKps,
      mostDifficultModules,
      averageSectionTime,
      weeklyPerformance,
    };
  }

  async getModuleAnalytics(courseId: string, moduleId: string) {
    // Validate module exists
    const moduleResult = await db
      .select()
      .from(modules)
      .where(and(eq(modules.id, moduleId), eq(modules.courseId, courseId)))
      .limit(1);

    if (moduleResult.length === 0) {
      throw new NotFoundException('Module not found');
    }

    // Get all KPs in this module
    const moduleKps = await db
      .select({
        kpId: sectionKpMap.kpId,
        kp: knowledgePoint,
        sectionId: sectionKpMap.sectionId,
      })
      .from(sections)
      .innerJoin(sectionKpMap, eq(sectionKpMap.sectionId, sections.id))
      .innerJoin(knowledgePoint, eq(sectionKpMap.kpId, knowledgePoint.id))
      .where(eq(sections.moduleId, moduleId));

    const kpIds = moduleKps.map((kp) => kp.kpId);

    if (kpIds.length === 0) {
      return {
        moduleId,
        completionRate: 0,
        highFailureKps: [],
        averageMastery: 0,
      };
    }

    // Calculate module-specific metrics
    const completionRate = await this.calculateCompletionRate(courseId, kpIds);
    const highFailureKps = await this.findHighFailureKps(kpIds);

    // Calculate average mastery for this module
    const masteryData = await db
      .select({
        masteryScore: studentKpProgress.masteryScore,
      })
      .from(studentKpProgress)
      .where(inArray(studentKpProgress.kpId, kpIds));

    const averageMastery =
      masteryData.length > 0
        ? Math.round(
            masteryData.reduce((sum, d) => sum + d.masteryScore, 0) / masteryData.length
          )
        : 0;

    return {
      moduleId,
      completionRate,
      highFailureKps,
      averageMastery,
    };
  }

  // ==================== HELPER METHODS ====================

  private async calculateCompletionRate(courseId: string, kpIds: string[]): Promise<number> {
    if (kpIds.length === 0) return 0;

    // Get all students enrolled in this course (through classes or direct enrollment)
    // For now, we'll use all students who have progress in any KP of this course
    const studentsWithProgress = await db
      .selectDistinct({
        studentId: studentKpProgress.studentId,
      })
      .from(studentKpProgress)
      .where(inArray(studentKpProgress.kpId, kpIds));

    if (studentsWithProgress.length === 0) return 0;

    // For each student, check if they completed >= 80% of KPs
    let completedCount = 0;

    for (const student of studentsWithProgress) {
      const studentProgress = await db
        .select({
          kpId: studentKpProgress.kpId,
          masteryScore: studentKpProgress.masteryScore,
        })
        .from(studentKpProgress)
        .where(
          and(
            eq(studentKpProgress.studentId, student.studentId),
            inArray(studentKpProgress.kpId, kpIds)
          )
        );

      const masteredKps = studentProgress.filter((p) => p.masteryScore >= 80).length;
      const completionPercentage = (masteredKps / kpIds.length) * 100;

      if (completionPercentage >= 80) {
        completedCount++;
      }
    }

    return Math.round((completedCount / studentsWithProgress.length) * 100);
  }

  private async findHighFailureKps(kpIds: string[]): Promise<
    Array<{
      kpId: string;
      kpTitle: string;
      errorRate: number;
      totalAttempts: number;
    }>
  > {
    if (kpIds.length === 0) return [];

    // Get all attempts for these KPs
    const attempts = await db
      .select({
        kpId: questionAttempts.kpId,
        isCorrect: questionAttempts.isCorrect,
      })
      .from(questionAttempts)
      .where(inArray(questionAttempts.kpId, kpIds));

    // Group by KP and calculate error rate
    const kpStats: Record<
      string,
      { correct: number; incorrect: number; kpTitle: string }
    > = {};

    for (const attempt of attempts) {
      if (!attempt.kpId) continue;

      if (!kpStats[attempt.kpId]) {
        // Get KP title
        const kp = await db
          .select()
          .from(knowledgePoint)
          .where(eq(knowledgePoint.id, attempt.kpId))
          .limit(1);

        kpStats[attempt.kpId] = {
          correct: 0,
          incorrect: 0,
          kpTitle: kp.length > 0 ? kp[0].title : 'Unknown',
        };
      }

      if (attempt.isCorrect) {
        kpStats[attempt.kpId].correct++;
      } else {
        kpStats[attempt.kpId].incorrect++;
      }
    }

    // Calculate error rates and filter high failure KPs (error rate > 50%)
    const highFailureKps = Object.entries(kpStats)
      .map(([kpId, stats]) => {
        const totalAttempts = stats.correct + stats.incorrect;
        const errorRate = totalAttempts > 0 ? (stats.incorrect / totalAttempts) * 100 : 0;

        return {
          kpId,
          kpTitle: stats.kpTitle,
          errorRate: Math.round(errorRate),
          totalAttempts,
        };
      })
      .filter((kp) => kp.errorRate > 50 && kp.totalAttempts >= 5) // At least 5 attempts
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10); // Top 10

    return highFailureKps;
  }

  private async findMostDifficultModules(
    courseId: string,
    courseKps: Array<{
      kpId: string;
      moduleId: string;
      module: { id: string; title: string };
    }>
  ): Promise<
    Array<{
      moduleId: string;
      moduleTitle: string;
      averageMastery: number;
      difficultyScore: number;
    }>
  > {
    // Group KPs by module
    const moduleKpMap: Record<string, string[]> = {};
    const moduleTitles: Record<string, string> = {};

    for (const kp of courseKps) {
      if (!moduleKpMap[kp.moduleId]) {
        moduleKpMap[kp.moduleId] = [];
        moduleTitles[kp.moduleId] = kp.module.title;
      }
      moduleKpMap[kp.moduleId].push(kp.kpId);
    }

    // Calculate average mastery for each module
    const moduleStats = await Promise.all(
      Object.entries(moduleKpMap).map(async ([moduleId, kpIds]) => {
        const masteryData = await db
          .select({
            masteryScore: studentKpProgress.masteryScore,
          })
          .from(studentKpProgress)
          .where(inArray(studentKpProgress.kpId, kpIds));

        const averageMastery =
          masteryData.length > 0
            ? Math.round(
                masteryData.reduce((sum, d) => sum + d.masteryScore, 0) / masteryData.length
              )
            : 0;

        // Difficulty score: lower mastery = higher difficulty
        const difficultyScore = 100 - averageMastery;

        return {
          moduleId,
          moduleTitle: moduleTitles[moduleId],
          averageMastery,
          difficultyScore,
        };
      })
    );

    // Sort by difficulty (highest difficulty score first)
    return moduleStats.sort((a, b) => b.difficultyScore - a.difficultyScore).slice(0, 5);
  }

  private async calculateAverageSectionTime(courseId: string): Promise<number> {
    // Get all sections in this course
    const courseSections = await db
      .select({
        sectionId: sections.id,
      })
      .from(modules)
      .innerJoin(sections, eq(sections.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));

    const sectionIds = courseSections.map((s) => s.sectionId);

    if (sectionIds.length === 0) return 0;

    // Get time on task data for these sections
    const timeData = await db
      .select({
        timeSpentSeconds: timeOnTask.timeSpentSeconds,
      })
      .from(timeOnTask)
      .where(inArray(timeOnTask.sectionId, sectionIds));

    if (timeData.length === 0) return 0;

    const totalSeconds = timeData.reduce((sum, d) => sum + d.timeSpentSeconds, 0);
    const averageSeconds = Math.round(totalSeconds / timeData.length);

    // Convert to minutes
    return Math.round(averageSeconds / 60);
  }

  private async getWeeklyPerformance(courseId: string): Promise<
    Array<{
      week: string; // Format: "YYYY-WW"
      averageMastery: number;
      totalStudents: number;
      completedStudents: number;
    }>
  > {
    // Get all KPs in this course
    const courseKps = await db
      .select({
        kpId: sectionKpMap.kpId,
      })
      .from(modules)
      .innerJoin(sections, eq(sections.moduleId, modules.id))
      .innerJoin(sectionKpMap, eq(sectionKpMap.sectionId, sections.id))
      .where(eq(modules.courseId, courseId));

    const kpIds = courseKps.map((kp) => kp.kpId);

    if (kpIds.length === 0) return [];

    // Get progress history for last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); // 8 weeks = 56 days

    const historyData = await db
      .select({
        timestamp: studentKpHistory.timestamp,
        newScore: studentKpHistory.newScore,
        studentId: studentKpHistory.studentId,
        kpId: studentKpHistory.kpId,
      })
      .from(studentKpHistory)
      .where(
        and(
          inArray(studentKpHistory.kpId, kpIds),
          gte(studentKpHistory.timestamp, eightWeeksAgo)
        )
      )
      .orderBy(desc(studentKpHistory.timestamp));

    // Group by week
    const weeklyData: Record<
      string,
      { scores: number[]; students: Set<string>; completedStudents: Set<string> }
    > = {};

    for (const record of historyData) {
      const week = this.getWeekString(record.timestamp);

      if (!weeklyData[week]) {
        weeklyData[week] = {
          scores: [],
          students: new Set(),
          completedStudents: new Set(),
        };
      }

      weeklyData[week].scores.push(record.newScore);
      weeklyData[week].students.add(record.studentId);

      // Check if student completed (mastery >= 80)
      if (record.newScore >= 80) {
        weeklyData[week].completedStudents.add(record.studentId);
      }
    }

    // Calculate weekly averages
    const weeklyPerformance = Object.entries(weeklyData)
      .map(([week, data]) => {
        const averageMastery =
          data.scores.length > 0
            ? Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length)
            : 0;

        return {
          week,
          averageMastery,
          totalStudents: data.students.size,
          completedStudents: data.completedStudents.size,
        };
      })
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks

    return weeklyPerformance;
  }

  private getWeekString(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Get Thursday (week starts on Monday)
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }
}

