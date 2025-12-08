import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db, users, parents } from '../../db';
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

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if parent exists
    await this.findOne(id);

    // Delete parent (cascade will delete from users table)
    await db.delete(parents).where(eq(parents.id, id));

    return { message: 'Parent deleted successfully' };
  }
}
