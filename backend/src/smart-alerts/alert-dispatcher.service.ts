import { Injectable } from '@nestjs/common';
import { and, eq, gte, isNull, lte } from 'drizzle-orm';
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
}

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

    const inQuietHours = this.isInQuietHours(
      preference.quietHoursStart,
      preference.quietHoursEnd,
    );

    const shouldDigest =
      preference.digestFrequency !== 'realtime' || inQuietHours;

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
          isNull(notificationDigests.deliveredAt),
        ),
      )
      .limit(1);

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
        enabledTypes: {
          progress_alert: true,
          assignment_assigned: true,
          assignment_graded: true,
          progress_update: true,
          system: true,
        },
        digestFrequency: 'realtime',
      })
      .returning();

    return created;
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
