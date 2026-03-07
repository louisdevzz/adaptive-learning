import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, inArray, notInArray } from 'drizzle-orm';
import { db, classes, classEnrollment, teacherClassMap, students, teachers, users, classCourses, courses, studentKpProgress, studentMastery, studentInsights, knowledgePoint } from '../../db';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { AssignTeacherToClassDto } from './dto/assign-teacher.dto';
import { AssignCourseToClassDto } from './dto/assign-course.dto';

@Injectable()
export class ClassesService {
  async create(createClassDto: CreateClassDto) {
    // Check if homeroom teacher exists
    if (createClassDto.homeroomTeacherId) {
      const teacher = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, createClassDto.homeroomTeacherId))
        .limit(1);

      if (teacher.length === 0) {
        throw new NotFoundException('Homeroom teacher not found');
      }
    }

    const [newClass] = await db
      .insert(classes)
      .values({
        className: createClassDto.className,
        gradeLevel: createClassDto.gradeLevel,
        schoolYear: createClassDto.schoolYear,
        homeroomTeacherId: createClassDto.homeroomTeacherId || null,
      })
      .returning();

    return newClass;
  }

  async findAll() {
    const result = await db
      .select({
        class: classes,
        homeroomTeacher: {
          id: teachers.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(classes)
      .leftJoin(teachers, eq(classes.homeroomTeacherId, teachers.id))
      .leftJoin(users, eq(teachers.id, users.id));

    return result.map((row) => ({
      ...row.class,
      homeroomTeacher: row.homeroomTeacher.id ? row.homeroomTeacher : null,
    }));
  }

  async findByTeacher(teacherId: string) {
    // Get class IDs from teacherClassMap + homeroom
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

    const classIds = [...new Set([
      ...assigned.map(c => c.classId),
      ...homeroom.map(c => c.classId),
    ])];

    if (classIds.length === 0) {
      return [];
    }

    const result = await db
      .select({
        class: classes,
        homeroomTeacher: {
          id: teachers.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(classes)
      .leftJoin(teachers, eq(classes.homeroomTeacherId, teachers.id))
      .leftJoin(users, eq(teachers.id, users.id))
      .where(inArray(classes.id, classIds));

    return result.map((row) => ({
      ...row.class,
      homeroomTeacher: row.homeroomTeacher.id ? row.homeroomTeacher : null,
    }));
  }

  async findOne(id: string) {
    const result = await db
      .select({
        class: classes,
        homeroomTeacher: {
          id: teachers.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(classes)
      .leftJoin(teachers, eq(classes.homeroomTeacherId, teachers.id))
      .leftJoin(users, eq(teachers.id, users.id))
      .where(eq(classes.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Class not found');
    }

    return {
      ...result[0].class,
      homeroomTeacher: result[0].homeroomTeacher.id ? result[0].homeroomTeacher : null,
    };
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    await this.findOne(id);

    // Check if homeroom teacher exists
    if (updateClassDto.homeroomTeacherId) {
      const teacher = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, updateClassDto.homeroomTeacherId))
        .limit(1);

      if (teacher.length === 0) {
        throw new NotFoundException('Homeroom teacher not found');
      }
    }

    const [updatedClass] = await db
      .update(classes)
      .set({
        ...updateClassDto,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, id))
      .returning();

    return updatedClass;
  }

  async remove(id: string) {
    await this.findOne(id);
    await db.delete(classes).where(eq(classes.id, id));
    return { message: 'Class deleted successfully' };
  }

  // Student Enrollment
  async enrollStudent(classId: string, enrollStudentDto: EnrollStudentDto) {
    // Check if class exists
    await this.findOne(classId);

    // Check if student exists
    const student = await db
      .select()
      .from(students)
      .where(eq(students.id, enrollStudentDto.studentId))
      .limit(1);

    if (student.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Check if already enrolled
    const existing = await db
      .select()
      .from(classEnrollment)
      .where(
        and(
          eq(classEnrollment.classId, classId),
          eq(classEnrollment.studentId, enrollStudentDto.studentId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Student already enrolled in this class');
    }

    const [enrollment] = await db
      .insert(classEnrollment)
      .values({
        classId,
        studentId: enrollStudentDto.studentId,
        status: enrollStudentDto.status || 'active',
      })
      .returning();

    return enrollment;
  }

  async getClassStudents(classId: string) {
    await this.findOne(classId);

    const result = await db
      .select({
        enrollment: classEnrollment,
        student: students,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(classEnrollment)
      .innerJoin(students, eq(classEnrollment.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .where(eq(classEnrollment.classId, classId));

    return result.map((row) => ({
      enrollmentId: row.enrollment.id,
      status: row.enrollment.status,
      enrolledAt: row.enrollment.enrolledAt,
      student: {
        ...row.user,
        studentInfo: row.student,
      },
    }));
  }

  async removeStudentFromClass(classId: string, studentId: string) {
    await this.findOne(classId);

    const result = await db
      .delete(classEnrollment)
      .where(
        and(
          eq(classEnrollment.classId, classId),
          eq(classEnrollment.studentId, studentId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Student not enrolled in this class');
    }

    return { message: 'Student removed from class successfully' };
  }

  async getAvailableStudents(classId: string) {
    await this.findOne(classId);

    // Get all enrolled student IDs in this class
    const enrolledStudents = await db
      .select({ studentId: classEnrollment.studentId })
      .from(classEnrollment)
      .where(eq(classEnrollment.classId, classId));

    const enrolledStudentIds = enrolledStudents.map((s) => s.studentId);

    // Get all students not enrolled in this class
    let availableStudents;
    if (enrolledStudentIds.length === 0) {
      availableStudents = await db
        .select({
          student: students,
          user: {
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(students)
        .innerJoin(users, eq(students.id, users.id));
    } else {
      availableStudents = await db
        .select({
          student: students,
          user: {
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(students)
        .innerJoin(users, eq(students.id, users.id))
        .where(notInArray(students.id, enrolledStudentIds));
    }

    return availableStudents.map((row) => ({
      ...row.user,
      studentInfo: row.student,
    }));
  }

  // Teacher Assignment
  async assignTeacher(classId: string, assignTeacherDto: AssignTeacherToClassDto) {
    // Check if class exists
    await this.findOne(classId);

    // Check if teacher exists
    const teacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, assignTeacherDto.teacherId))
      .limit(1);

    if (teacher.length === 0) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if already assigned
    const existing = await db
      .select()
      .from(teacherClassMap)
      .where(
        and(
          eq(teacherClassMap.classId, classId),
          eq(teacherClassMap.teacherId, assignTeacherDto.teacherId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Teacher already assigned to this class');
    }

    const [assignment] = await db
      .insert(teacherClassMap)
      .values({
        classId,
        teacherId: assignTeacherDto.teacherId,
        role: assignTeacherDto.role,
        status: assignTeacherDto.status || 'active',
      })
      .returning();

    return assignment;
  }

  async getClassTeachers(classId: string) {
    await this.findOne(classId);

    const result = await db
      .select({
        assignment: teacherClassMap,
        teacher: teachers,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(teacherClassMap)
      .innerJoin(teachers, eq(teacherClassMap.teacherId, teachers.id))
      .innerJoin(users, eq(teachers.id, users.id))
      .where(eq(teacherClassMap.classId, classId));

    return result.map((row) => ({
      assignmentId: row.assignment.id,
      role: row.assignment.role,
      status: row.assignment.status,
      assignedAt: row.assignment.assignedAt,
      teacher: {
        ...row.user,
        teacherInfo: row.teacher,
      },
    }));
  }

  async removeTeacherFromClass(classId: string, teacherId: string) {
    await this.findOne(classId);

    const result = await db
      .delete(teacherClassMap)
      .where(
        and(
          eq(teacherClassMap.classId, classId),
          eq(teacherClassMap.teacherId, teacherId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Teacher not assigned to this class');
    }

    return { message: 'Teacher removed from class successfully' };
  }

  // Course Assignment
  async assignCourse(classId: string, assignCourseDto: AssignCourseToClassDto) {
    // Check if class exists
    await this.findOne(classId);

    // Check if course exists
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, assignCourseDto.courseId))
      .limit(1);

    if (course.length === 0) {
      throw new NotFoundException('Course not found');
    }

    // Check if already assigned
    const existing = await db
      .select()
      .from(classCourses)
      .where(
        and(
          eq(classCourses.classId, classId),
          eq(classCourses.courseId, assignCourseDto.courseId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Course already assigned to this class');
    }

    const [assignment] = await db
      .insert(classCourses)
      .values({
        classId,
        courseId: assignCourseDto.courseId,
        assignedBy: assignCourseDto.assignedBy || null,
        status: assignCourseDto.status || 'active',
      })
      .returning();

    return assignment;
  }

  async getClassCourses(classId: string) {
    await this.findOne(classId);

    const result = await db
      .select({
        assignment: classCourses,
        course: courses,
        assignedByUser: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
        },
      })
      .from(classCourses)
      .innerJoin(courses, eq(classCourses.courseId, courses.id))
      .leftJoin(users, eq(classCourses.assignedBy, users.id))
      .where(eq(classCourses.classId, classId));

    return result.map((row) => ({
      assignmentId: row.assignment.id,
      status: row.assignment.status,
      assignedAt: row.assignment.assignedAt,
      assignedBy: row.assignedByUser?.id ? row.assignedByUser : null,
      course: row.course,
    }));
  }

  async getClassCoursesByStatus(classId: string, status: string) {
    await this.findOne(classId);

    const result = await db
      .select({
        assignment: classCourses,
        course: courses,
        assignedByUser: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
        },
      })
      .from(classCourses)
      .innerJoin(courses, eq(classCourses.courseId, courses.id))
      .leftJoin(users, eq(classCourses.assignedBy, users.id))
      .where(
        and(
          eq(classCourses.classId, classId),
          eq(classCourses.status, status)
        )
      );

    return result.map((row) => ({
      assignmentId: row.assignment.id,
      status: row.assignment.status,
      assignedAt: row.assignment.assignedAt,
      assignedBy: row.assignedByUser?.id ? row.assignedByUser : null,
      course: row.course,
    }));
  }

  async updateClassCourseStatus(classId: string, courseId: string, status: string) {
    await this.findOne(classId);

    // Check if course exists
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (course.length === 0) {
      throw new NotFoundException('Course not found');
    }

    // Check if assignment exists
    const existing = await db
      .select()
      .from(classCourses)
      .where(
        and(
          eq(classCourses.classId, classId),
          eq(classCourses.courseId, courseId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Course not assigned to this class');
    }

    const [updated] = await db
      .update(classCourses)
      .set({
        status,
      })
      .where(
        and(
          eq(classCourses.classId, classId),
          eq(classCourses.courseId, courseId)
        )
      )
      .returning();

    return updated;
  }

  async removeCourseFromClass(classId: string, courseId: string) {
    await this.findOne(classId);

    const result = await db
      .delete(classCourses)
      .where(
        and(
          eq(classCourses.classId, classId),
          eq(classCourses.courseId, courseId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Course not assigned to this class');
    }

    return { message: 'Course removed from class successfully' };
  }

  // Class Progress Aggregation
  async getClassProgress(classId: string) {
    await this.findOne(classId);

    // Get enrolled students
    const enrolledStudents = await db
      .select({
        enrollment: classEnrollment,
        student: students,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
        },
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

    if (enrolledStudents.length === 0) {
      return {
        students: [],
        summary: {
          totalStudents: 0,
          avgMastery: 0,
          atRiskCount: 0,
          excellentCount: 0,
          totalKpsMastered: 0,
        },
      };
    }

    const studentIds = enrolledStudents.map((s) => s.user.id);

    // Get all KP progress for enrolled students
    const allKpProgress = await db
      .select({
        studentId: studentKpProgress.studentId,
        masteryScore: studentKpProgress.masteryScore,
        confidence: studentKpProgress.confidence,
        lastUpdated: studentKpProgress.lastUpdated,
      })
      .from(studentKpProgress)
      .where(inArray(studentKpProgress.studentId, studentIds));

    // Get all mastery records for enrolled students
    const allMastery = await db
      .select()
      .from(studentMastery)
      .where(inArray(studentMastery.studentId, studentIds));

    // Get all insights for enrolled students
    const allInsights = await db
      .select()
      .from(studentInsights)
      .where(inArray(studentInsights.studentId, studentIds));

    // Build per-student progress
    const studentsProgress = enrolledStudents.map((enrolled) => {
      const studentId = enrolled.user.id;
      const kpProgress = allKpProgress.filter((kp) => kp.studentId === studentId);
      const mastery = allMastery.filter((m) => m.studentId === studentId);
      const insights = allInsights.find((i) => i.studentId === studentId);

      const totalKps = kpProgress.length;
      const avgKpMastery = totalKps > 0
        ? Math.round(kpProgress.reduce((sum, kp) => sum + kp.masteryScore, 0) / totalKps)
        : 0;
      const masteredKps = kpProgress.filter((kp) => kp.masteryScore >= 80).length;

      const avgCourseMastery = mastery.length > 0
        ? Math.round(mastery.reduce((sum, m) => sum + m.overallMasteryScore, 0) / mastery.length)
        : 0;

      const overallMastery = mastery.length > 0 ? avgCourseMastery : avgKpMastery;

      // Determine status
      let status: string;
      let riskLevel: string;
      if (overallMastery >= 80) {
        status = 'excellent';
        riskLevel = 'low';
      } else if (overallMastery >= 60) {
        status = 'good';
        riskLevel = 'low';
      } else if (overallMastery >= 40) {
        status = 'at-risk';
        riskLevel = 'medium';
      } else {
        status = 'needs-help';
        riskLevel = 'high';
      }

      // Find last active time from KP progress
      const lastActiveDate = kpProgress.length > 0
        ? kpProgress.reduce((latest, kp) => {
            const kpDate = new Date(kp.lastUpdated);
            return kpDate > latest ? kpDate : latest;
          }, new Date(0))
        : null;

      const engagementScore = insights
        ? (typeof insights.engagementScore === 'number' ? insights.engagementScore : 0)
        : 0;

      return {
        id: studentId,
        name: enrolled.user.fullName,
        email: enrolled.user.email,
        avatar: enrolled.user.avatarUrl,
        progress: overallMastery,
        masteryScore: avgKpMastery,
        totalKps,
        masteredKps,
        engagementScore,
        lastActive: lastActiveDate ? lastActiveDate.toISOString() : null,
        status,
        riskLevel,
        courseMastery: mastery.map((m) => ({
          courseId: m.courseId,
          score: m.overallMasteryScore,
        })),
      };
    });

    // Calculate summary
    const totalStudents = studentsProgress.length;
    const avgMastery = totalStudents > 0
      ? Math.round(studentsProgress.reduce((sum, s) => sum + s.progress, 0) / totalStudents)
      : 0;
    const atRiskCount = studentsProgress.filter(
      (s) => s.status === 'at-risk' || s.status === 'needs-help',
    ).length;
    const excellentCount = studentsProgress.filter(
      (s) => s.status === 'excellent',
    ).length;
    const totalKpsMastered = studentsProgress.reduce(
      (sum, s) => sum + s.masteredKps,
      0,
    );

    return {
      students: studentsProgress,
      summary: {
        totalStudents,
        avgMastery,
        atRiskCount,
        excellentCount,
        totalKpsMastered,
      },
    };
  }
}
