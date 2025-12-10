import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { 
  db, 
  users, 
  students, 
  classEnrollment, 
  classCourses, 
  courses,
  modules,
  sections,
  sectionKpMap,
  studentKpProgress,
  knowledgePoint
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

        // Count mastered KPs (mastery_score >= 70)
        const MASTERY_THRESHOLD = 70;
        const masteredKps = studentProgress.filter(
          (p) => p.masteryScore >= MASTERY_THRESHOLD
        ).length;

        // Calculate progress percentage
        const progress = Math.round((masteredKps / totalKps) * 100);

        // Determine status
        let status: 'not_started' | 'in_progress' | 'completed';
        if (progress === 0) {
          status = 'not_started';
        } else if (progress === 100) {
          status = 'completed';
        } else {
          status = 'in_progress';
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
}
