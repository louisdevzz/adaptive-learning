import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
  knowledgePoint,
  teacherClassMap,
  questionAttempts,
  timeOnTask,
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
      .select()
      .from(students)
      .leftJoin(users, eq(students.id, users.id));

    return result.map((row) => ({
      ...row.users,
      studentInfo: row.students,
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

    const classIds = [...new Set([
      ...teacherClasses.map(c => c.classId),
      ...homeroomClasses.map(c => c.classId),
    ])];

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

    const studentIds = [...new Set(enrollments.map(e => e.studentId))];

    if (studentIds.length === 0) {
      return [];
    }

    const result = await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.id, users.id))
      .where(inArray(students.id, studentIds));

    return result.map((row) => ({
      ...row.users,
      studentInfo: row.students,
    }));
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.id, users.id))
      .where(eq(students.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Student not found');
    }

    return {
      ...result[0].users,
      studentInfo: result[0].students,
    };
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    // Check if student exists
    await this.findOne(id);

    // Update user info if provided
    if (updateStudentDto.email || updateStudentDto.password || updateStudentDto.fullName || updateStudentDto.avatarUrl !== undefined) {
      await this.usersService.updateUser(id, {
        email: updateStudentDto.email,
        password: updateStudentDto.password,
        fullName: updateStudentDto.fullName,
        avatarUrl: updateStudentDto.avatarUrl,
      });
    }

    // Update student info
    const studentUpdateData: any = {};
    if (updateStudentDto.studentCode) studentUpdateData.studentCode = updateStudentDto.studentCode;
    if (updateStudentDto.gradeLevel) studentUpdateData.gradeLevel = updateStudentDto.gradeLevel;
    if (updateStudentDto.schoolName) studentUpdateData.schoolName = updateStudentDto.schoolName;
    if (updateStudentDto.dateOfBirth) studentUpdateData.dateOfBirth = updateStudentDto.dateOfBirth;
    if (updateStudentDto.gender) studentUpdateData.gender = updateStudentDto.gender;

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
          eq(classEnrollment.status, 'active')
        )
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
          eq(courses.active, true)
        )
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

    // Get all courses (same logic as getMyCourses)
    const enrollments = await db
      .select({
        classId: classEnrollment.classId,
      })
      .from(classEnrollment)
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active')
        )
      );

    if (enrollments.length === 0) {
      return [];
    }

    const classIds = enrollments.map((e) => e.classId);

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
          eq(courses.active, true)
        )
      );

    // Remove duplicates by course ID
    const uniqueCoursesMap = new Map();
    courseAssignments.forEach((item) => {
      if (!uniqueCoursesMap.has(item.course.id)) {
        uniqueCoursesMap.set(item.course.id, item.course);
      }
    });

    const coursesList = Array.from(uniqueCoursesMap.values());

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
            status: 'not_started' as const,
            masteredKps: 0,
            totalKps: 0,
          };
        }

        // Get student's progress for these KPs
        let studentProgress: Array<{ kpId: string; masteryScore: number }> = [];
        if (kpIds.length > 0) {
          studentProgress = await db
            .select({
              kpId: studentKpProgress.kpId,
              masteryScore: studentKpProgress.masteryScore,
            })
            .from(studentKpProgress)
            .where(
              and(
                eq(studentKpProgress.studentId, studentId),
                inArray(studentKpProgress.kpId, kpIds)
              )
            );
        }

        // Count mastered KPs (mastery_score >= 60)
        const MASTERY_THRESHOLD = 60;
        const masteredKps = studentProgress.filter(
          (p) => p.masteryScore >= MASTERY_THRESHOLD
        ).length;

        // Check if student has any progress at all (has any record in student_kp_progress)
        // Even if masteryScore = 0 (all answers wrong), it's still "in_progress" not "not_started"
        const hasAnyProgress = studentProgress.length > 0;

        // Calculate progress percentage
        const progress = Math.round((masteredKps / totalKps) * 100);

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
          status,
          masteredKps,
          totalKps,
        };
      })
    );

    return coursesWithProgress;
  }

  async getMyDashboardStats(studentId: string) {
    // Verify student exists
    await this.findOne(studentId);

    // 1. Get total enrolled courses
    const enrollments = await db
      .select({ classId: classEnrollment.classId })
      .from(classEnrollment)
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active')
        )
      );

    const classIds = enrollments.map((e) => e.classId);
    let totalCourses = 0;
    let coursesInProgress = 0;
    let coursesCompleted = 0;

    if (classIds.length > 0) {
      const courseAssignments = await db
        .select({ courseId: classCourses.courseId })
        .from(classCourses)
        .innerJoin(courses, eq(classCourses.courseId, courses.id))
        .where(
          and(
            inArray(classCourses.classId, classIds),
            eq(classCourses.status, 'active'),
            eq(courses.active, true)
          )
        );

      const uniqueCourseIds = [...new Set(courseAssignments.map((c) => c.courseId))];
      totalCourses = uniqueCourseIds.length;

      // Check progress for each course
      if (uniqueCourseIds.length > 0) {
        for (const courseId of uniqueCourseIds) {
          const courseKps = await db
            .select({ kpId: sectionKpMap.kpId })
            .from(modules)
            .innerJoin(sections, eq(sections.moduleId, modules.id))
            .innerJoin(sectionKpMap, eq(sectionKpMap.sectionId, sections.id))
            .where(eq(modules.courseId, courseId));

          const kpIds = courseKps.map((kp) => kp.kpId);
          const totalKps = kpIds.length;

          if (totalKps === 0) continue;

          const studentProgress = await db
            .select({ masteryScore: studentKpProgress.masteryScore })
            .from(studentKpProgress)
            .where(
              and(
                eq(studentKpProgress.studentId, studentId),
                inArray(studentKpProgress.kpId, kpIds)
              )
            );

          const masteredKps = studentProgress.filter(
            (p) => p.masteryScore >= 60
          ).length;

          const progress = Math.round((masteredKps / totalKps) * 100);

          // Check if student has attempted any KP in this course (has progress record)
          const hasAttemptedAny = studentProgress.length > 0;

          if (progress === 100) {
            coursesCompleted++;
          } else if (progress > 0 || hasAttemptedAny) {
            coursesInProgress++;
          }
        }
      }
    }

    // 2. Get overall mastery score (average of all KP progress)
    const progressData = await db
      .select({ avgMastery: sql<number>`COALESCE(AVG(${studentKpProgress.masteryScore}), 0)` })
      .from(studentKpProgress)
      .where(eq(studentKpProgress.studentId, studentId));

    const masteryScore = Math.round(parseFloat(progressData[0]?.avgMastery?.toString() || '0'));

    // 3. Get total KPs mastered
          const masteredKpsCount = await db
      .select({ count: count() })
      .from(studentKpProgress)
      .where(
        and(
          eq(studentKpProgress.studentId, studentId),
          gte(studentKpProgress.masteryScore, 60)
        )
      );

    const kpMastered = masteredKpsCount[0]?.count || 0;

    // 4. Get total KPs attempted
    const totalKpsAttempted = await db
      .select({ count: count() })
      .from(studentKpProgress)
      .where(eq(studentKpProgress.studentId, studentId));

    const totalKpsCount = totalKpsAttempted[0]?.count || 0;

    // 5. Get current streak (consecutive days with activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttempts = await db
      .select({
        date: sql<string>`DATE(${questionAttempts.attemptTime})`,
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${questionAttempts.attemptTime})`)
      .orderBy(sql`DATE(${questionAttempts.attemptTime}) DESC`);

    // Calculate streak
    let streak = 0;
    if (recentAttempts.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Check if active today or yesterday
      const lastActiveDate = recentAttempts[0]?.date;
      if (lastActiveDate === today || lastActiveDate === yesterday) {
        streak = 1;
        for (let i = 1; i < recentAttempts.length; i++) {
          const currentDate = new Date(recentAttempts[i - 1]?.date);
          const prevDate = new Date(recentAttempts[i]?.date);
          const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // 6. Get pending assignments count
    // Note: Currently simplified since there's no assignmentSubmissions table
    // TODO: Implement proper assignment tracking when submissions table is added
    const pendingAssignmentsCount = 0;

    // 7. Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentActivity] = await db
      .select({ count: count() })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, sevenDaysAgo)
        )
      );

    // 8. Get total study time (in minutes) from timeOnTask table
    const studyTimeData = await db
      .select({
        totalTime: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0)`,
      })
      .from(timeOnTask)
      .where(
        and(
          eq(timeOnTask.studentId, studentId),
          gte(timeOnTask.computedAt, thirtyDaysAgo)
        )
      );

    const totalStudyTimeMinutes = Math.round((studyTimeData[0]?.totalTime || 0) / 60);

    // 9. Get class info
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
          eq(classEnrollment.status, 'active')
        )
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
      classInfo: classInfo[0] || null,
    };
  }
}
