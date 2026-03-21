import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { db, userRoles, users } from '../../db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findAll() {
    const user = await db.select().from(users);
    return user;
  }

  async findByEmail(email: string) {
    const normalizedEmail = this.normalizeEmail(email);

    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${normalizedEmail}`)
      .limit(1);

    return user;
  }

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findStatus(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.status;
  }

  async findRole(id: string) {
    const [userRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, id))
      .limit(1);
    if (!userRole) {
      throw new NotFoundException('User not found');
    }
    return userRole.roleName;
  }

  async findPermissions(id: string) {
    const [userRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, id))
      .limit(1);
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
    const normalizedEmail = this.normalizeEmail(userData.email);

    // Check if user already exists
    const existingUser = await this.findByEmail(normalizedEmail);
    if (existingUser) {
      this.logger.warn(
        `User creation failed: Email already exists - ${normalizedEmail}`,
      );
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    this.logger.debug(
      `Password hashed for user: ${normalizedEmail}, role: ${userData.role}`,
    );

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash: passwordHash,
        fullName: userData.fullName,
        role: userData.role,
        avatarUrl: userData.avatarUrl || null,
        status: true,
      })
      .returning();

    this.logger.log(
      `User created successfully: ${newUser.email}, role: ${newUser.role}`,
    );
    return newUser;
  }

  async addUserRole(userRoleData: {
    userId: string;
    roleName: string;
    permissions?: string[];
  }) {
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userRoleData.userId),
          eq(userRoles.roleName, userRoleData.roleName),
        ),
      )
      .limit(1);
    if (existingUserRole.length > 0) {
      throw new ConflictException('User role already exists');
    }
    const [userRole] = await db
      .insert(userRoles)
      .values({
        userId: userRoleData.userId,
        roleName: userRoleData.roleName,
        permissions: userRoleData.permissions || [],
      })
      .returning();
    return userRole;
  }

  async removeUserRole(userId: string, roleName: string) {
    const result = await db
      .delete(userRoles)
      .where(
        and(eq(userRoles.userId, userId), eq(userRoles.roleName, roleName)),
      )
      .returning();
    if (result.length === 0) {
      throw new NotFoundException('User role not found');
    }
    return result;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!hashedPassword) {
      this.logger.error(
        'validatePassword: hashedPassword is null or undefined',
      );
      return false;
    }
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    this.logger.debug(`Password validation result: ${isValid}`);
    return isValid;
  }

  async updateUser(
    id: string,
    updateData: Partial<typeof users.$inferInsert> & { password?: string },
  ) {
    // Hash password if provided
    const updatePayload: Partial<typeof users.$inferInsert> = { ...updateData };

    if (typeof updatePayload.email === 'string') {
      updatePayload.email = this.normalizeEmail(updatePayload.email);
    }

    if ('password' in updateData && updateData.password) {
      const saltRounds = 10;
      updatePayload.passwordHash = await bcrypt.hash(
        updateData.password,
        saltRounds,
      );
      delete (updatePayload as any).password; // Remove plain password
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updatePayload,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    const userRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, id))
      .limit(1);
    if (userRole.length > 0) {
      await db
        .update(userRoles)
        .set({
          roleName: updatedUser.role,
        })
        .where(eq(userRoles.userId, id));
    }

    return updatedUser;
  }

  async updateUserStatus(
    id: string,
    updateData: Partial<typeof users.$inferInsert>,
  ) {
    const [updatedUser] = await db
      .update(users)
      .set({
        status: updateData.status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
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
    const result = await db
      .delete(userRoles)
      .where(eq(userRoles.userId, userId))
      .returning();
    if (result.length === 0) {
      throw new NotFoundException('User role not found');
    }
    return result;
  }

  async resetPassword(id: string, newPassword: string) {
    // Check if user exists
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    const [updatedUser] = await db
      .update(users)
      .set({
        passwordHash: passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    this.logger.log(`Password reset successfully for user: ${user.email}`);
    return updatedUser;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
