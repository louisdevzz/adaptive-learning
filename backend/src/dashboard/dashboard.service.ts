import { Injectable } from '@nestjs/common';
import { eq, count, sql, and, gte, lte, desc, asc } from 'drizzle-orm';
import {
  db,
  students,
  teachers,
  courses,
  classes,
  classEnrollment,
  knowledgePoint,
  sectionKpMap,
  questionAttempts,
  studentKpProgress,
  teacherClassMap,
  assignments,
  users,
} from '../../db';

@Injectable()
export class DashboardService {
  constructor() {}

  async getAdminStats(startDate?: string, endDate?: string, gradeLevel?: number) {
    // Build date filter conditions
    const dateConditions: any[] = [];
    if (startDate) {
      dateConditions.push(gte(students.createdAt, new Date(startDate)));
    }
    if (endDate) {
      dateConditions.push(lte(students.createdAt, new Date(endDate)));
    }

    // Get total students count
    const studentConditions: any[] = [...dateConditions];
    if (gradeLevel) {
      studentConditions.push(eq(students.gradeLevel, gradeLevel));
    }

    const [totalStudentsResult] = await db
      .select({ count: count() })
      .from(students)
      .where(studentConditions.length > 0 ? and(...studentConditions) : undefined);

    // Get total teachers count
    const [totalTeachersResult] = await db
      .select({ count: count() })
      .from(teachers)
      .where(dateConditions.length > 0 ? and(...dateConditions) : undefined);

    // Get active courses count
    const courseConditions: any[] = [eq(courses.active, true)];
    if (gradeLevel) {
      courseConditions.push(eq(courses.gradeLevel, gradeLevel));
    }

    const [activeCoursesResult] = await db
      .select({ count: count() })
      .from(courses)
      .where(and(...courseConditions));

    // Calculate average progress across all students
    const progressData = await db
      .select({
        avgMastery: sql<number>`AVG(${studentKpProgress.masteryScore})`,
      })
      .from(studentKpProgress);

    const averageProgress = progressData[0]?.avgMastery
      ? Math.round(parseFloat(progressData[0].avgMastery.toString()))
      : 0;

    // Calculate dropout rate (students with low activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentActivityResult] = await db
      .select({ count: count() })
      .from(questionAttempts)
      .where(gte(questionAttempts.attemptTime, thirtyDaysAgo));

    const [totalActiveStudents] = await db
      .select({ count: count() })
      .from(students);

    const dropoutRate = totalActiveStudents.count > 0
      ? ((1 - (recentActivityResult.count / totalActiveStudents.count)) * 100).toFixed(1)
      : '0.0';

    // Calculate average study time per day (in minutes)
    const avgTimeData = await db
      .select({
        avgTime: sql<number>`AVG(${questionAttempts.timeSpent})`,
      })
      .from(questionAttempts)
      .where(gte(questionAttempts.attemptTime, thirtyDaysAgo));

    const avgStudyTime = avgTimeData[0]?.avgTime
      ? Math.round(parseFloat(avgTimeData[0].avgTime.toString()) / 60) // Convert to minutes
      : 0;

    return {
      totalStudents: totalStudentsResult?.count || 0,
      totalTeachers: totalTeachersResult?.count || 0,
      activeCourses: activeCoursesResult?.count || 0,
      averageProgress,
      dropoutRate: parseFloat(dropoutRate),
      avgStudyTimeMinutes: avgStudyTime,
    };
  }

  async getTopCourses(limit: number = 5) {
    // Get courses with their average mastery scores
    const topCourses = await db
      .select({
        courseId: courses.id,
        courseName: courses.title,
        subject: courses.subject,
        avgProgress: sql<number>`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`,
      })
      .from(courses)
      .leftJoin(
        sectionKpMap,
        sql`${sectionKpMap.kpId} IN (
          SELECT ${knowledgePoint.id} FROM ${knowledgePoint}
        )`
      )
      .leftJoin(
        studentKpProgress,
        eq(sectionKpMap.kpId, studentKpProgress.kpId)
      )
      .groupBy(courses.id, courses.title, courses.subject)
      .orderBy(desc(sql`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`))
      .limit(limit);

    return topCourses.map(course => ({
      name: course.courseName,
      subject: course.subject,
      progress: Math.round(parseFloat(course.avgProgress.toString())),
    }));
  }

  async getDifficultKPs(limit: number = 5) {
    // Get KPs with highest failure rates
    const difficultKPs = await db
      .select({
        kpId: knowledgePoint.id,
        kpTitle: knowledgePoint.title,
        totalAttempts: count(questionAttempts.id),
        failedAttempts: sql<number>`SUM(CASE WHEN ${questionAttempts.isCorrect} = false THEN 1 ELSE 0 END)`,
      })
      .from(knowledgePoint)
      .leftJoin(questionAttempts, eq(knowledgePoint.id, questionAttempts.kpId))
      .groupBy(knowledgePoint.id, knowledgePoint.title)
      .having(sql`COUNT(${questionAttempts.id}) > 10`) // Only include KPs with significant data
      .orderBy(desc(sql`SUM(CASE WHEN ${questionAttempts.isCorrect} = false THEN 1 ELSE 0 END) / NULLIF(COUNT(${questionAttempts.id}), 0)`))
      .limit(limit);

    return difficultKPs.map(kp => {
      const failRate = kp.totalAttempts > 0
        ? Math.round((parseFloat(kp.failedAttempts.toString()) / kp.totalAttempts) * 100)
        : 0;

      return {
        name: kp.kpTitle,
        failRate,
        totalAttempts: kp.totalAttempts,
      };
    });
  }

  async getGameCompletions(limit: number = 5) {
    // For now, return mock data as game system isn't implemented yet
    // TODO: Implement when game/gamification system is added
    return [
      { name: 'Thám hiểm đại dương (Sinh)', completion: 99, rating: 4.9 },
      { name: 'Đường đua F1 (Lý)', completion: 95, rating: 4.8 },
      { name: 'Giải cứu công chúa (Toán)', completion: 92, rating: 4.7 },
      { name: 'Truy tìm kho báu (Sử)', completion: 90, rating: 4.6 },
    ].slice(0, limit);
  }

  async getClassDistribution() {
    const classStats = await db
      .select({
        className: classes.className,
        gradeLevel: classes.gradeLevel,
        studentCount: count(classEnrollment.studentId),
      })
      .from(classes)
      .leftJoin(classEnrollment, eq(classes.id, classEnrollment.classId))
      .groupBy(classes.id, classes.className, classes.gradeLevel)
      .orderBy(asc(classes.gradeLevel), asc(classes.className));

    return classStats.map(cls => ({
      name: cls.className,
      gradeLevel: cls.gradeLevel,
      value: cls.studentCount,
    }));
  }

  async getLearningHealth(startDate?: string, endDate?: string) {
    // Get daily KP completion counts for the last 7 days by default
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyCompletions = await db
      .select({
        date: sql<string>`DATE(${studentKpProgress.lastUpdated})`,
        completions: count(studentKpProgress.id),
      })
      .from(studentKpProgress)
      .where(
        and(
          gte(studentKpProgress.lastUpdated, start),
          lte(studentKpProgress.lastUpdated, end),
          gte(studentKpProgress.masteryScore, 70) // Consider mastery >= 70 as completion
        )
      )
      .groupBy(sql`DATE(${studentKpProgress.lastUpdated})`)
      .orderBy(asc(sql`DATE(${studentKpProgress.lastUpdated})`));

    return dailyCompletions.map(day => ({
      date: day.date,
      completions: day.completions,
    }));
  }

  async getTeacherHighlights(limit: number = 3) {
    // Get teachers with their activity metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const teacherStats = await db
      .select({
        teacherId: teachers.id,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        className: classes.className,
        assignmentCount: count(assignments.id),
      })
      .from(teachers)
      .innerJoin(users, eq(teachers.id, users.id))
      .leftJoin(teacherClassMap, and(
        eq(teachers.id, teacherClassMap.teacherId),
        eq(teacherClassMap.role, 'homeroom'),
        eq(teacherClassMap.status, 'active')
      ))
      .leftJoin(classes, eq(teacherClassMap.classId, classes.id))
      .leftJoin(assignments, and(
        eq(teachers.id, assignments.teacherId),
        gte(assignments.createdAt, thirtyDaysAgo)
      ))
      .groupBy(teachers.id, users.fullName, users.avatarUrl, classes.className)
      .orderBy(desc(count(assignments.id)))
      .limit(limit);

    return teacherStats.map((teacher, index) => {
      // Generate initials from full name
      const initials = teacher.fullName
        ?.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'T';

      return {
        id: teacher.teacherId,
        name: teacher.fullName || 'Unknown Teacher',
        initials,
        avatarUrl: teacher.avatarUrl,
        className: teacher.className || 'No class assigned',
        activityLevel: teacher.assignmentCount > 5 ? 'Hoạt động cao' : teacher.assignmentCount > 2 ? 'Tương tác tốt' : 'Hoạt động thấp',
        assignmentCount: teacher.assignmentCount,
      };
    });
  }

  async getLowProgressClasses(limit: number = 3) {
    // Get classes with low progress in the last 3 weeks
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    // Get classes with their average mastery scores
    const classProgress = await db
      .select({
        classId: classes.id,
        className: classes.className,
        gradeLevel: classes.gradeLevel,
        avgMastery: sql<number>`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`,
        recentActivity: count(
          sql`CASE WHEN ${studentKpProgress.lastUpdated} >= ${threeWeeksAgo} THEN 1 END`
        ),
      })
      .from(classes)
      .leftJoin(classEnrollment, eq(classes.id, classEnrollment.classId))
      .leftJoin(studentKpProgress, eq(classEnrollment.studentId, studentKpProgress.studentId))
      .groupBy(classes.id, classes.className, classes.gradeLevel)
      .having(sql`COUNT(${classEnrollment.studentId}) > 0`) // Only classes with students
      .orderBy(asc(sql`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`))
      .limit(limit);

    return classProgress.map(cls => {
      const weeksSinceActivity = cls.recentActivity === 0 ? 3 : Math.floor((Date.now() - threeWeeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));

      return {
        id: cls.classId,
        className: cls.className,
        gradeLevel: cls.gradeLevel,
        avgMastery: Math.round(parseFloat(cls.avgMastery.toString())),
        issue: `${weeksSinceActivity} tuần chưa hoàn thành KP`,
        recentActivity: cls.recentActivity,
      };
    });
  }
}
