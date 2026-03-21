import { Injectable } from '@nestjs/common';
import {
  eq,
  count,
  sql,
  and,
  gte,
  lte,
  desc,
  asc,
  inArray,
  or,
} from 'drizzle-orm';
import {
  db,
  students,
  teachers,
  courses,
  classes,
  classEnrollment,
  classCourses,
  knowledgePoint,
  sectionKpMap,
  questionAttempts,
  studentKpProgress,
  parentStudentMap,
  learningPath,
  teacherClassMap,
  assignments,
  users,
  studentMastery,
  teacherCourseMap,
} from '../../db';

type SearchRole = 'admin' | 'teacher' | 'student' | 'parent';
type SearchCategory =
  | 'all'
  | 'users'
  | 'courses'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'learning-path'
  | 'progress'
  | 'children';

type DashboardSearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href: string;
  metadata?: Record<string, unknown>;
};

type DashboardSearchParams = {
  userId: string;
  role: string;
  query: string;
  category: string;
  limit: number;
};

const SEARCH_CATEGORIES_BY_ROLE: Record<SearchRole, SearchCategory[]> = {
  admin: ['users', 'students', 'teachers', 'courses', 'classes'],
  teacher: ['courses', 'students', 'classes'],
  student: ['courses', 'learning-path', 'progress'],
  parent: ['children', 'progress', 'courses'],
};

@Injectable()
export class DashboardService {
  constructor() {}

  async search(params: DashboardSearchParams) {
    const role = params.role?.toLowerCase() as SearchRole;
    const query = params.query?.trim() || '';
    const limit = Math.max(1, Math.min(params.limit || 12, 30));

    if (!query || !SEARCH_CATEGORIES_BY_ROLE[role]) {
      return { items: [] as DashboardSearchResult[] };
    }

    const categories = this.resolveCategories(role, params.category);
    const perCategoryLimit = Math.max(4, Math.ceil(limit / categories.length));

    const resultsByCategory = await Promise.all(
      categories.map((category) =>
        this.searchByRoleAndCategory(
          role,
          category,
          params.userId,
          query,
          perCategoryLimit,
        ),
      ),
    );

    return {
      items: this.uniqueAndLimit(resultsByCategory.flat(), limit),
    };
  }

  private resolveCategories(
    role: SearchRole,
    requestedCategory: string,
  ): SearchCategory[] {
    const allowedCategories = SEARCH_CATEGORIES_BY_ROLE[role];
    if (requestedCategory === 'all') {
      return allowedCategories;
    }

    const normalized = requestedCategory as SearchCategory;
    return allowedCategories.includes(normalized) ? [normalized] : [];
  }

  private async searchByRoleAndCategory(
    role: SearchRole,
    category: SearchCategory,
    userId: string,
    query: string,
    limit: number,
  ): Promise<DashboardSearchResult[]> {
    switch (role) {
      case 'admin':
        return this.searchForAdmin(category, query, limit);
      case 'teacher':
        return this.searchForTeacher(category, userId, query, limit);
      case 'student':
        return this.searchForStudent(category, userId, query, limit);
      case 'parent':
        return this.searchForParent(category, userId, query, limit);
      default:
        return [];
    }
  }

  private async searchForAdmin(
    category: SearchCategory,
    query: string,
    limit: number,
  ): Promise<DashboardSearchResult[]> {
    switch (category) {
      case 'users':
        return this.searchUsers(query, limit);
      case 'students':
        return this.searchStudents(query, limit);
      case 'teachers':
        return this.searchTeachers(query, limit);
      case 'courses':
        return this.searchCourses(query, limit);
      case 'classes':
        return this.searchClasses(query, limit);
      default:
        return [];
    }
  }

  private async searchForTeacher(
    category: SearchCategory,
    teacherId: string,
    query: string,
    limit: number,
  ): Promise<DashboardSearchResult[]> {
    switch (category) {
      case 'courses':
        return this.searchTeacherCourses(teacherId, query, limit);
      case 'classes':
        return this.searchTeacherClasses(teacherId, query, limit);
      case 'students':
        return this.searchTeacherStudents(teacherId, query, limit);
      default:
        return [];
    }
  }

  private async searchForStudent(
    category: SearchCategory,
    studentId: string,
    query: string,
    limit: number,
  ): Promise<DashboardSearchResult[]> {
    switch (category) {
      case 'courses':
        return this.searchStudentCourses(studentId, query, limit);
      case 'learning-path':
        return this.searchStudentLearningPaths(studentId, query, limit);
      case 'progress':
        return this.searchStudentProgress(studentId, query, limit);
      default:
        return [];
    }
  }

  private async searchForParent(
    category: SearchCategory,
    parentId: string,
    query: string,
    limit: number,
  ): Promise<DashboardSearchResult[]> {
    switch (category) {
      case 'children':
        return this.searchParentChildren(parentId, query, limit);
      case 'progress':
        return this.searchParentProgress(parentId, query, limit);
      case 'courses':
        return this.searchParentCourses(parentId, query, limit);
      default:
        return [];
    }
  }

  private getPattern(query: string) {
    return `%${query.toLowerCase()}%`;
  }

  private uniqueAndLimit(results: DashboardSearchResult[], limit: number) {
    const seen = new Set<string>();
    const unique: DashboardSearchResult[] = [];

    for (const result of results) {
      const key = `${result.type}:${result.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
      if (unique.length >= limit) {
        break;
      }
    }

    return unique;
  }

  private async getTeacherClassIds(teacherId: string) {
    const assigned = await db
      .select({ classId: teacherClassMap.classId })
      .from(teacherClassMap)
      .where(
        and(
          eq(teacherClassMap.teacherId, teacherId),
          eq(teacherClassMap.status, 'active'),
        ),
      );

    const homeroom = await db
      .select({ classId: classes.id })
      .from(classes)
      .where(eq(classes.homeroomTeacherId, teacherId));

    return Array.from(
      new Set([
        ...assigned.map((item) => item.classId),
        ...homeroom.map((item) => item.classId),
      ]),
    );
  }

  private async getParentChildIds(parentId: string) {
    const childMappings = await db
      .select({ studentId: parentStudentMap.studentId })
      .from(parentStudentMap)
      .where(eq(parentStudentMap.parentId, parentId));

    return childMappings.map((item) => item.studentId);
  }

  private async searchUsers(query: string, limit: number) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(
        or(
          sql`LOWER(${users.fullName}) LIKE ${pattern}`,
          sql`LOWER(${users.email}) LIKE ${pattern}`,
        ),
      )
      .orderBy(desc(users.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'user',
      title: row.fullName,
      subtitle: `${row.role} • ${row.email}`,
      href: `/dashboard/users/${row.id}`,
      metadata: { role: row.role },
    }));
  }

  private async searchStudents(query: string, limit: number) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: students.id,
        fullName: users.fullName,
        email: users.email,
        studentCode: students.studentCode,
        gradeLevel: students.gradeLevel,
      })
      .from(students)
      .innerJoin(users, eq(students.id, users.id))
      .where(
        or(
          sql`LOWER(${users.fullName}) LIKE ${pattern}`,
          sql`LOWER(${users.email}) LIKE ${pattern}`,
          sql`LOWER(${students.studentCode}) LIKE ${pattern}`,
        ),
      )
      .orderBy(desc(users.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'student',
      title: row.fullName,
      subtitle: `HS${row.gradeLevel} • ${row.studentCode}`,
      href: `/dashboard/students/${row.id}`,
      metadata: { email: row.email, gradeLevel: row.gradeLevel },
    }));
  }

  private async searchTeachers(query: string, limit: number) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: teachers.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(teachers)
      .innerJoin(users, eq(teachers.id, users.id))
      .where(
        or(
          sql`LOWER(${users.fullName}) LIKE ${pattern}`,
          sql`LOWER(${users.email}) LIKE ${pattern}`,
        ),
      )
      .orderBy(desc(users.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'teacher',
      title: row.fullName,
      subtitle: row.email,
      href: `/dashboard/users/${row.id}`,
      metadata: { email: row.email },
    }));
  }

  private async searchCourses(query: string, limit: number) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: courses.id,
        title: courses.title,
        subject: courses.subject,
        gradeLevel: courses.gradeLevel,
        description: courses.description,
      })
      .from(courses)
      .where(
        or(
          sql`LOWER(${courses.title}) LIKE ${pattern}`,
          sql`LOWER(${courses.description}) LIKE ${pattern}`,
          sql`LOWER(${courses.subject}) LIKE ${pattern}`,
        ),
      )
      .orderBy(desc(courses.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'course',
      title: row.title,
      subtitle: `${row.subject} • Khối ${row.gradeLevel}`,
      href: `/dashboard/courses/${row.id}`,
      metadata: { description: row.description },
    }));
  }

  private async searchClasses(query: string, limit: number) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: classes.id,
        className: classes.className,
        gradeLevel: classes.gradeLevel,
        schoolYear: classes.schoolYear,
        studentCount: count(classEnrollment.id),
      })
      .from(classes)
      .leftJoin(classEnrollment, eq(classes.id, classEnrollment.classId))
      .where(
        or(
          sql`LOWER(${classes.className}) LIKE ${pattern}`,
          sql`LOWER(${classes.schoolYear}) LIKE ${pattern}`,
        ),
      )
      .groupBy(
        classes.id,
        classes.className,
        classes.gradeLevel,
        classes.schoolYear,
      )
      .orderBy(desc(classes.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'class',
      title: row.className,
      subtitle: `Khối ${row.gradeLevel} • ${row.studentCount} học sinh`,
      href: `/dashboard/classes/${row.id}`,
      metadata: { schoolYear: row.schoolYear },
    }));
  }

  private async searchTeacherCourses(
    teacherId: string,
    query: string,
    limit: number,
  ) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: courses.id,
        title: courses.title,
        subject: courses.subject,
        gradeLevel: courses.gradeLevel,
      })
      .from(teacherCourseMap)
      .innerJoin(courses, eq(teacherCourseMap.courseId, courses.id))
      .where(
        and(
          eq(teacherCourseMap.teacherId, teacherId),
          or(
            sql`LOWER(${courses.title}) LIKE ${pattern}`,
            sql`LOWER(${courses.description}) LIKE ${pattern}`,
            sql`LOWER(${courses.subject}) LIKE ${pattern}`,
          ),
        ),
      )
      .orderBy(desc(courses.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'course',
      title: row.title,
      subtitle: `${row.subject} • Khối ${row.gradeLevel}`,
      href: `/dashboard/courses/${row.id}`,
    }));
  }

  private async searchTeacherClasses(
    teacherId: string,
    query: string,
    limit: number,
  ) {
    const classIds = await this.getTeacherClassIds(teacherId);
    if (classIds.length === 0) {
      return [];
    }

    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: classes.id,
        className: classes.className,
        gradeLevel: classes.gradeLevel,
        studentCount: count(classEnrollment.id),
      })
      .from(classes)
      .leftJoin(classEnrollment, eq(classes.id, classEnrollment.classId))
      .where(
        and(
          inArray(classes.id, classIds),
          or(
            sql`LOWER(${classes.className}) LIKE ${pattern}`,
            sql`LOWER(${classes.schoolYear}) LIKE ${pattern}`,
          ),
        ),
      )
      .groupBy(classes.id, classes.className, classes.gradeLevel)
      .orderBy(desc(classes.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'class',
      title: row.className,
      subtitle: `Khối ${row.gradeLevel} • ${row.studentCount} học sinh`,
      href: `/dashboard/classes/${row.id}`,
    }));
  }

  private async searchTeacherStudents(
    teacherId: string,
    query: string,
    limit: number,
  ) {
    const classIds = await this.getTeacherClassIds(teacherId);
    if (classIds.length === 0) {
      return [];
    }

    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: students.id,
        fullName: users.fullName,
        email: users.email,
        studentCode: students.studentCode,
        className: sql<string>`MIN(${classes.className})`,
      })
      .from(classEnrollment)
      .innerJoin(students, eq(classEnrollment.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .innerJoin(classes, eq(classEnrollment.classId, classes.id))
      .where(
        and(
          inArray(classEnrollment.classId, classIds),
          eq(classEnrollment.status, 'active'),
          or(
            sql`LOWER(${users.fullName}) LIKE ${pattern}`,
            sql`LOWER(${users.email}) LIKE ${pattern}`,
            sql`LOWER(${students.studentCode}) LIKE ${pattern}`,
          ),
        ),
      )
      .groupBy(students.id, users.fullName, users.email, students.studentCode)
      .orderBy(desc(sql`MIN(${users.updatedAt})`))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'student',
      title: row.fullName,
      subtitle: `${row.className || 'Chưa gán lớp'} • ${row.studentCode}`,
      href: `/dashboard/students/${row.id}`,
      metadata: { email: row.email },
    }));
  }

  private async searchStudentCourses(
    studentId: string,
    query: string,
    limit: number,
  ) {
    const pattern = this.getPattern(query);

    const fromClassCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        subject: courses.subject,
        gradeLevel: courses.gradeLevel,
      })
      .from(classEnrollment)
      .innerJoin(
        classCourses,
        eq(classEnrollment.classId, classCourses.classId),
      )
      .innerJoin(courses, eq(classCourses.courseId, courses.id))
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
          eq(classCourses.status, 'active'),
          or(
            sql`LOWER(${courses.title}) LIKE ${pattern}`,
            sql`LOWER(${courses.description}) LIKE ${pattern}`,
            sql`LOWER(${courses.subject}) LIKE ${pattern}`,
          ),
        ),
      )
      .groupBy(courses.id, courses.title, courses.subject, courses.gradeLevel)
      .limit(limit);

    const fromMastery = await db
      .select({
        id: courses.id,
        title: courses.title,
        subject: courses.subject,
        gradeLevel: courses.gradeLevel,
      })
      .from(studentMastery)
      .innerJoin(courses, eq(studentMastery.courseId, courses.id))
      .where(
        and(
          eq(studentMastery.studentId, studentId),
          or(
            sql`LOWER(${courses.title}) LIKE ${pattern}`,
            sql`LOWER(${courses.description}) LIKE ${pattern}`,
            sql`LOWER(${courses.subject}) LIKE ${pattern}`,
          ),
        ),
      )
      .groupBy(courses.id, courses.title, courses.subject, courses.gradeLevel)
      .limit(limit);

    return this.uniqueAndLimit(
      [...fromClassCourses, ...fromMastery].map((row) => ({
        id: row.id,
        type: 'course',
        title: row.title,
        subtitle: `${row.subject} • Khối ${row.gradeLevel}`,
        href: `/dashboard/courses/${row.id}`,
      })),
      limit,
    );
  }

  private async searchStudentLearningPaths(
    studentId: string,
    query: string,
    limit: number,
  ) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: learningPath.id,
        title: learningPath.title,
        description: learningPath.description,
        status: learningPath.status,
      })
      .from(learningPath)
      .where(
        and(
          eq(learningPath.studentId, studentId),
          or(
            sql`LOWER(${learningPath.title}) LIKE ${pattern}`,
            sql`LOWER(${learningPath.description}) LIKE ${pattern}`,
          ),
        ),
      )
      .orderBy(desc(learningPath.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'learning-path',
      title: row.title,
      subtitle: `${row.status} • ${row.description}`,
      href: '/dashboard/learning-path',
    }));
  }

  private async searchStudentProgress(
    studentId: string,
    query: string,
    limit: number,
  ) {
    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: studentMastery.id,
        courseId: courses.id,
        courseTitle: courses.title,
        score: studentMastery.overallMasteryScore,
      })
      .from(studentMastery)
      .innerJoin(courses, eq(studentMastery.courseId, courses.id))
      .where(
        and(
          eq(studentMastery.studentId, studentId),
          sql`LOWER(${courses.title}) LIKE ${pattern}`,
        ),
      )
      .orderBy(desc(studentMastery.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'progress',
      title: row.courseTitle,
      subtitle: `Mastery ${row.score}%`,
      href: '/dashboard/progress',
      metadata: { courseId: row.courseId, score: row.score },
    }));
  }

  private async searchParentChildren(
    parentId: string,
    query: string,
    limit: number,
  ) {
    const childIds = await this.getParentChildIds(parentId);
    if (childIds.length === 0) {
      return [];
    }

    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: students.id,
        fullName: users.fullName,
        email: users.email,
        studentCode: students.studentCode,
        gradeLevel: students.gradeLevel,
      })
      .from(students)
      .innerJoin(users, eq(students.id, users.id))
      .where(
        and(
          inArray(students.id, childIds),
          or(
            sql`LOWER(${users.fullName}) LIKE ${pattern}`,
            sql`LOWER(${users.email}) LIKE ${pattern}`,
            sql`LOWER(${students.studentCode}) LIKE ${pattern}`,
          ),
        ),
      )
      .orderBy(desc(users.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'child',
      title: row.fullName,
      subtitle: `HS${row.gradeLevel} • ${row.studentCode}`,
      href: `/dashboard/students/${row.id}/progress`,
      metadata: { email: row.email },
    }));
  }

  private async searchParentProgress(
    parentId: string,
    query: string,
    limit: number,
  ) {
    const childIds = await this.getParentChildIds(parentId);
    if (childIds.length === 0) {
      return [];
    }

    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: studentMastery.id,
        studentId: students.id,
        studentName: users.fullName,
        courseTitle: courses.title,
        score: studentMastery.overallMasteryScore,
      })
      .from(studentMastery)
      .innerJoin(students, eq(studentMastery.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .innerJoin(courses, eq(studentMastery.courseId, courses.id))
      .where(
        and(
          inArray(studentMastery.studentId, childIds),
          or(
            sql`LOWER(${users.fullName}) LIKE ${pattern}`,
            sql`LOWER(${courses.title}) LIKE ${pattern}`,
          ),
        ),
      )
      .orderBy(desc(studentMastery.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'progress',
      title: `${row.studentName} • ${row.courseTitle}`,
      subtitle: `Mastery ${row.score}%`,
      href: '/dashboard/children-progress',
      metadata: { studentId: row.studentId, score: row.score },
    }));
  }

  private async searchParentCourses(
    parentId: string,
    query: string,
    limit: number,
  ) {
    const childIds = await this.getParentChildIds(parentId);
    if (childIds.length === 0) {
      return [];
    }

    const pattern = this.getPattern(query);
    const rows = await db
      .select({
        id: courses.id,
        title: courses.title,
        subject: courses.subject,
        gradeLevel: courses.gradeLevel,
      })
      .from(classEnrollment)
      .innerJoin(
        classCourses,
        eq(classEnrollment.classId, classCourses.classId),
      )
      .innerJoin(courses, eq(classCourses.courseId, courses.id))
      .where(
        and(
          inArray(classEnrollment.studentId, childIds),
          eq(classEnrollment.status, 'active'),
          eq(classCourses.status, 'active'),
          or(
            sql`LOWER(${courses.title}) LIKE ${pattern}`,
            sql`LOWER(${courses.description}) LIKE ${pattern}`,
            sql`LOWER(${courses.subject}) LIKE ${pattern}`,
          ),
        ),
      )
      .groupBy(courses.id, courses.title, courses.subject, courses.gradeLevel)
      .orderBy(desc(courses.updatedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      type: 'course',
      title: row.title,
      subtitle: `${row.subject} • Khối ${row.gradeLevel}`,
      href: `/dashboard/courses/${row.id}`,
    }));
  }

  async getAdminStats(
    startDate?: string,
    endDate?: string,
    gradeLevel?: number,
  ) {
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
      .where(
        studentConditions.length > 0 ? and(...studentConditions) : undefined,
      );

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

    // Get total classes count
    const classConditions: any[] = [];
    if (gradeLevel) {
      classConditions.push(eq(classes.gradeLevel, gradeLevel));
    }

    const [totalClassesResult] = await db
      .select({ count: count() })
      .from(classes)
      .where(classConditions.length > 0 ? and(...classConditions) : undefined);

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

    const dropoutRate =
      totalActiveStudents.count > 0
        ? (
            (1 - recentActivityResult.count / totalActiveStudents.count) *
            100
          ).toFixed(1)
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
      totalClasses: totalClassesResult?.count || 0,
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
        )`,
      )
      .leftJoin(
        studentKpProgress,
        eq(sectionKpMap.kpId, studentKpProgress.kpId),
      )
      .groupBy(courses.id, courses.title, courses.subject)
      .orderBy(desc(sql`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`))
      .limit(limit);

    return topCourses.map((course) => ({
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
      .orderBy(
        desc(
          sql`SUM(CASE WHEN ${questionAttempts.isCorrect} = false THEN 1 ELSE 0 END) / NULLIF(COUNT(${questionAttempts.id}), 0)`,
        ),
      )
      .limit(limit);

    return difficultKPs.map((kp) => {
      const failRate =
        kp.totalAttempts > 0
          ? Math.round(
              (parseFloat(kp.failedAttempts.toString()) / kp.totalAttempts) *
                100,
            )
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

    return classStats.map((cls) => ({
      name: cls.className,
      gradeLevel: cls.gradeLevel,
      value: cls.studentCount,
    }));
  }

  async getLearningHealth(startDate?: string, endDate?: string) {
    // Get daily KP completion counts for the last 7 days by default
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

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
          gte(studentKpProgress.masteryScore, 70), // Consider mastery >= 70 as completion
        ),
      )
      .groupBy(sql`DATE(${studentKpProgress.lastUpdated})`)
      .orderBy(asc(sql`DATE(${studentKpProgress.lastUpdated})`));

    return dailyCompletions.map((day) => ({
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
      .leftJoin(
        teacherClassMap,
        and(
          eq(teachers.id, teacherClassMap.teacherId),
          eq(teacherClassMap.role, 'homeroom'),
          eq(teacherClassMap.status, 'active'),
        ),
      )
      .leftJoin(classes, eq(teacherClassMap.classId, classes.id))
      .leftJoin(
        assignments,
        and(
          eq(teachers.id, assignments.teacherId),
          gte(assignments.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(teachers.id, users.fullName, users.avatarUrl, classes.className)
      .orderBy(desc(count(assignments.id)))
      .limit(limit);

    return teacherStats.map((teacher, index) => {
      // Generate initials from full name
      const initials =
        teacher.fullName
          ?.split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'T';

      return {
        id: teacher.teacherId,
        name: teacher.fullName || 'Unknown Teacher',
        initials,
        avatarUrl: teacher.avatarUrl,
        className: teacher.className || 'No class assigned',
        activityLevel:
          teacher.assignmentCount > 5
            ? 'Hoạt động cao'
            : teacher.assignmentCount > 2
              ? 'Tương tác tốt'
              : 'Hoạt động thấp',
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
          sql`CASE WHEN ${studentKpProgress.lastUpdated} >= ${threeWeeksAgo} THEN 1 END`,
        ),
      })
      .from(classes)
      .leftJoin(classEnrollment, eq(classes.id, classEnrollment.classId))
      .leftJoin(
        studentKpProgress,
        eq(classEnrollment.studentId, studentKpProgress.studentId),
      )
      .groupBy(classes.id, classes.className, classes.gradeLevel)
      .having(sql`COUNT(${classEnrollment.studentId}) > 0`) // Only classes with students
      .orderBy(asc(sql`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`))
      .limit(limit);

    return classProgress.map((cls) => {
      const weeksSinceActivity =
        cls.recentActivity === 0
          ? 3
          : Math.floor(
              (Date.now() - threeWeeksAgo.getTime()) /
                (7 * 24 * 60 * 60 * 1000),
            );

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

  async getTeacherStats(teacherId: string) {
    // 1. Get classes where this teacher is assigned
    const teacherClasses = await db
      .select({
        classId: teacherClassMap.classId,
        className: classes.className,
        gradeLevel: classes.gradeLevel,
        role: teacherClassMap.role,
      })
      .from(teacherClassMap)
      .innerJoin(classes, eq(teacherClassMap.classId, classes.id))
      .where(
        and(
          eq(teacherClassMap.teacherId, teacherId),
          eq(teacherClassMap.status, 'active'),
        ),
      );

    // Also check homeroom classes
    const homeroomClasses = await db
      .select({
        classId: classes.id,
        className: classes.className,
        gradeLevel: classes.gradeLevel,
      })
      .from(classes)
      .where(eq(classes.homeroomTeacherId, teacherId));

    // Merge unique classes
    const allClassIds = new Set<string>();
    const allClasses: {
      classId: string;
      className: string;
      gradeLevel: number | null;
    }[] = [];

    for (const cls of [
      ...teacherClasses,
      ...homeroomClasses.map((c) => ({ ...c, role: 'homeroom' })),
    ]) {
      if (!allClassIds.has(cls.classId)) {
        allClassIds.add(cls.classId);
        allClasses.push({
          classId: cls.classId,
          className: cls.className,
          gradeLevel: cls.gradeLevel,
        });
      }
    }

    const classIdArray = Array.from(allClassIds);

    // 2. Get student count and per-class details
    let totalStudents = 0;
    const classDetails: {
      id: string;
      name: string;
      gradeLevel: number | null;
      students: number;
      progress: number;
    }[] = [];

    for (const cls of allClasses) {
      const [studentCountResult] = await db
        .select({ count: count() })
        .from(classEnrollment)
        .where(
          and(
            eq(classEnrollment.classId, cls.classId),
            eq(classEnrollment.status, 'active'),
          ),
        );

      const studentCount = studentCountResult?.count || 0;
      totalStudents += studentCount;

      // Get average progress for students in this class
      const progressResult = await db
        .select({
          avgMastery: sql<number>`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`,
        })
        .from(classEnrollment)
        .leftJoin(
          studentKpProgress,
          eq(classEnrollment.studentId, studentKpProgress.studentId),
        )
        .where(
          and(
            eq(classEnrollment.classId, cls.classId),
            eq(classEnrollment.status, 'active'),
          ),
        );

      const avgProgress = progressResult[0]?.avgMastery
        ? Math.round(parseFloat(progressResult[0].avgMastery.toString()))
        : 0;

      classDetails.push({
        id: cls.classId,
        name: cls.className,
        gradeLevel: cls.gradeLevel,
        students: studentCount,
        progress: avgProgress,
      });
    }

    // 3. Get courses assigned to this teacher
    const teacherCourses = await db
      .select({ count: count() })
      .from(teacherCourseMap)
      .where(eq(teacherCourseMap.teacherId, teacherId));

    const totalCourses = teacherCourses[0]?.count || 0;

    // 4. Get pending assignments (created by teacher, published, not yet past due or with ungraded submissions)
    const [pendingResult] = await db
      .select({ count: count() })
      .from(assignments)
      .where(
        and(
          eq(assignments.teacherId, teacherId),
          eq(assignments.isPublished, true),
        ),
      );

    const totalAssignments = pendingResult?.count || 0;

    // 5. Calculate overall average progress
    let overallProgress = 0;
    if (classDetails.length > 0) {
      const totalProgress = classDetails.reduce(
        (sum, cls) => sum + cls.progress,
        0,
      );
      overallProgress = Math.round(totalProgress / classDetails.length);
    }

    // 6. Get struggling students (mastery < 50) from teacher's classes
    const strugglingStudents: {
      id: string;
      name: string;
      avatarUrl: string | null;
      className: string;
      avgMastery: number;
      issue: string;
    }[] = [];

    if (classIdArray.length > 0) {
      const lowProgressStudents = await db
        .select({
          studentId: classEnrollment.studentId,
          classId: classEnrollment.classId,
          className: classes.className,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          avgMastery: sql<number>`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`,
        })
        .from(classEnrollment)
        .innerJoin(classes, eq(classEnrollment.classId, classes.id))
        .innerJoin(users, eq(classEnrollment.studentId, users.id))
        .leftJoin(
          studentKpProgress,
          eq(classEnrollment.studentId, studentKpProgress.studentId),
        )
        .where(
          and(
            inArray(classEnrollment.classId, classIdArray),
            eq(classEnrollment.status, 'active'),
          ),
        )
        .groupBy(
          classEnrollment.studentId,
          classEnrollment.classId,
          classes.className,
          users.fullName,
          users.avatarUrl,
        )
        .having(sql`COALESCE(AVG(${studentKpProgress.masteryScore}), 0) < 50`)
        .orderBy(asc(sql`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`))
        .limit(10);

      for (const student of lowProgressStudents) {
        const mastery = Math.round(parseFloat(student.avgMastery.toString()));
        let issue = 'Tiến độ thấp';
        if (mastery === 0) issue = 'Chưa bắt đầu học';
        else if (mastery < 30) issue = 'Cần hỗ trợ gấp';

        strugglingStudents.push({
          id: student.studentId,
          name: student.fullName,
          avatarUrl: student.avatarUrl,
          className: student.className,
          avgMastery: mastery,
          issue,
        });
      }
    }

    return {
      totalClasses: allClasses.length,
      totalStudents,
      totalCourses,
      totalAssignments,
      averageProgress: overallProgress,
      classes: classDetails,
      strugglingStudents,
    };
  }
}
