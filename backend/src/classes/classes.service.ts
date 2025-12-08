import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db, classes, classEnrollment, teacherClassMap, students, teachers, users } from '../../db';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { AssignTeacherToClassDto } from './dto/assign-teacher.dto';

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
}
