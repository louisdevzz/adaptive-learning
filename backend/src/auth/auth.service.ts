import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { db, students, teachers, parents, admins } from '../../db';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

interface AuthRequestContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  source?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly activityLogService: ActivityLogService,
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
        if (
          !createUserDto.studentCode ||
          !createUserDto.gradeLevel ||
          !createUserDto.schoolName ||
          !createUserDto.dateOfBirth ||
          !createUserDto.gender
        ) {
          throw new BadRequestException('Missing required student fields');
        }

        const [studentInfo] = await db
          .insert(students)
          .values({
            id: user.id,
            studentCode: createUserDto.studentCode,
            gradeLevel: createUserDto.gradeLevel,
            schoolName: createUserDto.schoolName,
            dateOfBirth: createUserDto.dateOfBirth,
            gender: createUserDto.gender,
          })
          .returning();

        info = studentInfo;
        break;

      case 'teacher':
        if (
          !createUserDto.specialization ||
          !createUserDto.experienceYears ||
          !createUserDto.certifications ||
          !createUserDto.phone
        ) {
          throw new BadRequestException('Missing required teacher fields');
        }

        const [teacherInfo] = await db
          .insert(teachers)
          .values({
            id: user.id,
            specialization: createUserDto.specialization,
            experienceYears: createUserDto.experienceYears,
            certifications: createUserDto.certifications,
            phone: createUserDto.phone,
            bio: createUserDto.bio || null,
          })
          .returning();

        info = teacherInfo;
        break;

      case 'parent':
        if (
          !createUserDto.parentPhone ||
          !createUserDto.address ||
          !createUserDto.relationshipType
        ) {
          throw new BadRequestException('Missing required parent fields');
        }

        const [parentInfo] = await db
          .insert(parents)
          .values({
            id: user.id,
            phone: createUserDto.parentPhone,
            address: createUserDto.address,
            relationshipType: createUserDto.relationshipType,
          })
          .returning();

        info = parentInfo;
        break;

      case 'admin':
        if (!createUserDto.adminLevel || !createUserDto.permissions) {
          throw new BadRequestException('Missing required admin fields');
        }

        const [adminInfo] = await db
          .insert(admins)
          .values({
            id: user.id,
            adminLevel: createUserDto.adminLevel,
            permissions: createUserDto.permissions,
          })
          .returning();

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

  async login(
    loginDto: LoginDto,
    requestContext: AuthRequestContext = {},
  ): Promise<AuthResponseDto & { sessionId?: string }> {
    const context = this.normalizeRequestContext(requestContext);

    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      this.activityLogService
        .logEvent({
          activityType: 'auth',
          action: 'login',
          targetType: 'auth',
          status: 'failure',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          requestId: context.requestId,
          source: context.source,
          metadata: {
            email: loginDto.email,
            reason: 'user_not_found',
          },
        })
        .catch((error: unknown) => {
          this.logger.error(
            'Failed to log auth activity for user_not_found login attempt',
            error instanceof Error ? error.stack : String(error),
          );
        });
      this.logger.warn(
        `Login attempt failed: User not found for email ${loginDto.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.debug(
      `Login attempt for user: ${user.email}, role: ${user.role}, status: ${user.status}`,
    );

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.activityLogService
        .logEvent({
          actorUserId: user.id,
          actorRole: user.role,
          studentId: user.role === 'student' ? user.id : undefined,
          activityType: 'auth',
          action: 'login',
          targetType: 'auth',
          targetId: user.id,
          status: 'failure',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          requestId: context.requestId,
          source: context.source,
          metadata: {
            email: user.email,
            reason: 'invalid_password',
          },
        })
        .catch((error: unknown) => {
          this.logger.error(
            'Failed to log auth activity for invalid_password login attempt',
            error instanceof Error ? error.stack : String(error),
          );
        });
      this.logger.warn(
        `Login attempt failed: Invalid password for email ${loginDto.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.status) {
      this.activityLogService
        .logEvent({
          actorUserId: user.id,
          actorRole: user.role,
          studentId: user.role === 'student' ? user.id : undefined,
          activityType: 'auth',
          action: 'login',
          targetType: 'auth',
          targetId: user.id,
          status: 'failure',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          requestId: context.requestId,
          source: context.source,
          metadata: {
            email: user.email,
            reason: 'account_inactive',
          },
        })
        .catch((error: unknown) => {
          this.logger.error(
            'Failed to log auth activity for account_inactive login attempt',
            error instanceof Error ? error.stack : String(error),
          );
        });
      this.logger.warn(
        `Login attempt failed: Account inactive for email ${loginDto.email}`,
      );
      throw new UnauthorizedException('Account is inactive');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const sessionId =
      user.role === 'student'
        ? await this.activityLogService.createStudentSession(user.id, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            sessionType: 'login',
          })
        : undefined;

    await this.activityLogService.logEvent({
      actorUserId: user.id,
      actorRole: user.role,
      studentId: user.role === 'student' ? user.id : undefined,
      sessionId,
      activityType: 'auth',
      action: 'login',
      targetType: 'auth',
      targetId: user.id,
      status: 'success',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      source: context.source,
      metadata: {
        email: user.email,
      },
    });

    this.logger.log(
      `Login successful for user: ${user.email}, role: ${user.role}`,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
      },
      accessToken, // Will be used to set cookie in controller
      sessionId,
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async logout({
    sessionId,
    userId,
    userRole,
    requestContext = {},
  }: {
    sessionId?: string;
    userId?: string;
    userRole?: string;
    requestContext?: AuthRequestContext;
  }) {
    const context = this.normalizeRequestContext(requestContext);

    let resolvedSessionId = sessionId;
    if (resolvedSessionId) {
      await this.activityLogService.closeStudentSession(resolvedSessionId);
    } else if (userId && userRole === 'student') {
      const latestSessionId =
        await this.activityLogService.closeLatestOpenStudentSession(userId);
      resolvedSessionId = latestSessionId || undefined;
    }

    if (userId) {
      await this.activityLogService.logEvent({
        actorUserId: userId,
        actorRole: userRole,
        studentId: userRole === 'student' ? userId : undefined,
        sessionId: resolvedSessionId,
        activityType: 'auth',
        action: 'logout',
        targetType: 'auth',
        targetId: userId,
        status: 'success',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestId: context.requestId,
        source: context.source,
        metadata: {},
      });
    }
  }

  async loginWithGoogle(
    idToken: string,
    requestContext: AuthRequestContext = {},
  ): Promise<AuthResponseDto & { sessionId?: string }> {
    const context = this.normalizeRequestContext(requestContext);

    try {
      // Verify Firebase ID token
      const decodedToken =
        await this.firebaseAdminService.verifyIdToken(idToken);
      const { email, name, picture, uid } = decodedToken;

      if (!email) {
        throw new BadRequestException('Email not found in Google account');
      }

      // Check if user exists
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Create new user if doesn't exist
        // Default role for Google sign-in is 'student'
        user = await this.usersService.create({
          email,
          password: uid, // Use Firebase UID as password (won't be used for login)
          fullName: name || email.split('@')[0],
          role: 'student',
          avatarUrl: picture,
        });

        // Create default student record
        await db.insert(students).values({
          id: user.id,
          studentCode: `ADL${Date.now()}`,
          gradeLevel: 1,
          schoolName: 'Not specified',
          dateOfBirth: '2000-01-01',
          gender: 'other',
        });

        // Add User Role
        await this.usersService.addUserRole({
          userId: user.id,
          roleName: 'student',
          permissions: [],
        });

        this.logger.log(`New user created via Google login: ${email}`);
      }

      // Check if user is active
      if (!user.status) {
        this.activityLogService
          .logEvent({
            actorUserId: user.id,
            actorRole: user.role,
            studentId: user.role === 'student' ? user.id : undefined,
            activityType: 'auth',
            action: 'google_login',
            targetType: 'auth',
            targetId: user.id,
            status: 'failure',
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            requestId: context.requestId,
            source: context.source,
            metadata: {
              email,
              reason: 'account_inactive',
            },
          })
          .catch((error: unknown) => {
            this.logger.error(
              'Failed to log auth activity for account_inactive Google login attempt',
              error instanceof Error ? error.stack : String(error),
            );
          });
        this.logger.warn(
          `Google login attempt failed: Account inactive for email ${email}`,
        );
        throw new UnauthorizedException('Account is inactive');
      }

      // Generate JWT token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      const sessionId =
        user.role === 'student'
          ? await this.activityLogService.createStudentSession(user.id, {
              ipAddress: context.ipAddress,
              userAgent: context.userAgent,
              sessionType: 'login',
            })
          : undefined;

      await this.activityLogService.logEvent({
        actorUserId: user.id,
        actorRole: user.role,
        studentId: user.role === 'student' ? user.id : undefined,
        sessionId,
        activityType: 'auth',
        action: 'google_login',
        targetType: 'auth',
        targetId: user.id,
        status: 'success',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestId: context.requestId,
        source: context.source,
        metadata: {
          email: user.email,
        },
      });

      this.logger.log(
        `Google login successful for user: ${email}, role: ${user.role}`,
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatarUrl: user.avatarUrl || undefined,
        },
        accessToken,
        sessionId,
      };
    } catch (error) {
      try {
        await this.activityLogService.logEvent({
          activityType: 'auth',
          action: 'google_login',
          targetType: 'auth',
          status: 'failure',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          requestId: context.requestId,
          source: context.source,
          metadata: {
            reason:
              error instanceof Error ? error.message : 'google_login_error',
          },
        });
      } catch (logError) {
        this.logger.error('Failed to log Google login failure event', logError);
      }
      this.logger.error('Google login error:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private normalizeRequestContext(
    requestContext: AuthRequestContext,
  ): Required<AuthRequestContext> {
    return {
      ipAddress: requestContext.ipAddress || 'unknown',
      userAgent: requestContext.userAgent || 'unknown',
      requestId: requestContext.requestId || '',
      source: requestContext.source || 'web_app',
    };
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
