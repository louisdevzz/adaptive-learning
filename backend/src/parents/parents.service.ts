import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { db, users, parents, parentStudentMap, students } from '../../db';
import { UsersService } from '../users/users.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentsService {
  constructor(private readonly usersService: UsersService) {}

  async create(createParentDto: CreateParentDto) {
    // Create user first
    const user = await this.usersService.create({
      email: createParentDto.email,
      password: createParentDto.password,
      fullName: createParentDto.fullName,
      role: 'parent',
      avatarUrl: createParentDto.avatarUrl,
    });

    // Create parent record
    const [parent] = await db
      .insert(parents)
      .values({
        id: user.id,
        phone: createParentDto.phone,
        address: createParentDto.address,
        relationshipType: createParentDto.relationshipType,
      })
      .returning();

    // Create parent-student mappings (studentIds is required)
    // Validate that all studentIds exist
    const existingStudents = await db
      .select()
      .from(students)
      .where(inArray(students.id, createParentDto.studentIds));

    if (existingStudents.length !== createParentDto.studentIds.length) {
      throw new BadRequestException('One or more student IDs are invalid');
    }

    // Create parent-student mappings
    const mappings = createParentDto.studentIds.map((studentId) => ({
      parentId: parent.id,
      studentId: studentId,
    }));

    await db.insert(parentStudentMap).values(mappings);

    return {
      ...user,
      parentInfo: parent,
    };
  }

  async findAll() {
    const result = await db
      .select()
      .from(parents)
      .leftJoin(users, eq(parents.id, users.id));

    return result.map((row) => ({
      ...row.users,
      parentInfo: row.parents,
    }));
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(parents)
      .leftJoin(users, eq(parents.id, users.id))
      .where(eq(parents.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Parent not found');
    }

    return {
      ...result[0].users,
      parentInfo: result[0].parents,
    };
  }

  async update(id: string, updateParentDto: UpdateParentDto) {
    // Check if parent exists
    await this.findOne(id);

    // Update user info if provided
    if (updateParentDto.fullName || updateParentDto.avatarUrl !== undefined) {
      await this.usersService.updateUser(id, {
        fullName: updateParentDto.fullName,
        avatarUrl: updateParentDto.avatarUrl,
      });
    }

    // Update parent info
    const parentUpdateData: any = {};
    if (updateParentDto.phone) parentUpdateData.phone = updateParentDto.phone;
    if (updateParentDto.address) parentUpdateData.address = updateParentDto.address;
    if (updateParentDto.relationshipType) parentUpdateData.relationshipType = updateParentDto.relationshipType;

    if (Object.keys(parentUpdateData).length > 0) {
      parentUpdateData.updatedAt = new Date();
      await db
        .update(parents)
        .set(parentUpdateData)
        .where(eq(parents.id, id));
    }

    // Update parent-student mappings if studentIds provided
    if (updateParentDto.studentIds !== undefined) {
      // Delete existing mappings
      await db.delete(parentStudentMap).where(eq(parentStudentMap.parentId, id));

      // Create new mappings if studentIds provided
      if (updateParentDto.studentIds.length > 0) {
        // Validate that all studentIds exist
        const existingStudents = await db
          .select()
          .from(students)
          .where(inArray(students.id, updateParentDto.studentIds));

        if (existingStudents.length !== updateParentDto.studentIds.length) {
          throw new BadRequestException('One or more student IDs are invalid');
        }

        // Create new parent-student mappings
        const mappings = updateParentDto.studentIds.map((studentId) => ({
          parentId: id,
          studentId: studentId,
        }));

        await db.insert(parentStudentMap).values(mappings);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if parent exists
    await this.findOne(id);

    // Delete parent-student mappings first (explicit delete for clarity, though cascade should handle it)
    await db.delete(parentStudentMap).where(eq(parentStudentMap.parentId, id));

    // Delete parent (cascade will delete from users table)
    await db.delete(parents).where(eq(parents.id, id));

    return { message: 'Parent deleted successfully' };
  }

  async getParentStudents(parentId: string) {
    // Check if parent exists
    await this.findOne(parentId);

    // Get all students linked to this parent
    const result = await db
      .select({
        student: students,
        user: users,
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

  async addStudentToParent(parentId: string, studentId: string) {
    // Check if parent exists
    await this.findOne(parentId);

    // Check if student exists
    const student = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (student.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Check if mapping already exists
    const existing = await db
      .select()
      .from(parentStudentMap)
      .where(
        and(
          eq(parentStudentMap.parentId, parentId),
          eq(parentStudentMap.studentId, studentId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Student is already linked to this parent');
    }

    // Create mapping
    const [mapping] = await db
      .insert(parentStudentMap)
      .values({
        parentId,
        studentId,
      })
      .returning();

    return mapping;
  }

  async removeStudentFromParent(parentId: string, studentId: string) {
    // Check if parent exists
    await this.findOne(parentId);

    // Check if mapping exists
    const existing = await db
      .select()
      .from(parentStudentMap)
      .where(
        and(
          eq(parentStudentMap.parentId, parentId),
          eq(parentStudentMap.studentId, studentId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Student is not linked to this parent');
    }

    // Delete mapping
    await db
      .delete(parentStudentMap)
      .where(
        and(
          eq(parentStudentMap.parentId, parentId),
          eq(parentStudentMap.studentId, studentId)
        )
      );

    return { message: 'Student removed from parent successfully' };
  }
}
