import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { db, students, teachers, parents, admins } from '../../db';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    // Create base user
    const user = await this.usersService.create({
      email: createUserDto.email,
      password: createUserDto.password,
      fullName: createUserDto.fullName,
      role: createUserDto.role,
      avatarUrl: createUserDto.avatarUrl,
    });

    let info: any = null;

    // Create role-specific record based on role
    switch (createUserDto.role) {
      case 'student':
        if (!createUserDto.studentCode || !createUserDto.gradeLevel || !createUserDto.schoolName ||
            !createUserDto.dateOfBirth || !createUserDto.gender) {
          throw new BadRequestException('Missing required student fields');
        }

        const [studentInfo] = await db.insert(students).values({
          id: user.id,
          studentCode: createUserDto.studentCode,
          gradeLevel: createUserDto.gradeLevel,
          schoolName: createUserDto.schoolName,
          dateOfBirth: createUserDto.dateOfBirth,
          gender: createUserDto.gender,
        }).returning();

        info = studentInfo;
        break;

      case 'teacher':
        if (!createUserDto.specialization || !createUserDto.experienceYears ||
            !createUserDto.certifications || !createUserDto.phone) {
          throw new BadRequestException('Missing required teacher fields');
        }

        const [teacherInfo] = await db.insert(teachers).values({
          id: user.id,
          specialization: createUserDto.specialization,
          experienceYears: createUserDto.experienceYears,
          certifications: createUserDto.certifications,
          phone: createUserDto.phone,
          bio: createUserDto.bio || null,
        }).returning();

        info = teacherInfo;
        break;

      case 'parent':
        if (!createUserDto.parentPhone || !createUserDto.address || !createUserDto.relationshipType) {
          throw new BadRequestException('Missing required parent fields');
        }

        const [parentInfo] = await db.insert(parents).values({
          id: user.id,
          phone: createUserDto.parentPhone,
          address: createUserDto.address,
          relationshipType: createUserDto.relationshipType,
        }).returning();

        info = parentInfo;
        break;

      case 'admin':
        if (!createUserDto.adminLevel || !createUserDto.permissions) {
          throw new BadRequestException('Missing required admin fields');
        }

        const [adminInfo] = await db.insert(admins).values({
          id: user.id,
          adminLevel: createUserDto.adminLevel,
          permissions: createUserDto.permissions,
        }).returning();

        info = adminInfo;
        break;

      default:
        throw new BadRequestException('Invalid role');
    }

    // Add User Role
    await this.usersService.addUserRole({
      userId: user.id,
      roleName: createUserDto.role,
      permissions: createUserDto.permissions,
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
        info,
      },
      accessToken, // Will be used to set cookie in controller
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.status) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
      },
      accessToken, // Will be used to set cookie in controller
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    let info: any = null;

    // Get role-specific information based on user role
    switch (user.role) {
      case 'student':
        const studentResult = await db
          .select()
          .from(students)
          .where(eq(students.id, userId))
          .limit(1);
        if (studentResult.length > 0) {
          info = studentResult[0];
        }
        break;

      case 'teacher':
        const teacherResult = await db
          .select()
          .from(teachers)
          .where(eq(teachers.id, userId))
          .limit(1);
        if (teacherResult.length > 0) {
          info = teacherResult[0];
        }
        break;

      case 'parent':
        const parentResult = await db
          .select()
          .from(parents)
          .where(eq(parents.id, userId))
          .limit(1);
        if (parentResult.length > 0) {
          info = parentResult[0];
        }
        break;

      case 'admin':
        const adminResult = await db
          .select()
          .from(admins)
          .where(eq(admins.id, userId))
          .limit(1);
        if (adminResult.length > 0) {
          info = adminResult[0];
        }
        break;
    }

    return {
      ...userWithoutPassword,
      info,
    };
  }
}
