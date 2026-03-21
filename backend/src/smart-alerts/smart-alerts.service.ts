import { BadRequestException, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { db, notificationDigests, notificationPreferences } from '../../db';
import {
  AlertDispatcherService,
  DEFAULT_NOTIFICATION_TYPE_PREFERENCES,
} from './alert-dispatcher.service';
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
    const normalizedEnabledTypes = this.normalizeEnabledTypes(
      payload.enabledTypes,
      existing.enabledTypes,
    );

    const [updated] = await db
      .update(notificationPreferences)
      .set({
        enabledTypes: normalizedEnabledTypes,
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
    const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1;
    const normalizedLimit = Number.isFinite(limit)
      ? Math.min(Math.max(limit, 1), 100)
      : 20;
    const offset = (normalizedPage - 1) * normalizedLimit;

    const items = await db
      .select()
      .from(notificationDigests)
      .where(eq(notificationDigests.userId, userId))
      .orderBy(desc(notificationDigests.createdAt))
      .limit(normalizedLimit)
      .offset(offset);

    const [count] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(notificationDigests)
      .where(eq(notificationDigests.userId, userId));

    const total = Number(count?.total || 0);

    return {
      items,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        totalPages: total > 0 ? Math.ceil(total / normalizedLimit) : 0,
      },
    };
  }

  private normalizeEnabledTypes(
    enabledTypesInput: Record<string, boolean> | undefined,
    existingTypesInput: unknown,
  ) {
    const existingTypes = this.coerceBooleanMap(
      existingTypesInput,
      DEFAULT_NOTIFICATION_TYPE_PREFERENCES,
    );

    if (enabledTypesInput === undefined) {
      return existingTypes;
    }

    const enabledTypes = this.coerceBooleanMap(enabledTypesInput, {});

    return {
      ...existingTypes,
      ...enabledTypes,
    };
  }

  private coerceBooleanMap(value: unknown, fallback: Record<string, boolean>) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return fallback;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    const result: Record<string, boolean> = {};

    for (const [key, mapValue] of entries) {
      if (typeof mapValue !== 'boolean') {
        throw new BadRequestException(
          `enabledTypes.${key} must be a boolean`,
        );
      }
      result[key] = mapValue;
    }

    return result;
  }
}
