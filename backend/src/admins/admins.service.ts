import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db, users, admins } from '../../db';
import { UsersService } from '../users/users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly usersService: UsersService) {}

  async create(createAdminDto: CreateAdminDto) {
    // Create user first
    const user = await this.usersService.create({
      email: createAdminDto.email,
      password: createAdminDto.password,
      fullName: createAdminDto.fullName,
      role: 'admin',
      avatarUrl: createAdminDto.avatarUrl,
    });

    // Create admin record
    const [admin] = await db
      .insert(admins)
      .values({
        id: user.id,
        adminLevel: createAdminDto.adminLevel,
        permissions: createAdminDto.permissions,
      })
      .returning();

    return {
      ...user,
      adminInfo: admin,
    };
  }

  async findAll() {
    const result = await db
      .select()
      .from(admins)
      .leftJoin(users, eq(admins.id, users.id));

    return result.map((row) => ({
      ...row.users,
      adminInfo: row.admins,
    }));
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(admins)
      .leftJoin(users, eq(admins.id, users.id))
      .where(eq(admins.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Admin not found');
    }

    return {
      ...result[0].users,
      adminInfo: result[0].admins,
    };
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    // Check if admin exists
    await this.findOne(id);

    // Update user info if provided
    if (updateAdminDto.fullName || updateAdminDto.avatarUrl !== undefined) {
      await this.usersService.updateUser(id, {
        fullName: updateAdminDto.fullName,
        avatarUrl: updateAdminDto.avatarUrl,
      });
    }

    // Update admin info
    const adminUpdateData: any = {};
    if (updateAdminDto.adminLevel) adminUpdateData.adminLevel = updateAdminDto.adminLevel;
    if (updateAdminDto.permissions) adminUpdateData.permissions = updateAdminDto.permissions;

    if (Object.keys(adminUpdateData).length > 0) {
      adminUpdateData.updatedAt = new Date();
      await db
        .update(admins)
        .set(adminUpdateData)
        .where(eq(admins.id, id));
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if admin exists
    await this.findOne(id);

    // Delete admin (cascade will delete from users table)
    await db.delete(admins).where(eq(admins.id, id));

    return { message: 'Admin deleted successfully' };
  }
}
