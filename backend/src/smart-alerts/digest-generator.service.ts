import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { and, eq, inArray, isNull, lte } from 'drizzle-orm';
import { db, notificationDigests, notifications } from '../../db';
import { createChatModel } from '../common/ai/chat-model.factory';
import { AlertDispatcherService } from './alert-dispatcher.service';

@Injectable()
export class DigestGeneratorService {
  private readonly logger = new Logger(DigestGeneratorService.name);

  constructor(private readonly alertDispatcher: AlertDispatcherService) {}

  @Cron('0 7 * * *')
  async generateDailyDigests() {
    await this.generateDigestsByType('daily');
  }

  @Cron('0 7 * * 1')
  async generateWeeklyDigests() {
    await this.generateDigestsByType('weekly');
  }

  async generateDigestsByType(type: 'daily' | 'weekly') {
    const now = new Date();

    const pendingDigests = await db
      .select()
      .from(notificationDigests)
      .where(
        and(
          eq(notificationDigests.digestType, type),
          isNull(notificationDigests.deliveredAt),
          lte(notificationDigests.periodEnd, now),
        ),
      );

    for (const digest of pendingDigests) {
      try {
        await this.processDigest(digest.id);
      } catch (error) {
        this.logger.error(
          `Failed to process digest ${digest.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  async processDigest(digestId: string) {
    const [digest] = await db
      .select()
      .from(notificationDigests)
      .where(eq(notificationDigests.id, digestId))
      .limit(1);

    if (!digest) return;

    const ids = Array.isArray(digest.notificationIds)
      ? digest.notificationIds.map((item) => String(item))
      : [];

    const digestNotifications =
      ids.length > 0
        ? await db
            .select({
              id: notifications.id,
              type: notifications.type,
              title: notifications.title,
              message: notifications.message,
            })
            .from(notifications)
            .where(inArray(notifications.id, ids))
        : [];

    const aiSummary = await this.buildDigestSummary(
      digest.digestType,
      digestNotifications,
    );

    await db
      .update(notificationDigests)
      .set({
        aiSummary,
        deliveredAt: new Date(),
      })
      .where(eq(notificationDigests.id, digest.id));

    await this.alertDispatcher.dispatchOne({
      recipientId: digest.userId,
      type: 'digest_ready',
      title:
        digest.digestType === 'weekly'
          ? 'Bản tin tuần đã sẵn sàng'
          : 'Bản tin ngày đã sẵn sàng',
      message: aiSummary,
      actionUrl: '/dashboard/notifications',
      metadata: {
        digestId: digest.id,
        digestType: digest.digestType,
      },
    });
  }

  private async buildDigestSummary(
    digestType: string,
    items: Array<{ type: string; title: string; message: string }>,
  ) {
    if (items.length === 0) {
      return 'Hiện chưa có thông báo mới trong kỳ này.';
    }

    try {
      const { chatModel } = createChatModel({ temperature: 0.2 });
      const response = await chatModel.invoke([
        {
          role: 'system',
          content:
            'Bạn là trợ lý thông báo học tập. Tóm tắt ngắn bằng tiếng Việt, tối đa 3 câu, rõ ràng cho người dùng.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            digestType,
            total: items.length,
            items,
          }),
        },
      ]);

      const raw =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      if (raw.trim().length > 0) {
        return raw.trim();
      }
    } catch (error) {
      this.logger.warn(
        `Failed to generate AI digest summary: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    return `Bạn có ${items.length} thông báo mới trong ${
      digestType === 'weekly' ? 'tuần' : 'ngày'
    } qua.`;
  }
}
