import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gt, inArray, lt, sql } from 'drizzle-orm';
import {
  db,
  externalResourceCache,
  knowledgePoint,
  kpResources,
  studentKpProgress,
  studentResourceInteractions,
} from '../../db';
import { LearningProfileService } from '../learning-profile/learning-profile.service';
import { StudentsService } from '../students/students.service';
import { RecordResourceInteractionDto } from './dto/record-resource-interaction.dto';
import { ExternalSearchService } from './external-search.service';
import {
  RankedResource,
  ResourceRankingService,
} from './resource-ranking.service';

@Injectable()
export class ResourceRecommendationsService {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly learningProfileService: LearningProfileService,
    private readonly externalSearchService: ExternalSearchService,
    private readonly resourceRankingService: ResourceRankingService,
  ) {}

  async getRecommendationsForKp(studentId: string, kpId: string) {
    const kp = await db
      .select({ id: knowledgePoint.id, title: knowledgePoint.title })
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, kpId))
      .limit(1);

    if (kp.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    const profile = await this.learningProfileService.getOrCreateProfile(studentId);

    const internalResources = await this.getInternalResources(kpId);
    const externalResources = await this.getExternalResources(kpId, kp[0].title, {
      dominantStyle: profile.dominantStyle,
    });

    const mergedResources = [...internalResources, ...externalResources];

    const effectivenessMap = await this.getEffectivenessStats(mergedResources.map((r) => r.id));

    const ranked = this.resourceRankingService
      .rankResources(mergedResources, {
        dominantStyle: profile.dominantStyle,
        pacePreference: this.normalizePacePreference(profile.pacePreference),
      }, effectivenessMap)
      .slice(0, 5);

    return {
      studentId,
      kpId,
      kpTitle: kp[0].title,
      profile: {
        dominantStyle: profile.dominantStyle,
        pacePreference: profile.pacePreference,
      },
      recommendations: ranked,
    };
  }

  async getSuggestedForWeakKps(studentId: string) {
    const weakKps = await db
      .select({
        kpId: studentKpProgress.kpId,
        kpTitle: knowledgePoint.title,
        masteryScore: studentKpProgress.masteryScore,
      })
      .from(studentKpProgress)
      .innerJoin(knowledgePoint, eq(studentKpProgress.kpId, knowledgePoint.id))
      .where(
        and(
          eq(studentKpProgress.studentId, studentId),
          lt(studentKpProgress.masteryScore, 60),
        ),
      )
      .orderBy(studentKpProgress.masteryScore)
      .limit(5);

    const recommendationsByKp = await Promise.all(
      weakKps.map(async (kp) => ({
        kpId: kp.kpId,
        kpTitle: kp.kpTitle,
        masteryScore: kp.masteryScore,
        recommendations: (await this.getRecommendationsForKp(studentId, kp.kpId))
          .recommendations,
      })),
    );

    return {
      studentId,
      suggested: recommendationsByKp,
    };
  }

  async recordInteraction(dto: RecordResourceInteractionDto) {
    const resource = await db
      .select({ id: externalResourceCache.id })
      .from(externalResourceCache)
      .where(eq(externalResourceCache.id, dto.resourceId))
      .limit(1);

    if (resource.length === 0) {
      throw new NotFoundException('Resource not found');
    }

    const [created] = await db
      .insert(studentResourceInteractions)
      .values({
        studentId: dto.studentId,
        resourceId: dto.resourceId,
        kpId: dto.kpId,
        action: dto.action,
        masteryBefore: dto.masteryBefore ?? null,
        masteryAfter: dto.masteryAfter ?? null,
      })
      .returning();

    return created;
  }

  async assertCanAccessStudentProfile(
    actor: { userId: string; role: string },
    studentId: string,
  ) {
    if (actor.role === 'student') {
      if (actor.userId !== studentId) {
        throw new ForbiddenException('Access denied');
      }
      return;
    }

    if (actor.role === 'parent') {
      await this.studentsService.assertParentCanAccessStudent(actor.userId, studentId);
      return;
    }

    if (actor.role === 'teacher') {
      await this.learningProfileService.assertTeacherCanAccessStudent(
        actor.userId,
        studentId,
      );
    }
  }

  private async getInternalResources(kpId: string): Promise<RankedResource[]> {
    const rows = await db
      .select({
        id: kpResources.id,
        kpId: kpResources.kpId,
        resourceType: kpResources.resourceType,
        url: kpResources.url,
        title: kpResources.title,
        source: sql<string>`'internal'`,
        language: sql<string>`'vi'`,
      })
      .from(kpResources)
      .where(eq(kpResources.kpId, kpId));

    return rows.map((row, index) => ({
      id: row.id,
      kpId: row.kpId,
      resourceType: this.safeResourceType(row.resourceType),
      url: row.url,
      title: row.title,
      source: row.source,
      language: row.language,
      relevanceScore: Math.max(65, 95 - index * 5),
      metadata: { source: 'internal' },
      learningStyleMatch: 0,
      historicalEffectiveness: 0,
      paceScore: 0,
      finalScore: 0,
    }));
  }

  private async getExternalResources(
    kpId: string,
    kpTitle: string,
    context: { dominantStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' },
  ): Promise<RankedResource[]> {
    const now = new Date();

    const cached = await db
      .select()
      .from(externalResourceCache)
      .where(
        and(
          eq(externalResourceCache.kpId, kpId),
          gt(externalResourceCache.expiresAt, now),
        ),
      );

    if (cached.length > 0) {
      return cached.map((item) => ({
        id: item.id,
        kpId: item.kpId,
        resourceType: this.safeResourceType(item.resourceType),
        url: item.url,
        title: item.title,
        source: item.source,
        language: item.language,
        relevanceScore: item.relevanceScore,
        metadata: (item.metadata || {}) as Record<string, unknown>,
        learningStyleMatch: 0,
        historicalEffectiveness: 0,
        paceScore: 0,
        finalScore: 0,
      }));
    }

    const fetched = await this.externalSearchService.searchExternalResources({
      kpTitle,
      dominantStyle: context.dominantStyle,
    });

    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const inserted = await db
      .insert(externalResourceCache)
      .values(
        fetched.map((item) => ({
          kpId,
          query: kpTitle,
          resourceType: item.resourceType,
          url: item.url,
          title: item.title,
          source: item.source,
          language: item.language,
          relevanceScore: item.relevanceScore,
          metadata: item.metadata,
          expiresAt: expiry,
        })),
      )
      .returning();

    return inserted.map((item) => ({
      id: item.id,
      kpId: item.kpId,
      resourceType: this.safeResourceType(item.resourceType),
      url: item.url,
      title: item.title,
      source: item.source,
      language: item.language,
      relevanceScore: item.relevanceScore,
      metadata: (item.metadata || {}) as Record<string, unknown>,
      learningStyleMatch: 0,
      historicalEffectiveness: 0,
      paceScore: 0,
      finalScore: 0,
    }));
  }

  private async getEffectivenessStats(resourceIds: string[]) {
    if (resourceIds.length === 0) {
      return new Map<string, { viewedCount: number; helpfulCount: number }>();
    }

    const rows = await db
      .select({
        resourceId: studentResourceInteractions.resourceId,
        viewedCount: sql<number>`SUM(CASE WHEN ${studentResourceInteractions.action} IN ('viewed', 'completed', 'helpful', 'not_helpful') THEN 1 ELSE 0 END)`,
        helpfulCount: sql<number>`SUM(CASE WHEN ${studentResourceInteractions.action} = 'helpful' THEN 1 ELSE 0 END)`,
      })
      .from(studentResourceInteractions)
      .where(inArray(studentResourceInteractions.resourceId, resourceIds))
      .groupBy(studentResourceInteractions.resourceId);

    return new Map(
      rows.map((row) => [
        row.resourceId,
        {
          viewedCount: Number(row.viewedCount || 0),
          helpfulCount: Number(row.helpfulCount || 0),
        },
      ]),
    );
  }

  private safeResourceType(type: string): RankedResource['resourceType'] {
    const allowed = ['video', 'article', 'interactive', 'quiz', 'other'];
    return allowed.includes(type)
      ? (type as RankedResource['resourceType'])
      : 'other';
  }

  private normalizePacePreference(
    value: string,
  ): 'slow' | 'moderate' | 'fast' {
    if (value === 'slow' || value === 'moderate' || value === 'fast') {
      return value;
    }

    return 'moderate';
  }
}
