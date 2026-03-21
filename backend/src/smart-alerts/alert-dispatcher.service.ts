import { Injectable } from '@nestjs/common';
import { and, eq, gte } from 'drizzle-orm';
import {
  db,
  notificationDigests,
  notificationPreferences,
  notifications,
} from '../../db';

export interface DispatchNotificationInput {
  recipientId: string;
  actorUserId?: string | null;
  relatedStudentId?: string | null;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
  forceRealtime?: boolean;
  dedupeWindowMinutes?: number;
}

export const DEFAULT_NOTIFICATION_TYPE_PREFERENCES: Record<string, boolean> = {
  progress_alert: true,
  child_progress_alert: true,
  progress_update: true,
  child_progress_update: true,
  assignment_assigned: true,
  child_assignment_assigned: true,
  assignment_graded: true,
  child_assignment_graded: true,
  study_inactivity: true,
  failure_streak: true,
  mastery_celebration: true,
  parent_risk_escalation: true,
  weekly_report_ready: true,
  teacher_outlier_detected: true,
  teacher_intervention_overdue: true,
  digest_ready: true,
  system: true,
};

@Injectable()
export class AlertDispatcherService {
  async dispatchMany(payloads: DispatchNotificationInput[]) {
    for (const payload of payloads) {
      await this.dispatchOne(payload);
    }
  }

  async dispatchOne(payload: DispatchNotificationInput) {
    const preference = await this.getOrCreatePreferences(payload.recipientId);

    const enabled =
      !payload.type ||
      (preference.enabledTypes as Record<string, boolean>)?.[payload.type] !==
        false;

    if (!enabled) {
      return { mode: 'disabled' as const };
    }

    if (payload.dedupeWindowMinutes && payload.dedupeWindowMinutes > 0) {
      const duplicate = await this.hasRecentDuplicate(payload);
      if (duplicate) {
        return { mode: 'suppressed' as const };
      }
    }

    const inQuietHours = this.isInQuietHours(
      preference.quietHoursStart,
      preference.quietHoursEnd,
    );

    const shouldDigest =
      !payload.forceRealtime &&
      payload.type !== 'digest_ready' &&
      (preference.digestFrequency !== 'realtime' || inQuietHours);

    const [createdNotification] = await db
      .insert(notifications)
      .values({
        recipientId: payload.recipientId,
        actorUserId: payload.actorUserId || null,
        relatedStudentId: payload.relatedStudentId || null,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        actionUrl: payload.actionUrl || null,
        metadata: payload.metadata ?? {},
      })
      .returning();

    if (!shouldDigest) {
      return { mode: 'realtime' as const, notification: createdNotification };
    }

    const digestType =
      preference.digestFrequency === 'weekly' ? 'weekly' : 'daily';
    const { periodStart, periodEnd } = this.getDigestPeriod(digestType);

    const [existingDigest] = await db
      .select()
      .from(notificationDigests)
      .where(
        and(
          eq(notificationDigests.userId, payload.recipientId),
          eq(notificationDigests.digestType, digestType),
          eq(notificationDigests.periodStart, periodStart),
          eq(notificationDigests.periodEnd, periodEnd),
        ),
      )
      .limit(1);

    if (existingDigest?.deliveredAt) {
      return { mode: 'realtime' as const, notification: createdNotification };
    }

    if (!existingDigest) {
      await db.insert(notificationDigests).values({
        userId: payload.recipientId,
        digestType,
        periodStart,
        periodEnd,
        notificationIds: [createdNotification.id],
      });

      return { mode: 'digest' as const, notification: createdNotification };
    }

    const currentIds = Array.isArray(existingDigest.notificationIds)
      ? existingDigest.notificationIds.map((item) => String(item))
      : [];

    if (currentIds.includes(createdNotification.id)) {
      return { mode: 'digest' as const, notification: createdNotification };
    }

    await db
      .update(notificationDigests)
      .set({
        notificationIds: [...currentIds, createdNotification.id],
      })
      .where(eq(notificationDigests.id, existingDigest.id));

    return { mode: 'digest' as const, notification: createdNotification };
  }

  async getOrCreatePreferences(userId: string) {
    const [existing] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [created] = await db
      .insert(notificationPreferences)
      .values({
        userId,
        enabledTypes: DEFAULT_NOTIFICATION_TYPE_PREFERENCES,
        digestFrequency: 'realtime',
      })
      .returning();

    return created;
  }

  private async hasRecentDuplicate(payload: DispatchNotificationInput) {
    const threshold = new Date(
      Date.now() - payload.dedupeWindowMinutes! * 60 * 1000,
    );

    const conditions = [
      eq(notifications.recipientId, payload.recipientId),
      eq(notifications.type, payload.type),
      gte(notifications.createdAt, threshold),
    ];

    if (payload.relatedStudentId) {
      conditions.push(eq(notifications.relatedStudentId, payload.relatedStudentId));
    }

    const [existing] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(...conditions))
      .limit(1);

    return Boolean(existing);
  }

  private isInQuietHours(start?: string | null, end?: string | null) {
    if (!start || !end) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  private getDigestPeriod(type: 'daily' | 'weekly') {
    const now = new Date();

    if (type === 'daily') {
      const periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);

      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 1);

      return { periodStart, periodEnd };
    }

    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);
    periodStart.setDate(now.getDate() + mondayOffset);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 7);

    return { periodStart, periodEnd };
  }
}
