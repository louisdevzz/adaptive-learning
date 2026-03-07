import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db, users, teachers, teacherCourseMap, courses } from '../../db';
import { UsersService } from '../users/users.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AssignCourseDto } from './dto/assign-course.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly usersService: UsersService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    // Create user first
    const user = await this.usersService.create({
      email: createTeacherDto.email,
      password: createTeacherDto.password,
      fullName: createTeacherDto.fullName,
      role: 'teacher',
      avatarUrl: createTeacherDto.avatarUrl,
    });

    // Create teacher record
    const [teacher] = await db
      .insert(teachers)
      .values({
        id: user.id,
        specialization: createTeacherDto.specialization,
        experienceYears: createTeacherDto.experienceYears,
        certifications: createTeacherDto.certifications || [],
        phone: createTeacherDto.phone,
        bio: createTeacherDto.bio || null,
      })
      .returning();

    return {
      ...user,
      teacherInfo: teacher,
    };
  }

  async findAll() {
    const result = await db
      .select()
      .from(teachers)
      .leftJoin(users, eq(teachers.id, users.id));

    return result.map((row) => ({
      ...row.users,
      teacherInfo: row.teachers,
    }));
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(teachers)
      .leftJoin(users, eq(teachers.id, users.id))
      .where(eq(teachers.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Teacher not found');
    }

    return {
      ...result[0].users,
      teacherInfo: result[0].teachers,
    };
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    // Check if teacher exists
    await this.findOne(id);

    // Update user info if provided
    if (
      updateTeacherDto.email ||
      updateTeacherDto.password ||
      updateTeacherDto.fullName ||
      updateTeacherDto.avatarUrl !== undefined
    ) {
      await this.usersService.updateUser(id, {
        email: updateTeacherDto.email,
        password: updateTeacherDto.password,
        fullName: updateTeacherDto.fullName,
        avatarUrl: updateTeacherDto.avatarUrl,
      });
    }

    // Update teacher info
    const teacherUpdateData: any = {};
    if (updateTeacherDto.specialization)
      teacherUpdateData.specialization = updateTeacherDto.specialization;
    if (updateTeacherDto.experienceYears)
      teacherUpdateData.experienceYears = updateTeacherDto.experienceYears;
    if (updateTeacherDto.certifications)
      teacherUpdateData.certifications = updateTeacherDto.certifications;
    if (updateTeacherDto.phone)
      teacherUpdateData.phone = updateTeacherDto.phone;
    if (updateTeacherDto.bio !== undefined)
      teacherUpdateData.bio = updateTeacherDto.bio;

    if (Object.keys(teacherUpdateData).length > 0) {
      teacherUpdateData.updatedAt = new Date();
      await db
        .update(teachers)
        .set(teacherUpdateData)
        .where(eq(teachers.id, id));
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if teacher exists
    await this.findOne(id);

    // Delete teacher (cascade will delete from users table)
    await db.delete(teachers).where(eq(teachers.id, id));

    return { message: 'Teacher deleted successfully' };
  }

  // Course Assignment Methods
  async assignCourse(teacherId: string, assignCourseDto: AssignCourseDto) {
    // Check if teacher exists
    await this.findOne(teacherId);

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
      .from(teacherCourseMap)
      .where(
        and(
          eq(teacherCourseMap.teacherId, teacherId),
          eq(teacherCourseMap.courseId, assignCourseDto.courseId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Teacher already assigned to this course');
    }

    const [assignment] = await db
      .insert(teacherCourseMap)
      .values({
        teacherId,
        courseId: assignCourseDto.courseId,
        role: assignCourseDto.role || 'collaborator',
      })
      .returning();

    return assignment;
  }

  async getTeacherCourses(teacherId: string) {
    await this.findOne(teacherId);

    const result = await db
      .select({
        assignment: teacherCourseMap,
        course: courses,
      })
      .from(teacherCourseMap)
      .innerJoin(courses, eq(teacherCourseMap.courseId, courses.id))
      .where(eq(teacherCourseMap.teacherId, teacherId));

    return result.map((row) => ({
      assignmentId: row.assignment.id,
      role: row.assignment.role,
      assignedAt: row.assignment.assignedAt,
      course: row.course,
    }));
  }

  async removeCourseFromTeacher(teacherId: string, courseId: string) {
    await this.findOne(teacherId);

    const result = await db
      .delete(teacherCourseMap)
      .where(
        and(
          eq(teacherCourseMap.teacherId, teacherId),
          eq(teacherCourseMap.courseId, courseId),
        ),
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Teacher not assigned to this course');
    }

    return { message: 'Course removed from teacher successfully' };
  }
}
