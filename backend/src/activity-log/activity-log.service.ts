import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { activityLog, db, studentSession, users } from '../../db';

interface CreateStudentSessionInput {
  ipAddress?: string;
  userAgent?: string;
  sessionType?: string;
}

interface LogEventInput {
  actorUserId?: string;
  actorRole?: string;
  studentId?: string;
  sessionId?: string;
  activityType: string;
  action: string;
  targetType: string;
  targetId?: string;
  source?: string;
  status?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityLogService {
  private isUuid(value?: string): value is string {
    if (!value) {
      return false;
    }

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private normalizeSessionId(sessionId?: string): string | undefined {
    return this.isUuid(sessionId) ? sessionId : undefined;
  }

  async logEvent(input: LogEventInput) {
    const sessionId = this.normalizeSessionId(input.sessionId);

    await db.insert(activityLog).values({
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      studentId: input.studentId,
      sessionId,
      activityType: input.activityType,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      source: input.source || 'web_app',
      status: input.status || 'success',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      requestId: input.requestId,
      metadata: input.metadata || {},
    });
  }

  async createStudentSession(
    studentId: string,
    input: CreateStudentSessionInput = {},
  ): Promise<string> {
    const [session] = await db
      .insert(studentSession)
      .values({
        studentId,
        deviceInfo: input.userAgent || 'unknown',
        ipAddress: input.ipAddress || 'unknown',
        sessionType: input.sessionType || 'login',
      })
      .returning({
        id: studentSession.id,
      });

    return session.id;
  }

  async closeStudentSession(sessionId: string): Promise<void> {
    const normalizedSessionId = this.normalizeSessionId(sessionId);
    if (!normalizedSessionId) {
      return;
    }

    await db
      .update(studentSession)
      .set({ endTime: new Date() })
      .where(
        and(
          eq(studentSession.id, normalizedSessionId),
          isNull(studentSession.endTime),
        ),
      );
  }

  async closeLatestOpenStudentSession(
    studentId: string,
  ): Promise<string | null> {
    const [openSession] = await db
      .select({ id: studentSession.id })
      .from(studentSession)
      .where(
        and(
          eq(studentSession.studentId, studentId),
          isNull(studentSession.endTime),
        ),
      )
      .orderBy(desc(studentSession.startTime))
      .limit(1);

    if (!openSession) {
      return null;
    }

    await this.closeStudentSession(openSession.id);
    return openSession.id;
  }

  async getLoginHistory(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    items: Array<{
      id: string;
      action: string;
      status: string;
      ipAddress: string | null;
      userAgent: string | null;
      source: string;
      createdAt: Date;
      metadata: unknown;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const whereCondition = and(
      eq(activityLog.actorUserId, userId),
      eq(activityLog.activityType, 'auth'),
      inArray(activityLog.action, ['login', 'google_login', 'logout']),
    );

    const [totalResult] = await db
      .select({ total: count() })
      .from(activityLog)
      .where(whereCondition);

    const offset = (page - 1) * limit;
    const items = await db
      .select({
        id: activityLog.id,
        action: activityLog.action,
        status: activityLog.status,
        ipAddress: activityLog.ipAddress,
        userAgent: activityLog.userAgent,
        source: activityLog.source,
        createdAt: activityLog.createdAt,
        metadata: activityLog.metadata,
      })
      .from(activityLog)
      .where(whereCondition)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalResult?.total || 0;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async getRecentActivities(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    items: Array<{
      id: string;
      activityType: string;
      action: string;
      targetType: string;
      targetId: string | null;
      actorRole: string | null;
      status: string;
      source: string;
      ipAddress: string | null;
      createdAt: Date;
      metadata: unknown;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const whereCondition = eq(activityLog.actorUserId, userId);

    const [totalResult] = await db
      .select({ total: count() })
      .from(activityLog)
      .where(whereCondition);

    const offset = (page - 1) * limit;
    const items = await db
      .select({
        id: activityLog.id,
        activityType: activityLog.activityType,
        action: activityLog.action,
        targetType: activityLog.targetType,
        targetId: activityLog.targetId,
        actorRole: activityLog.actorRole,
        status: activityLog.status,
        source: activityLog.source,
        ipAddress: activityLog.ipAddress,
        createdAt: activityLog.createdAt,
        metadata: activityLog.metadata,
      })
      .from(activityLog)
      .where(whereCondition)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalResult?.total || 0;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async getGlobalRecentActivities(
    page: number,
    limit: number,
  ): Promise<{
    items: Array<{
      id: string;
      actorUserId: string | null;
      actorName: string | null;
      actorEmail: string | null;
      activityType: string;
      action: string;
      targetType: string;
      targetId: string | null;
      actorRole: string | null;
      status: string;
      source: string;
      ipAddress: string | null;
      createdAt: Date;
      metadata: unknown;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const whereCondition = sql`${activityLog.action} not like 'view%'`;

    const [totalResult] = await db
      .select({ total: count() })
      .from(activityLog)
      .where(whereCondition);

    const offset = (page - 1) * limit;
    const items = await db
      .select({
        id: activityLog.id,
        actorUserId: activityLog.actorUserId,
        actorName: users.fullName,
        actorEmail: users.email,
        activityType: activityLog.activityType,
        action: activityLog.action,
        targetType: activityLog.targetType,
        targetId: activityLog.targetId,
        actorRole: activityLog.actorRole,
        status: activityLog.status,
        source: activityLog.source,
        ipAddress: activityLog.ipAddress,
        createdAt: activityLog.createdAt,
        metadata: activityLog.metadata,
      })
      .from(activityLog)
      .where(whereCondition)
      .leftJoin(users, eq(activityLog.actorUserId, users.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalResult?.total || 0;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }
}
