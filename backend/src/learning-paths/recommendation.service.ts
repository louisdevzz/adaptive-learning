import { Injectable, Logger } from '@nestjs/common';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  db,
  studentKpProgress,
  knowledgePoint,
  kpPrerequisites,
  recommendationEvents,
} from '../../db';
import { createChatModel } from '../common/ai/chat-model.factory';

export interface Recommendation {
  kpId: string;
  kpTitle: string;
  type: 'review' | 'practice' | 'advance';
  priority: number; // 1 = highest
  reason: string;
}

interface KpWithProgress {
  kpId: string;
  kpTitle: string;
  masteryScore: number;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  /**
   * Generate recommendations for a student and persist them.
   */
  async generateRecommendations(studentId: string): Promise<Recommendation[]> {
    // Get all student KP progress
    const progressRows = await db
      .select({
        kpId: studentKpProgress.kpId,
        masteryScore: studentKpProgress.masteryScore,
        kpTitle: knowledgePoint.title,
      })
      .from(studentKpProgress)
      .innerJoin(knowledgePoint, eq(studentKpProgress.kpId, knowledgePoint.id))
      .where(eq(studentKpProgress.studentId, studentId));

    if (progressRows.length === 0) {
      return [];
    }

    const progressMap = new Map(
      progressRows.map((r) => [r.kpId, r]),
    );

    // Get prerequisite relationships for all KPs
    const kpIds = progressRows.map((r) => r.kpId);
    const prereqRows = await db
      .select({
        kpId: kpPrerequisites.kpId,
        prerequisiteKpId: kpPrerequisites.prerequisiteKpId,
      })
      .from(kpPrerequisites)
      .where(inArray(kpPrerequisites.kpId, kpIds));

    const recommendations: Recommendation[] = [];
    const weakKps = progressRows.filter((r) => r.masteryScore < 60);
    let prerequisiteGapFired = false;

    // Rule 1: Prerequisite gap (priority 1)
    for (const prereq of prereqRows) {
      const kpProgress = progressMap.get(prereq.kpId);
      const prereqProgress = progressMap.get(prereq.prerequisiteKpId);

      if (
        kpProgress &&
        kpProgress.masteryScore < 60 &&
        prereqProgress &&
        prereqProgress.masteryScore < 60
      ) {
        // Both KP and its prerequisite are weak → review prerequisite first
        if (!recommendations.some((r) => r.kpId === prereq.prerequisiteKpId)) {
          recommendations.push({
            kpId: prereq.prerequisiteKpId,
            kpTitle: prereqProgress.kpTitle,
            type: 'review',
            priority: 1,
            reason: `Prerequisite gap: "${prereqProgress.kpTitle}" needs review before "${kpProgress.kpTitle}"`,
          });
          prerequisiteGapFired = true;
        }
      }
    }

    // Rule 2: Review (priority 2) — mastery < 40
    for (const kp of progressRows) {
      if (
        kp.masteryScore < 40 &&
        !recommendations.some((r) => r.kpId === kp.kpId)
      ) {
        recommendations.push({
          kpId: kp.kpId,
          kpTitle: kp.kpTitle,
          type: 'review',
          priority: 2,
          reason: `Low mastery (${kp.masteryScore}%) requires review`,
        });
      }
    }

    // Rule 3: Practice (priority 3) — 40 <= mastery < 60
    for (const kp of progressRows) {
      if (
        kp.masteryScore >= 40 &&
        kp.masteryScore < 60 &&
        !recommendations.some((r) => r.kpId === kp.kpId)
      ) {
        recommendations.push({
          kpId: kp.kpId,
          kpTitle: kp.kpTitle,
          type: 'practice',
          priority: 3,
          reason: `Moderate mastery (${kp.masteryScore}%) needs practice`,
        });
      }
    }

    // Rule 4: Advance (priority 4) — mastery >= 85 and dependent not started
    // Find KPs that depend on mastered KPs but haven't been started
    const masteredKpIds = progressRows
      .filter((r) => r.masteryScore >= 85)
      .map((r) => r.kpId);

    if (masteredKpIds.length > 0) {
      // Find KPs that have mastered KPs as prerequisites
      const dependentRows = await db
        .select({
          kpId: kpPrerequisites.kpId,
          kpTitle: knowledgePoint.title,
        })
        .from(kpPrerequisites)
        .innerJoin(
          knowledgePoint,
          eq(kpPrerequisites.kpId, knowledgePoint.id),
        )
        .where(inArray(kpPrerequisites.prerequisiteKpId, masteredKpIds));

      for (const dep of dependentRows) {
        if (
          !progressMap.has(dep.kpId) &&
          !recommendations.some((r) => r.kpId === dep.kpId)
        ) {
          recommendations.push({
            kpId: dep.kpId,
            kpTitle: dep.kpTitle,
            type: 'advance',
            priority: 4,
            reason: `Ready to advance — prerequisite mastered`,
          });
        }
      }
    }

    // AI fallback: >= 3 weak KPs and no prerequisite gap rule fired
    if (weakKps.length >= 3 && !prerequisiteGapFired) {
      const aiRanked = await this.aiRankRecommendations(
        weakKps,
        recommendations,
      );
      if (aiRanked) {
        // Replace with AI-ranked top 5
        const aiRecommendations = aiRanked.slice(0, 5);
        // Merge: AI recommendations get priority boost
        for (const aiRec of aiRecommendations) {
          const existing = recommendations.find(
            (r) => r.kpId === aiRec.kpId,
          );
          if (existing) {
            existing.reason = aiRec.reason || existing.reason;
          }
        }
      }
    }

    // Sort by priority, take top recommendations
    recommendations.sort((a, b) => a.priority - b.priority);
    const topRecommendations = recommendations.slice(0, 10);

    // Persist to recommendation_events
    await this.persistRecommendations(studentId, topRecommendations);

    return topRecommendations;
  }

  /**
   * AI fallback: rank weak KPs by learning priority
   */
  private async aiRankRecommendations(
    weakKps: KpWithProgress[],
    existingRecs: Recommendation[],
  ): Promise<Recommendation[] | null> {
    try {
      const { chatModel } = createChatModel({ temperature: 0.2 });

      const kpList = weakKps
        .map(
          (kp) => `- ${kp.kpTitle} (kpId: ${kp.kpId}, mastery: ${kp.masteryScore}%)`,
        )
        .join('\n');

      const response = await chatModel.invoke([
        new SystemMessage(
          'You are a learning recommendation AI. ' +
            'Rank the following weak knowledge points by learning priority. ' +
            'Consider that foundational topics should come first. ' +
            'Return valid JSON array only.',
        ),
        new HumanMessage(
          `Rank these weak knowledge points by priority:\n${kpList}\n\n` +
            `Return JSON: [{"kpId":"...","reason":"brief reason"}]`,
        ),
      ]);

      const parsed = JSON.parse(response.content);
      if (!Array.isArray(parsed)) return null;

      return parsed.map((item: { kpId: string; reason?: string }, i: number) => {
        const kp = weakKps.find((w) => w.kpId === item.kpId);
        return {
          kpId: item.kpId,
          kpTitle: kp?.kpTitle || '',
          type: (kp?.masteryScore ?? 0) < 40 ? 'review' : 'practice',
          priority: i + 1,
          reason: item.reason || 'AI-prioritized for learning',
        } as Recommendation;
      });
    } catch (error) {
      this.logger.warn(
        'AI ranking failed, falling back to mastery-ascending sort:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return null;
    }
  }

  /**
   * Get recent recommendations for a student (used by learning path generation)
   */
  async getRecentRecommendations(
    studentId: string,
    limit = 10,
  ): Promise<
    { kpId: string | null; type: string; recommendedAt: Date }[]
  > {
    return db
      .select({
        kpId: recommendationEvents.kpId,
        type: recommendationEvents.recommendationType,
        recommendedAt: recommendationEvents.recommendedAt,
      })
      .from(recommendationEvents)
      .where(eq(recommendationEvents.studentId, studentId))
      .orderBy(desc(recommendationEvents.recommendedAt))
      .limit(limit);
  }

  private async persistRecommendations(
    studentId: string,
    recommendations: Recommendation[],
  ): Promise<void> {
    if (recommendations.length === 0) return;

    const values = recommendations.map((rec) => ({
      studentId,
      kpId: rec.kpId,
      recommendationType: rec.type,
      studentAction: 'ignored' as const,
      metadata: {
        priority: rec.priority,
        reason: rec.reason,
      },
    }));

    await db.insert(recommendationEvents).values(values);
  }
}
