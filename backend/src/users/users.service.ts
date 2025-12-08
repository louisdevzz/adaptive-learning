import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db, userRoles, users } from '../../db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  async findAll() {
    const user = await db.select().from(users);
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findStatus(id: string){
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.status;
  }

  async findRole(id: string){
    const [userRole] = await db.select().from(userRoles).where(eq(userRoles.userId, id)).limit(1);
    if (!userRole) {
      throw new NotFoundException('User not found');
    }
    return userRole.roleName;
  }

  async findPermissions(id: string){
    const [userRole] = await db.select().from(userRoles).where(eq(userRoles.userId, id)).limit(1);
    if (!userRole) {
      throw new NotFoundException('User not found');
    }
    return userRole.permissions;
  }

  async create(userData: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
  }) {
    // Check if user already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: userData.email,
        passwordHash: passwordHash,
        fullName: userData.fullName,
        role: userData.role,
        avatarUrl: userData.avatarUrl || null,
        status: true,
      })
      .returning();

    return newUser;
  }

  async addUserRole(userRoleData: {
    userId: string;
    roleName: string;
    permissions?: string[];
  }) {
    const existingUserRole = await db.select().from(userRoles).where(and(eq(userRoles.userId, userRoleData.userId), eq(userRoles.roleName, userRoleData.roleName))).limit(1);
    if (existingUserRole.length > 0) {
      throw new ConflictException('User role already exists');
    }
    const [userRole] = await db.insert(userRoles).values({
      userId: userRoleData.userId,
      roleName: userRoleData.roleName,
      permissions: userRoleData.permissions || [],
    }).returning();
    return userRole;
  }

  async removeUserRole(userId: string, roleName: string) {
    const result = await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleName, roleName))).returning();
    if (result.length === 0) {
      throw new NotFoundException('User role not found');
    }
    return result;
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUser(id: string, updateData: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    const userRole = await db.select().from(userRoles).where(eq(userRoles.userId, id)).limit(1);
    if (userRole.length > 0) {
      await db.update(userRoles).set({
        roleName: updatedUser.role,
      }).where(eq(userRoles.userId, id));
    }

    return updatedUser;
  }

  async updateUserStatus(id: string, updateData: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await db.update(users).set({
      status: updateData.status,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async deleteUser(id: string) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    if (result.length === 0) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  async deleteUserRole(userId: string) {
    const result = await db.delete(userRoles).where(eq(userRoles.userId, userId)).returning();
    if (result.length === 0) {
      throw new NotFoundException('User role not found');
    }
    return result;
  }
}
