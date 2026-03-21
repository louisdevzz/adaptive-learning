import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eq } from 'drizzle-orm';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { db, knowledgePoint } from '../../db';
import { createChatModel } from '../common/ai/chat-model.factory';
import {
  LearningMemoryEntry,
  LearningProfileService,
} from './learning-profile.service';

interface ProgressUpdatedPayload {
  studentId: string;
  kpId: string;
  newMasteryScore: number;
  oldMasteryScore?: number;
}

@Injectable()
export class LearningProfileMemoryService {
  private readonly logger = new Logger(LearningProfileMemoryService.name);

  constructor(private readonly learningProfileService: LearningProfileService) {}

  @OnEvent('progress.updated')
  async handleProgressUpdated(payload: ProgressUpdatedPayload) {
    const { studentId, kpId, newMasteryScore, oldMasteryScore } = payload;

    const delta =
      oldMasteryScore === undefined ? undefined : newMasteryScore - oldMasteryScore;
    const crossedThreshold =
      oldMasteryScore !== undefined && oldMasteryScore < 80 && newMasteryScore >= 80;
    const significantDelta = delta !== undefined && Math.abs(delta) >= 15;

    let failureStreak = 0;
    if (!significantDelta && !crossedThreshold) {
      failureStreak = await this.learningProfileService.getRecentFailures(
        studentId,
        kpId,
      );
      if (failureStreak < 3) {
        return;
      }
    }

    const kpTitle = await this.getKpTitle(kpId);

    try {
      const content = await this.generateMemoryEntry({
        kpTitle,
        newMasteryScore,
        oldMasteryScore,
        failureStreak,
      });

      const entry: LearningMemoryEntry = {
        timestamp: new Date().toISOString(),
        type: failureStreak >= 3
          ? 'failure_streak'
          : crossedThreshold
            ? 'mastery_threshold'
            : 'mastery_delta',
        kpId,
        kpTitle,
        content,
        metadata: {
          newMasteryScore,
          oldMasteryScore,
          delta,
          failureStreak,
        },
      };

      await this.learningProfileService.appendLearningMemory(studentId, entry);
    } catch (error) {
      this.logger.error(
        `Failed to append learning memory for student ${studentId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async getKpTitle(kpId: string) {
    const kp = await db
      .select({ title: knowledgePoint.title })
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, kpId))
      .limit(1);

    return kp[0]?.title || 'Kiến thức đang học';
  }

  private async generateMemoryEntry(context: {
    kpTitle: string;
    newMasteryScore: number;
    oldMasteryScore?: number;
    failureStreak: number;
  }) {
    try {
      const { chatModel } = createChatModel({ temperature: 0.3 });
      const response = await chatModel.invoke([
        new SystemMessage(
          'Bạn là trợ lý học tập. Viết đúng 1-2 câu tiếng Việt ngắn gọn, thân thiện, tập trung vào hành động tiếp theo.',
        ),
        new HumanMessage(
          JSON.stringify({
            context,
            instruction:
              'Tạo một memory entry mô tả tiến triển học tập và gợi ý ngắn cho lần học tiếp theo.',
          }),
        ),
      ]);

      const content = String(response.content || '').trim();
      if (content.length > 0) {
        return content;
      }
    } catch (error) {
      this.logger.warn(
        `AI memory generation failed, using fallback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return this.buildFallbackEntry(context);
  }

  private buildFallbackEntry(context: {
    kpTitle: string;
    newMasteryScore: number;
    oldMasteryScore?: number;
    failureStreak: number;
  }) {
    const { kpTitle, newMasteryScore, oldMasteryScore, failureStreak } = context;

    if (failureStreak >= 3) {
      return `Em đang gặp khó ở phần ${kpTitle} với ${failureStreak} lần chưa đúng liên tiếp. Hãy tạm giảm tốc độ, xem lại ví dụ mẫu và làm lại từng bước nhỏ.`;
    }

    if (
      oldMasteryScore !== undefined &&
      oldMasteryScore < 80 &&
      newMasteryScore >= 80
    ) {
      return `Em đã vượt ngưỡng thành thạo ở phần ${kpTitle} (${newMasteryScore}%). Tiếp tục luyện 1-2 bài củng cố để giữ vững kết quả nhé.`;
    }

    const delta =
      oldMasteryScore === undefined ? 0 : newMasteryScore - oldMasteryScore;

    if (delta >= 15) {
      return `Tiến bộ rất tốt ở phần ${kpTitle} (tăng ${delta} điểm). Có thể chuyển sang bài nâng cao nhẹ để tăng độ tự tin.`;
    }

    return `Kết quả ở phần ${kpTitle} đang giảm ${Math.abs(delta)} điểm. Nên ôn lại khái niệm cốt lõi và thực hành thêm 2-3 câu cơ bản trước khi tiếp tục.`;
  }
}
