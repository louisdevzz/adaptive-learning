import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, and, lt, gte, inArray, sql, count, avg } from 'drizzle-orm';
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
  classCourses,
} from '../../db';
import { PrerequisiteService } from './prerequisite.service';

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
}

@Injectable()
export class LearningPathAutoGenerationService implements OnModuleInit {
  private readonly logger = new Logger(LearningPathAutoGenerationService.name);
  private readonly MASTERY_THRESHOLD = 60;
  private readonly MAX_ITEMS_PER_PATH = 15;
  private readonly SIGNIFICANT_CHANGE_THRESHOLD = 20; // Mastery change > 20% triggers update

  constructor(private readonly prerequisiteService: PrerequisiteService) {}

  onModuleInit() {
    this.logger.log('LearningPathAutoGenerationService initialized');
    this.logger.log('Auto-generation will run every hour');
  }

  /**
   * Scheduled job: Auto-generate/update learning paths for all active students every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoGeneratePathsForAllStudents() {
    this.logger.log('Starting scheduled learning path auto-generation...');
    
    try {
      const activeStudents = await this.getActiveStudents();
      this.logger.log(`Found ${activeStudents.length} active students to process`);
      
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
    }
  }

  /**
   * Real-time trigger: Called when student progress is updated
   */
  async handleProgressUpdate(studentId: string, kpId: string, newMasteryScore: number) {
    this.logger.debug(`Progress update received for student ${studentId}, KP ${kpId}`);
    
    try {
      // Check if this is a significant change that warrants path update
      const shouldUpdate = await this.shouldUpdatePath(studentId, kpId, newMasteryScore);
      
      if (shouldUpdate) {
        this.logger.log(`Significant progress change detected for student ${studentId}, updating path...`);
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
    // 1. Identify weak areas
    const weakAreas = await this.identifyWeakAreas(studentId);
    
    if (weakAreas.length === 0) {
      this.logger.debug(`Student ${studentId} has no weak areas, skipping path generation`);
      return;
    }
    
    this.logger.log(`Student ${studentId} has ${weakAreas.length} weak areas to address`);
    
    // 2. Expand with prerequisites
    const kpIds = weakAreas.map((wa) => wa.kpId);
    const expandedKpIds = await this.prerequisiteService.expandWithPrerequisites(kpIds);
    
    // 3. Limit to max items
    const limitedKpIds = expandedKpIds.slice(0, this.MAX_ITEMS_PER_PATH);
    
    // 4. Get or create learning path
    const existingPath = await this.getActivePath(studentId);
    
    if (existingPath) {
      // Check if significant changes are needed
      const currentItems = await this.getPathItems(existingPath.id);
      const needsUpdate = this.detectSignificantChanges(currentItems, limitedKpIds);
      
      if (needsUpdate) {
        this.logger.log(`Updating existing learning path for student ${studentId}`);
        await this.updateExistingPath(existingPath.id, studentId, limitedKpIds);
      } else {
        this.logger.debug(`No significant changes needed for student ${studentId}`);
      }
    } else {
      this.logger.log(`Creating new learning path for student ${studentId}`);
      await this.createNewPath(studentId, limitedKpIds);
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
    const currentKpItems = currentItems.filter((item) => item.itemType === 'kp');
    
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
  ): Promise<boolean> {
    // Always update if crossing the threshold
    if (newMasteryScore >= this.MASTERY_THRESHOLD) {
      return true;
    }
    
    // Update if newly below threshold
    if (newMasteryScore < this.MASTERY_THRESHOLD) {
      return true;
    }
    
    // Check if this KP is in the current path
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
  private async createNewPath(studentId: string, kpIds: string[]): Promise<void> {
    const items: LearningPathItemInput[] = kpIds.map((kpId, index) => ({
      itemType: 'kp',
      itemId: kpId,
      orderIndex: index,
      status: 'not_started',
    }));
    
    // Generate title and description
    const title = await this.generatePathTitle(studentId, kpIds);
    const description = await this.generatePathDescription(studentId, kpIds);
    
    await db.transaction(async (tx) => {
      // Create learning path
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
      
      // Create items
      if (items.length > 0) {
        await tx.insert(learningPathItems).values(
          items.map((item) => ({
            learningPathId: path.id,
            ...item,
          })),
        );
      }
    });
    
    this.logger.log(`Created new learning path for student ${studentId} with ${items.length} items`);
  }

  /**
   * Update existing learning path
   */
  private async updateExistingPath(
    pathId: string,
    studentId: string,
    kpIds: string[],
  ): Promise<void> {
    // Get existing items to preserve progress
    const existingItems = await this.getPathItems(pathId);
    
    // Build new items, preserving status for existing KPs
    const newItems: LearningPathItemInput[] = kpIds.map((kpId, index) => {
      const existingItem = existingItems.find(
        (item) => item.itemType === 'kp' && item.itemId === kpId,
      );
      
      return {
        itemType: 'kp',
        itemId: kpId,
        orderIndex: index,
        status: (existingItem?.status as any) || 'not_started',
      };
    });
    
    // Generate updated title and description
    const title = await this.generatePathTitle(studentId, kpIds);
    const description = await this.generatePathDescription(studentId, kpIds);
    
    await db.transaction(async (tx) => {
      // Update path metadata
      await tx
        .update(learningPath)
        .set({
          title,
          description,
          updatedAt: new Date(),
        })
        .where(eq(learningPath.id, pathId));
      
      // Delete old items
      await tx.delete(learningPathItems).where(eq(learningPathItems.learningPathId, pathId));
      
      // Insert new items
      if (newItems.length > 0) {
        await tx.insert(learningPathItems).values(
          newItems.map((item) => ({
            learningPathId: pathId,
            ...item,
          })),
        );
      }
    });
    
    this.logger.log(`Updated learning path ${pathId} for student ${studentId} with ${newItems.length} items`);
  }

  /**
   * Generate a descriptive title for the learning path
   */
  private async generatePathTitle(studentId: string, kpIds: string[]): Promise<string> {
    if (kpIds.length === 0) {
      return 'Lộ trình học tập cá nhân hóa';
    }
    
    // Get course info for the first few KPs
    const courseInfo = await this.getCourseInfoForKps(kpIds.slice(0, 3));
    
    if (courseInfo.length > 0) {
      const subjects = [...new Set(courseInfo.map((c) => c.subject))];
      if (subjects.length === 1) {
        return `Ôn tập ${subjects[0]} - Lộ trình tự động`;
      }
    }
    
    return 'Lộ trình cải thiện kiến thức';
  }

  /**
   * Generate a description for the learning path
   */
  private async generatePathDescription(studentId: string, kpIds: string[]): Promise<string> {
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
    
    return `Lộ trình tự động với ${kpIds.length} mục tiêu. ` +
           `Mức độ nắm vững hiện tại: ${avgMastery}%. ` +
           `Được tối ưu theo thứ tự kiến thức tiên quyết.`;
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
