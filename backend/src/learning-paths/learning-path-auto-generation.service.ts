import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { eq, and, lt, inArray, count, avg } from 'drizzle-orm';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  db,
  learningPath,
  learningPathItems,
  students,
  studentKpProgress,
  knowledgePoint,
  sections,
  sectionKpMap,
  modules,
  courses,
  classEnrollment,
} from '../../db';
import { PrerequisiteService } from './prerequisite.service';
import { RecommendationService } from './recommendation.service';
import { createChatModel } from '../common/ai/chat-model.factory';

interface WeakArea {
  kpId: string;
  masteryScore: number;
  title: string;
  courseId?: string;
  courseName?: string;
}

interface LearningPathItemInput {
  itemType: 'kp' | 'section' | 'assignment';
  itemId: string;
  orderIndex: number;
  status: 'not_started' | 'in_progress' | 'completed';
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LearningPathAutoGenerationService {
  private readonly logger = new Logger(LearningPathAutoGenerationService.name);
  private readonly MASTERY_THRESHOLD = 60;
  private readonly MAX_ITEMS_PER_PATH = 15;

  private isRunning = false;
  private readonly processingStudents = new Set<string>();

  constructor(
    private readonly prerequisiteService: PrerequisiteService,
    private readonly recommendationService: RecommendationService,
  ) {}

  /**
   * Scheduled job: Auto-generate/update learning paths for all active students every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoGeneratePathsForAllStudents() {
    if (this.isRunning) {
      this.logger.warn(
        'Previous scheduled run is still in progress, skipping...',
      );
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting scheduled learning path auto-generation...');

    try {
      const activeStudents = await this.getActiveStudents();
      this.logger.log(
        `Found ${activeStudents.length} active students to process`,
      );

      let successCount = 0;
      let errorCount = 0;

      for (const student of activeStudents) {
        try {
          await this.analyzeAndUpdatePath(student.id);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to process learning path for student ${student.id}:`,
            error instanceof Error ? error.message : 'Unknown error',
          );
          errorCount++;
        }
      }

      this.logger.log(
        `Scheduled learning path generation completed. Success: ${successCount}, Errors: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error(
        'Critical error in scheduled learning path generation:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Real-time trigger: Called when student progress is updated
   */
  @OnEvent('progress.updated')
  async handleProgressUpdate(payload: {
    studentId: string;
    kpId: string;
    newMasteryScore: number;
    oldMasteryScore?: number;
  }) {
    const { studentId, kpId, newMasteryScore, oldMasteryScore } = payload;
    this.logger.debug(
      `Progress update received for student ${studentId}, KP ${kpId}`,
    );

    try {
      // Check if this is a significant change that warrants path update
      const shouldUpdate = await this.shouldUpdatePath(
        studentId,
        kpId,
        newMasteryScore,
        oldMasteryScore,
      );

      if (shouldUpdate) {
        this.logger.log(
          `Significant progress change detected for student ${studentId}, updating path...`,
        );
        await this.analyzeAndUpdatePath(studentId);
      }
    } catch (error) {
      this.logger.error(
        `Error handling progress update for student ${studentId}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Analyze student performance and update/create learning path
   */
  async analyzeAndUpdatePath(studentId: string): Promise<void> {
    if (this.processingStudents.has(studentId)) {
      this.logger.debug(
        `Skipping path generation for student ${studentId} - already in progress`,
      );
      return;
    }

    this.processingStudents.add(studentId);
    try {
      // 1. Generate recommendations (also persists to recommendation_events)
      const recommendations =
        await this.recommendationService.generateRecommendations(studentId);

      // 2. Identify weak areas
      const weakAreas = await this.identifyWeakAreas(studentId);

      if (weakAreas.length === 0 && recommendations.length === 0) {
        this.logger.debug(
          `Student ${studentId} has no weak areas, skipping path generation`,
        );
        return;
      }

      this.logger.log(
        `Student ${studentId} has ${weakAreas.length} weak areas and ${recommendations.length} recommendations`,
      );

      // 3. Merge weak areas with recommendation-prioritized KPs
      const recommendedKpIds = recommendations.map((r) => r.kpId);
      const weakKpIds = weakAreas.map((wa) => wa.kpId);

      // Prioritize recommended KPs, then fill with remaining weak areas
      const orderedKpIds = [
        ...recommendedKpIds,
        ...weakKpIds.filter((id) => !recommendedKpIds.includes(id)),
      ];

      // 4. Expand with prerequisites
      const expandedKpIds =
        await this.prerequisiteService.expandWithPrerequisites(orderedKpIds);

      // 5. Limit to max items
      const limitedKpIds = expandedKpIds.slice(0, this.MAX_ITEMS_PER_PATH);

      // 6. Generate item reasons with AI
      const kpTitles = await this.getKpTitles(limitedKpIds);
      const itemReasons = await this.generateItemReasons(
        limitedKpIds,
        kpTitles,
        recommendations,
      );

      // 7. Get or create learning path
      const existingPath = await this.getActivePath(studentId);

      if (existingPath) {
        const currentItems = await this.getPathItems(existingPath.id);
        const needsUpdate = this.detectSignificantChanges(
          currentItems,
          limitedKpIds,
        );

        if (needsUpdate) {
          this.logger.log(
            `Updating existing learning path for student ${studentId}`,
          );
          await this.updateExistingPath(
            existingPath.id,
            studentId,
            limitedKpIds,
            itemReasons,
          );
        } else {
          this.logger.debug(
            `No significant changes needed for student ${studentId}`,
          );
        }
      } else {
        this.logger.log(`Creating new learning path for student ${studentId}`);
        await this.createNewPath(studentId, limitedKpIds, itemReasons);
      }
    } finally {
      this.processingStudents.delete(studentId);
    }
  }

  /**
   * Identify weak areas for a student (mastery < threshold)
   */
  private async identifyWeakAreas(studentId: string): Promise<WeakArea[]> {
    // Get all KPs the student has attempted with mastery < threshold
    const weakProgress = await db
      .select({
        kpId: studentKpProgress.kpId,
        masteryScore: studentKpProgress.masteryScore,
        kpTitle: knowledgePoint.title,
      })
      .from(studentKpProgress)
      .innerJoin(knowledgePoint, eq(studentKpProgress.kpId, knowledgePoint.id))
      .where(
        and(
          eq(studentKpProgress.studentId, studentId),
          lt(studentKpProgress.masteryScore, this.MASTERY_THRESHOLD),
        ),
      );

    // Sort by mastery score (lowest first - most urgent)
    return weakProgress
      .map((wp) => ({
        kpId: wp.kpId,
        masteryScore: wp.masteryScore,
        title: wp.kpTitle,
      }))
      .sort((a, b) => a.masteryScore - b.masteryScore);
  }

  /**
   * Get active learning path for a student
   */
  private async getActivePath(studentId: string) {
    const result = await db
      .select()
      .from(learningPath)
      .where(
        and(
          eq(learningPath.studentId, studentId),
          eq(learningPath.status, 'active'),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get items in a learning path
   */
  private async getPathItems(pathId: string) {
    return await db
      .select({
        itemId: learningPathItems.itemId,
        itemType: learningPathItems.itemType,
        status: learningPathItems.status,
      })
      .from(learningPathItems)
      .where(eq(learningPathItems.learningPathId, pathId));
  }

  /**
   * Check if learning path needs update based on changes
   */
  private detectSignificantChanges(
    currentItems: { itemId: string; itemType: string; status: string }[],
    newKpIds: string[],
  ): boolean {
    // Filter only KP items
    const currentKpItems = currentItems.filter(
      (item) => item.itemType === 'kp',
    );

    // Check if there are significant differences
    const currentKpIds = currentKpItems.map((item) => item.itemId);

    // Calculate Jaccard similarity
    const intersection = currentKpIds.filter((id) => newKpIds.includes(id));
    const union = [...new Set([...currentKpIds, ...newKpIds])];
    const similarity = intersection.length / union.length;

    // If similarity < 0.7 (70%), consider it significant change
    return similarity < 0.7;
  }

  /**
   * Check if a single progress update should trigger path update
   */
  private async shouldUpdatePath(
    studentId: string,
    kpId: string,
    newMasteryScore: number,
    oldMasteryScore?: number,
  ): Promise<boolean> {
    // If we know the previous score, only auto-update on threshold crossings
    if (oldMasteryScore !== undefined) {
      const wasBelowThreshold = oldMasteryScore < this.MASTERY_THRESHOLD;
      const isBelowThreshold = newMasteryScore < this.MASTERY_THRESHOLD;

      // Trigger update if the score crossed the 60% threshold in either direction
      // (below→above means KP is now mastered; above→below means it regressed)
      if (wasBelowThreshold !== isBelowThreshold) {
        return true;
      }
    }

    // No threshold crossing (or no previous score): check if this KP is in the current path
    const existingPath = await this.getActivePath(studentId);
    if (!existingPath) {
      return true; // No path exists, create one
    }

    const currentItems = await this.getPathItems(existingPath.id);
    const isInPath = currentItems.some(
      (item) => item.itemType === 'kp' && item.itemId === kpId,
    );

    return isInPath;
  }

  /**
   * Create new learning path for a student
   */
  private async createNewPath(
    studentId: string,
    kpIds: string[],
    itemReasons?: Map<string, string>,
  ): Promise<void> {
    const items: LearningPathItemInput[] = kpIds.map((kpId, index) => ({
      itemType: 'kp',
      itemId: kpId,
      orderIndex: index,
      status: 'not_started',
      metadata: { reason: itemReasons?.get(kpId) || null },
    }));

    // Generate AI-powered title and description
    const title = await this.generatePathTitle(studentId, kpIds);
    const description = await this.generatePathDescription(studentId, kpIds);

    await db.transaction(async (tx) => {
      const [path] = await tx
        .insert(learningPath)
        .values({
          studentId,
          createdBy: 'system',
          title,
          description,
          status: 'active',
        })
        .returning();

      if (items.length > 0) {
        await tx.insert(learningPathItems).values(
          items.map((item) => ({
            learningPathId: path.id,
            itemType: item.itemType,
            itemId: item.itemId,
            orderIndex: item.orderIndex,
            status: item.status,
            metadata: item.metadata,
          })),
        );
      }
    });

    this.logger.log(
      `Created new learning path for student ${studentId} with ${items.length} items`,
    );
  }

  /**
   * Update existing learning path
   */
  private async updateExistingPath(
    pathId: string,
    studentId: string,
    kpIds: string[],
    itemReasons?: Map<string, string>,
  ): Promise<void> {
    const existingItems = await this.getPathItems(pathId);

    const newItems: LearningPathItemInput[] = kpIds.map((kpId, index) => {
      const existingItem = existingItems.find(
        (item) => item.itemType === 'kp' && item.itemId === kpId,
      );

      return {
        itemType: 'kp',
        itemId: kpId,
        orderIndex: index,
        status:
          (existingItem?.status as LearningPathItemInput['status']) ||
          'not_started',
        metadata: { reason: itemReasons?.get(kpId) || null },
      };
    });

    const title = await this.generatePathTitle(studentId, kpIds);
    const description = await this.generatePathDescription(studentId, kpIds);

    await db.transaction(async (tx) => {
      await tx
        .update(learningPath)
        .set({
          title,
          description,
          updatedAt: new Date(),
        })
        .where(eq(learningPath.id, pathId));

      await tx
        .delete(learningPathItems)
        .where(eq(learningPathItems.learningPathId, pathId));

      if (newItems.length > 0) {
        await tx.insert(learningPathItems).values(
          newItems.map((item) => ({
            learningPathId: pathId,
            itemType: item.itemType,
            itemId: item.itemId,
            orderIndex: item.orderIndex,
            status: item.status,
            metadata: item.metadata,
          })),
        );
      }
    });

    this.logger.log(
      `Updated learning path ${pathId} for student ${studentId} with ${newItems.length} items`,
    );
  }

  /**
   * Generate an AI-powered title for the learning path
   */
  private async generatePathTitle(
    studentId: string,
    kpIds: string[],
  ): Promise<string> {
    if (kpIds.length === 0) {
      return 'Lộ trình học tập cá nhân hóa';
    }

    // Get course info for context
    const courseInfo = await this.getCourseInfoForKps(kpIds.slice(0, 3));
    const subjects = [...new Set(courseInfo.map((c) => c.subject))];
    const kpTitles = await this.getKpTitles(kpIds);
    const titleList = kpIds
      .slice(0, 5)
      .map((id) => kpTitles.get(id) || id)
      .join(', ');

    try {
      const { chatModel } = createChatModel({ temperature: 0.7 });
      const response = await chatModel.invoke([
        new SystemMessage(
          'You generate concise Vietnamese learning path titles (max 60 chars). ' +
            'Return only the title, no quotes or explanation.',
        ),
        new HumanMessage(
          `Create a learning path title for a student studying: ${titleList}` +
            (subjects.length > 0 ? `\nSubjects: ${subjects.join(', ')}` : '') +
            `\nNumber of items: ${kpIds.length}`,
        ),
      ]);

      const title = response.content.trim();
      if (title.length > 0 && title.length <= 100) {
        return title;
      }
    } catch (error) {
      this.logger.warn(
        'AI title generation failed, using fallback:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Fallback
    if (subjects.length === 1) {
      return `Ôn tập ${subjects[0]} - Lộ trình tự động`;
    }
    return 'Lộ trình cải thiện kiến thức';
  }

  /**
   * Generate an AI-powered description for the learning path
   */
  private async generatePathDescription(
    studentId: string,
    kpIds: string[],
  ): Promise<string> {
    if (kpIds.length === 0) {
      return 'Lộ trình học tập được tạo tự động dựa trên phân tích AI';
    }

    const weakAreas = await db
      .select({
        count: count(),
        avgMastery: avg(studentKpProgress.masteryScore),
      })
      .from(studentKpProgress)
      .where(
        and(
          eq(studentKpProgress.studentId, studentId),
          inArray(studentKpProgress.kpId, kpIds),
        ),
      );

    const avgMastery = Math.round(Number(weakAreas[0]?.avgMastery || 0));
    const kpTitles = await this.getKpTitles(kpIds);
    const titleList = kpIds
      .slice(0, 5)
      .map((id) => kpTitles.get(id) || id)
      .join(', ');

    try {
      const { chatModel } = createChatModel({ temperature: 0.7 });
      const response = await chatModel.invoke([
        new SystemMessage(
          'You generate concise Vietnamese learning path descriptions (2-3 sentences). ' +
            'Include the number of items and current mastery level. ' +
            'Return only the description, no quotes.',
        ),
        new HumanMessage(
          `Create a description for a learning path:\n` +
            `Topics: ${titleList}\n` +
            `Total items: ${kpIds.length}\n` +
            `Current average mastery: ${avgMastery}%`,
        ),
      ]);

      const description = response.content.trim();
      if (description.length > 0 && description.length <= 500) {
        return description;
      }
    } catch (error) {
      this.logger.warn(
        'AI description generation failed, using fallback:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Fallback
    return (
      `Lộ trình tự động với ${kpIds.length} mục tiêu. ` +
      `Mức độ nắm vững hiện tại: ${avgMastery}%. ` +
      `Được tối ưu theo thứ tự kiến thức tiên quyết.`
    );
  }

  /**
   * Generate AI reasons for each item in the learning path (batch call)
   */
  private async generateItemReasons(
    kpIds: string[],
    kpTitles: Map<string, string>,
    recommendations: { kpId: string; reason: string }[],
  ): Promise<Map<string, string>> {
    const reasons = new Map<string, string>();

    // Pre-fill from recommendations
    for (const rec of recommendations) {
      if (kpIds.includes(rec.kpId)) {
        reasons.set(rec.kpId, rec.reason);
      }
    }

    // Fill remaining with AI
    const missingKpIds = kpIds.filter((id) => !reasons.has(id));
    if (missingKpIds.length === 0) return reasons;

    try {
      const { chatModel } = createChatModel({ temperature: 0.3 });

      const kpList = missingKpIds
        .map((id) => `- ${kpTitles.get(id) || id} (kpId: ${id})`)
        .join('\n');

      const response = await chatModel.invoke([
        new SystemMessage(
          'You generate brief Vietnamese reasons (1 sentence each) explaining ' +
            'why each knowledge point is included in a learning path. ' +
            'Return valid JSON only.',
        ),
        new HumanMessage(
          `Generate reasons for including these KPs in a learning path:\n${kpList}\n\n` +
            `Return JSON: {"<kpId>": "reason in Vietnamese", ...}`,
        ),
      ]);

      const parsed = JSON.parse(response.content);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const [kpId, reason] of Object.entries(parsed)) {
          if (typeof reason === 'string' && missingKpIds.includes(kpId)) {
            reasons.set(kpId, reason);
          }
        }
      }
    } catch (error) {
      this.logger.warn(
        'AI item reason generation failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    return reasons;
  }

  /**
   * Get KP titles for a list of IDs
   */
  private async getKpTitles(kpIds: string[]): Promise<Map<string, string>> {
    if (kpIds.length === 0) return new Map();

    const rows = await db
      .select({ id: knowledgePoint.id, title: knowledgePoint.title })
      .from(knowledgePoint)
      .where(inArray(knowledgePoint.id, kpIds));

    return new Map(rows.map((r) => [r.id, r.title]));
  }

  /**
   * Get course information for KPs
   */
  private async getCourseInfoForKps(kpIds: string[]) {
    if (kpIds.length === 0) return [];

    return await db
      .select({
        courseId: courses.id,
        subject: courses.subject,
      })
      .from(sectionKpMap)
      .innerJoin(sections, eq(sectionKpMap.sectionId, sections.id))
      .innerJoin(modules, eq(sections.moduleId, modules.id))
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .where(inArray(sectionKpMap.kpId, kpIds))
      .groupBy(courses.id, courses.subject);
  }

  /**
   * Get all active students (enrolled in at least one class)
   */
  private async getActiveStudents() {
    const enrolledStudents = await db
      .select({
        studentId: classEnrollment.studentId,
      })
      .from(classEnrollment)
      .where(eq(classEnrollment.status, 'active'))
      .groupBy(classEnrollment.studentId);

    return enrolledStudents.map((es) => ({ id: es.studentId }));
  }
}
