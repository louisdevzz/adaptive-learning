import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, inArray, sql, count, gte } from 'drizzle-orm';
import {
  db,
  users,
  students,
  classEnrollment,
  classCourses,
  courses,
  classes,
  modules,
  sections,
  sectionKpMap,
  studentKpProgress,
  studentMastery,
  knowledgePoint,
  teacherClassMap,
  questionAttempts,
  timeOnTask,
  parentStudentMap,
} from '../../db';
import { UsersService } from '../users/users.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly usersService: UsersService) {}

  async create(createStudentDto: CreateStudentDto) {
    // Check if student code already exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.studentCode, createStudentDto.studentCode))
      .limit(1);

    if (existingStudent.length > 0) {
      throw new ConflictException('Student code already exists');
    }

    // Create user first
    const user = await this.usersService.create({
      email: createStudentDto.email,
      password: createStudentDto.password,
      fullName: createStudentDto.fullName,
      role: 'student',
      avatarUrl: createStudentDto.avatarUrl,
    });

    // Create student record
    const [student] = await db
      .insert(students)
      .values({
        id: user.id,
        studentCode: createStudentDto.studentCode,
        gradeLevel: createStudentDto.gradeLevel,
        schoolName: createStudentDto.schoolName,
        dateOfBirth: createStudentDto.dateOfBirth,
        gender: createStudentDto.gender,
      })
      .returning();

    return {
      ...user,
      studentInfo: student,
    };
  }

  async findAll() {
    const result = await db
      .select({
        student: students,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(students)
      .leftJoin(users, eq(students.id, users.id));

    return result.map((row) => ({
      ...row.user,
      studentInfo: row.student,
    }));
  }

  async findByTeacher(teacherId: string) {
    // Get class IDs where this teacher is assigned (via teacherClassMap or homeroom)
    const teacherClasses = await db
      .select({ classId: teacherClassMap.classId })
      .from(teacherClassMap)
      .where(
        and(
          eq(teacherClassMap.teacherId, teacherId),
          eq(teacherClassMap.status, 'active'),
        ),
      );

    const homeroomClasses = await db
      .select({ classId: classes.id })
      .from(classes)
      .where(eq(classes.homeroomTeacherId, teacherId));

    const classIds = [
      ...new Set([
        ...teacherClasses.map((c) => c.classId),
        ...homeroomClasses.map((c) => c.classId),
      ]),
    ];

    if (classIds.length === 0) {
      return [];
    }

    // Get student IDs enrolled in these classes
    const enrollments = await db
      .select({ studentId: classEnrollment.studentId })
      .from(classEnrollment)
      .where(
        and(
          inArray(classEnrollment.classId, classIds),
          eq(classEnrollment.status, 'active'),
        ),
      );

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    if (studentIds.length === 0) {
      return [];
    }

    const result = await db
      .select({
        student: students,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(students)
      .leftJoin(users, eq(students.id, users.id))
      .where(inArray(students.id, studentIds));

    return result.map((row) => ({
      ...row.user,
      studentInfo: row.student,
    }));
  }

  async assertParentCanAccessStudent(parentId: string, studentId: string) {
    const relationship = await db
      .select()
      .from(parentStudentMap)
      .where(
        and(
          eq(parentStudentMap.parentId, parentId),
          eq(parentStudentMap.studentId, studentId),
        ),
      )
      .limit(1);

    if (relationship.length === 0) {
      throw new ForbiddenException(
        'Parent does not have access to this student',
      );
    }
  }

  async findByParent(parentId: string) {
    // Get all students linked to this parent
    const result = await db
      .select({
        student: students,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(parentStudentMap)
      .innerJoin(students, eq(parentStudentMap.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .where(eq(parentStudentMap.parentId, parentId));

    return result.map((row) => ({
      ...row.user,
      studentInfo: row.student,
    }));
  }

  async findOne(id: string) {
    const result = await db
      .select({
        student: students,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(students)
      .leftJoin(users, eq(students.id, users.id))
      .where(eq(students.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Student not found');
    }

    return {
      ...result[0].user,
      studentInfo: result[0].student,
    };
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    // Check if student exists
    await this.findOne(id);

    // Update user info if provided
    if (
      updateStudentDto.email ||
      updateStudentDto.password ||
      updateStudentDto.fullName ||
      updateStudentDto.avatarUrl !== undefined
    ) {
      await this.usersService.updateUser(id, {
        email: updateStudentDto.email,
        password: updateStudentDto.password,
        fullName: updateStudentDto.fullName,
        avatarUrl: updateStudentDto.avatarUrl,
      });
    }

    // Update student info
    const studentUpdateData: any = {};
    if (updateStudentDto.studentCode)
      studentUpdateData.studentCode = updateStudentDto.studentCode;
    if (updateStudentDto.gradeLevel)
      studentUpdateData.gradeLevel = updateStudentDto.gradeLevel;
    if (updateStudentDto.schoolName)
      studentUpdateData.schoolName = updateStudentDto.schoolName;
    if (updateStudentDto.dateOfBirth)
      studentUpdateData.dateOfBirth = updateStudentDto.dateOfBirth;
    if (updateStudentDto.gender)
      studentUpdateData.gender = updateStudentDto.gender;

    if (Object.keys(studentUpdateData).length > 0) {
      studentUpdateData.updatedAt = new Date();
      await db
        .update(students)
        .set(studentUpdateData)
        .where(eq(students.id, id));
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if student exists
    await this.findOne(id);

    // Delete student (cascade will delete from users table)
    await db.delete(students).where(eq(students.id, id));

    return { message: 'Student deleted successfully' };
  }

  async getMyCourses(studentId: string) {
    // Verify student exists
    await this.findOne(studentId);

    // Get all classes where student is enrolled with active status
    const enrollments = await db
      .select({
        classId: classEnrollment.classId,
      })
      .from(classEnrollment)
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
        ),
      );

    if (enrollments.length === 0) {
      return [];
    }

    const classIds = enrollments.map((e) => e.classId);

    // Get all courses assigned to these classes with active status
    const courseAssignments = await db
      .select({
        course: courses,
        assignment: classCourses,
      })
      .from(classCourses)
      .innerJoin(courses, eq(classCourses.courseId, courses.id))
      .where(
        and(
          inArray(classCourses.classId, classIds),
          eq(classCourses.status, 'active'),
          eq(courses.active, true),
        ),
      );

    // Remove duplicates by course ID and return unique courses
    const uniqueCoursesMap = new Map();
    courseAssignments.forEach((item) => {
      if (!uniqueCoursesMap.has(item.course.id)) {
        uniqueCoursesMap.set(item.course.id, item.course);
      }
    });

    return Array.from(uniqueCoursesMap.values());
  }

  async getMyCoursesWithProgress(studentId: string) {
    // Verify student exists
    await this.findOne(studentId);

    // Get all active class enrollments for this student
    const enrollments = await db
      .select({
        classId: classEnrollment.classId,
      })
      .from(classEnrollment)
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
        ),
      );

    const classIds = enrollments.map((e) => e.classId);

    const courseAssignments =
      classIds.length > 0
        ? await db
            .select({
              course: courses,
              classInfo: classes,
            })
            .from(classCourses)
            .innerJoin(courses, eq(classCourses.courseId, courses.id))
            .innerJoin(classes, eq(classCourses.classId, classes.id))
            .where(
              and(
                inArray(classCourses.classId, classIds),
                eq(classCourses.status, 'active'),
                eq(courses.active, true),
              ),
            )
        : [];

    // Also include courses inferred from existing progress/mastery/attempts data.
    const masteryCourses = await db
      .select({ courseId: studentMastery.courseId })
      .from(studentMastery)
      .where(eq(studentMastery.studentId, studentId));

    const progressCourses = await db
      .select({ courseId: modules.courseId })
      .from(studentKpProgress)
      .innerJoin(sectionKpMap, eq(sectionKpMap.kpId, studentKpProgress.kpId))
      .innerJoin(sections, eq(sections.id, sectionKpMap.sectionId))
      .innerJoin(modules, eq(modules.id, sections.moduleId))
      .where(eq(studentKpProgress.studentId, studentId))
      .groupBy(modules.courseId);

    const attemptedCourses = await db
      .select({ courseId: modules.courseId })
      .from(questionAttempts)
      .innerJoin(sectionKpMap, eq(sectionKpMap.kpId, questionAttempts.kpId))
      .innerJoin(sections, eq(sections.id, sectionKpMap.sectionId))
      .innerJoin(modules, eq(modules.id, sections.moduleId))
      .where(eq(questionAttempts.studentId, studentId))
      .groupBy(modules.courseId);

    const candidateCourseIds = [
      ...new Set([
        ...courseAssignments.map((item) => item.course.id),
        ...masteryCourses.map((item) => item.courseId),
        ...progressCourses.map((item) => item.courseId),
        ...attemptedCourses.map((item) => item.courseId),
      ]),
    ];

    if (candidateCourseIds.length === 0) {
      return [];
    }

    const activeCourses = await db
      .select({ course: courses })
      .from(courses)
      .where(
        and(inArray(courses.id, candidateCourseIds), eq(courses.active, true)),
      );

    const classInfoByCourseId = new Map<string, typeof classes.$inferSelect>();
    courseAssignments.forEach((item) => {
      if (!classInfoByCourseId.has(item.course.id)) {
        classInfoByCourseId.set(item.course.id, item.classInfo);
      }
    });

    const coursesList = activeCourses.map(({ course }) => ({
      ...course,
      classInfo: classInfoByCourseId.get(course.id) || null,
    }));

    // For each course, calculate progress
    const coursesWithProgress = await Promise.all(
      coursesList.map(async (course) => {
        // Get all KPs in this course
        // Course → Modules → Sections → SectionKpMap → KPs
        const courseKps = await db
          .select({
            kpId: sectionKpMap.kpId,
          })
          .from(modules)
          .innerJoin(sections, eq(sections.moduleId, modules.id))
          .innerJoin(sectionKpMap, eq(sectionKpMap.sectionId, sections.id))
          .where(eq(modules.courseId, course.id));

        const kpIds = courseKps.map((kp) => kp.kpId);
        const totalKps = kpIds.length;

        if (totalKps === 0) {
          return {
            ...course,
            progress: 0,
            masteryScore: 0,
            status: 'not_started' as const,
            masteredKps: 0,
            totalKps: 0,
            timeSpent: 0,
            lastAccessed: null,
          };
        }

        // Get student's progress for these KPs
        let studentProgress: Array<{
          kpId: string;
          masteryScore: number;
          lastUpdated: Date;
        }> = [];
        if (kpIds.length > 0) {
          studentProgress = await db
            .select({
              kpId: studentKpProgress.kpId,
              masteryScore: studentKpProgress.masteryScore,
              lastUpdated: studentKpProgress.lastUpdated,
            })
            .from(studentKpProgress)
            .where(
              and(
                eq(studentKpProgress.studentId, studentId),
                inArray(studentKpProgress.kpId, kpIds),
              ),
            );
        }

        const [attemptSummary] = await db
          .select({
            totalAttempts: sql<number>`COUNT(*)`,
            correctAttempts: sql<number>`COALESCE(SUM(CASE WHEN ${questionAttempts.isCorrect} THEN 1 ELSE 0 END), 0)`,
            lastAttemptAt: sql<Date | null>`MAX(${questionAttempts.attemptTime})`,
          })
          .from(questionAttempts)
          .where(
            and(
              eq(questionAttempts.studentId, studentId),
              inArray(questionAttempts.kpId, kpIds),
            ),
          );

        const [studySummary] = await db
          .select({
            totalSeconds: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0)`,
            lastTrackedAt: sql<Date | null>`MAX(${timeOnTask.computedAt})`,
          })
          .from(timeOnTask)
          .where(
            and(
              eq(timeOnTask.studentId, studentId),
              inArray(timeOnTask.kpId, kpIds),
            ),
          );

        const lastProgressAt =
          studentProgress.length > 0
            ? studentProgress.reduce(
                (latest, current) =>
                  new Date(current.lastUpdated).getTime() >
                  new Date(latest).getTime()
                    ? current.lastUpdated
                    : latest,
                studentProgress[0].lastUpdated,
              )
            : null;

        const candidateLastAccessed = [
          lastProgressAt ? new Date(lastProgressAt) : null,
          attemptSummary?.lastAttemptAt
            ? new Date(attemptSummary.lastAttemptAt)
            : null,
          studySummary?.lastTrackedAt
            ? new Date(studySummary.lastTrackedAt)
            : null,
        ].filter(Boolean) as Date[];

        const lastAccessed =
          candidateLastAccessed.length > 0
            ? candidateLastAccessed.reduce((latest, current) =>
                current.getTime() > latest.getTime() ? current : latest,
              )
            : null;

        // Count mastered KPs (mastery_score >= 60)
        const MASTERY_THRESHOLD = 60;
        const masteredKps = studentProgress.filter(
          (p) => p.masteryScore >= MASTERY_THRESHOLD,
        ).length;

        // Calculate progress percentage
        const progress = Math.round((masteredKps / totalKps) * 100);
        const masteryFromProgress =
          studentProgress.length > 0
            ? Math.round(
                studentProgress.reduce((sum, p) => sum + p.masteryScore, 0) /
                  studentProgress.length,
              )
            : null;

        const totalAttempts = Number(attemptSummary?.totalAttempts || 0);
        const correctAttempts = Number(attemptSummary?.correctAttempts || 0);
        const masteryScore =
          masteryFromProgress ??
          (totalAttempts > 0
            ? Math.round((correctAttempts / totalAttempts) * 100)
            : 0);

        const totalStudySeconds = Number(studySummary?.totalSeconds || 0);
        const timeSpentMinutes = Math.round(totalStudySeconds / 60);

        const hasAnyProgress =
          studentProgress.length > 0 ||
          totalAttempts > 0 ||
          totalStudySeconds > 0;

        // Determine status
        let status: 'not_started' | 'in_progress' | 'completed';
        if (progress === 100) {
          status = 'completed';
        } else if (progress > 0 || hasAnyProgress) {
          status = 'in_progress';
        } else {
          status = 'not_started';
        }

        return {
          ...course,
          progress,
          masteryScore,
          status,
          masteredKps,
          totalKps,
          timeSpent: timeSpentMinutes,
          lastAccessed,
        };
      }),
    );

    return coursesWithProgress;
  }

  async getMyDashboardStats(studentId: string) {
    const coursesWithProgress = await this.getMyCoursesWithProgress(studentId);
    const totalCourses = coursesWithProgress.length;
    const coursesCompleted = coursesWithProgress.filter(
      (course) => course.status === 'completed',
    ).length;
    const coursesInProgress = coursesWithProgress.filter(
      (course) => course.status === 'in_progress',
    ).length;

    // 2. Get overall mastery score (average of all KP progress)
    const [progressData] = await db
      .select({
        avgMastery: sql<number>`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)`,
        progressCount: sql<number>`COUNT(*)`,
      })
      .from(studentKpProgress)
      .where(eq(studentKpProgress.studentId, studentId));

    const progressCount = Number(progressData?.progressCount || 0);
    let masteryScore = 0;
    if (progressCount > 0) {
      masteryScore = Math.round(
        parseFloat(progressData?.avgMastery?.toString() || '0'),
      );
    } else {
      const [attemptSummary] = await db
        .select({
          totalAttempts: sql<number>`COUNT(*)`,
          correctAttempts: sql<number>`COALESCE(SUM(CASE WHEN ${questionAttempts.isCorrect} THEN 1 ELSE 0 END), 0)`,
        })
        .from(questionAttempts)
        .where(eq(questionAttempts.studentId, studentId));

      const totalAttempts = Number(attemptSummary?.totalAttempts || 0);
      const correctAttempts = Number(attemptSummary?.correctAttempts || 0);
      masteryScore =
        totalAttempts > 0
          ? Math.round((correctAttempts / totalAttempts) * 100)
          : 0;
    }

    // 3. Get total KPs mastered/attempted from per-course progress
    const kpMastered = coursesWithProgress.reduce(
      (sum, course) => sum + (course.masteredKps || 0),
      0,
    );
    const totalKpsCount = coursesWithProgress.reduce(
      (sum, course) => sum + (course.totalKps || 0),
      0,
    );

    // 4. Get current streak (consecutive days with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttemptDays = await db
      .select({
        date: sql<string>`DATE(${questionAttempts.attemptTime})`,
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`DATE(${questionAttempts.attemptTime})`)
      .orderBy(sql`DATE(${questionAttempts.attemptTime}) DESC`);

    const recentStudyDays = await db
      .select({
        date: sql<string>`DATE(${timeOnTask.computedAt})`,
      })
      .from(timeOnTask)
      .where(
        and(
          eq(timeOnTask.studentId, studentId),
          gte(timeOnTask.computedAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`DATE(${timeOnTask.computedAt})`);

    const uniqueActivityDays = [
      ...new Set([
        ...recentAttemptDays.map((d) => d.date),
        ...recentStudyDays.map((d) => d.date),
      ]),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const toLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Calculate streak
    let streak = 0;
    if (uniqueActivityDays.length > 0) {
      const today = toLocalDateString(new Date());
      const yesterday = toLocalDateString(new Date(Date.now() - 86400000));

      // Check if active today or yesterday
      const lastActiveDate = uniqueActivityDays[0];
      if (lastActiveDate === today || lastActiveDate === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueActivityDays.length; i++) {
          const currentDate = new Date(uniqueActivityDays[i - 1]);
          const prevDate = new Date(uniqueActivityDays[i]);
          const diffDays =
            (currentDate.getTime() - prevDate.getTime()) /
            (1000 * 60 * 60 * 24);

          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // 5. Get pending assignments count
    // Note: Currently simplified since there's no assignmentSubmissions table
    // TODO: Implement proper assignment tracking when submissions table is added
    const pendingAssignmentsCount = 0;

    // 6. Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentActivity] = await db
      .select({ count: count() })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, sevenDaysAgo),
        ),
      );

    // 7. Get study time from timeOnTask table
    const [studyTimeData] = await db
      .select({
        totalTime: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0)`,
      })
      .from(timeOnTask)
      .where(eq(timeOnTask.studentId, studentId));

    const [studyTimeLast30Days] = await db
      .select({
        totalTime: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0)`,
      })
      .from(timeOnTask)
      .where(
        and(
          eq(timeOnTask.studentId, studentId),
          gte(timeOnTask.computedAt, thirtyDaysAgo),
        ),
      );

    const totalStudyTimeMinutes = Math.round(
      Number(studyTimeData?.totalTime || 0) / 60,
    );
    const totalStudyTimeMinutesLast30Days = Math.round(
      Number(studyTimeLast30Days?.totalTime || 0) / 60,
    );
    const averageTimePerDay =
      uniqueActivityDays.length > 0
        ? Math.round(
            totalStudyTimeMinutesLast30Days / uniqueActivityDays.length,
          )
        : 0;

    // 8. Get class info
    const classInfo = await db
      .select({
        className: classes.className,
        gradeLevel: classes.gradeLevel,
      })
      .from(classEnrollment)
      .innerJoin(classes, eq(classEnrollment.classId, classes.id))
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
        ),
      )
      .limit(1);

    return {
      totalCourses,
      coursesInProgress,
      coursesCompleted,
      masteryScore,
      kpMastered,
      totalKpsCount,
      streak,
      pendingAssignments: pendingAssignmentsCount,
      recentActivity: recentActivity?.count || 0,
      totalStudyTimeMinutes,
      averageTimePerDay,
      classInfo: classInfo[0] || null,
    };
  }
}
