import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db, users, students } from '../../db';
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
    if (updateStudentDto.fullName || updateStudentDto.avatarUrl !== undefined) {
      await this.usersService.updateUser(id, {
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
}
