import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db, notificationDigests, notificationPreferences } from '../../db';
import { AlertDispatcherService } from './alert-dispatcher.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Injectable()
export class SmartAlertsService {
  constructor(private readonly alertDispatcher: AlertDispatcherService) {}

  async getPreferences(userId: string) {
    return this.alertDispatcher.getOrCreatePreferences(userId);
  }

  async updatePreferences(
    userId: string,
    payload: UpdateNotificationPreferencesDto,
  ) {
    const existing = await this.alertDispatcher.getOrCreatePreferences(userId);

    const [updated] = await db
      .update(notificationPreferences)
      .set({
        enabledTypes: payload.enabledTypes ?? existing.enabledTypes,
        digestFrequency: payload.digestFrequency ?? existing.digestFrequency,
        quietHoursStart:
          payload.quietHoursStart !== undefined
            ? payload.quietHoursStart
            : existing.quietHoursStart,
        quietHoursEnd:
          payload.quietHoursEnd !== undefined
            ? payload.quietHoursEnd
            : existing.quietHoursEnd,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId))
      .returning();

    return updated;
  }

  async getDigests(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const items = await db
      .select()
      .from(notificationDigests)
      .where(eq(notificationDigests.userId, userId))
      .orderBy(desc(notificationDigests.createdAt))
      .limit(limit)
      .offset(offset);

    const [count] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(notificationDigests)
      .where(eq(notificationDigests.userId, userId));

    const total = Number(count?.total || 0);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }
}
