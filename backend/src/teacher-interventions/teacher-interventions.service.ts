import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import {
  db,
  recommendationEvents,
  recommendationOverrides,
  studentInsights,
  studentLearningProfiles,
  students,
  teacherInterventions,
  users,
} from '../../db';
import { LearningProfileService } from '../learning-profile/learning-profile.service';
import { ClassAnalyticsService } from './class-analytics.service';
import { CreateTeacherInterventionDto } from './dto/create-teacher-intervention.dto';
import { RecommendationOverrideDto } from './dto/recommendation-override.dto';
import { UpdateTeacherInterventionDto } from './dto/update-teacher-intervention.dto';
import { InterventionAiService } from './intervention-ai.service';

@Injectable()
export class TeacherInterventionsService {
  constructor(
    private readonly classAnalyticsService: ClassAnalyticsService,
    private readonly interventionAiService: InterventionAiService,
    private readonly learningProfileService: LearningProfileService,
  ) {}

  async getClassOverview(teacherId: string, classId: string): Promise<any> {
    return this.classAnalyticsService.getClassOverview(teacherId, classId);
  }

  async getStudentDetail(teacherId: string, studentId: string): Promise<any> {
    await this.learningProfileService.assertTeacherCanAccessStudent(
      teacherId,
      studentId,
    );

    const [student] = await db
      .select({
        id: students.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(students)
      .innerJoin(users, eq(students.id, users.id))
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [insight] = await db
      .select({
        strengths: studentInsights.strengths,
        weaknesses: studentInsights.weaknesses,
        riskKps: studentInsights.riskKps,
        learningPattern: studentInsights.learningPattern,
        engagementScore: studentInsights.engagementScore,
        updatedAt: studentInsights.updatedAt,
      })
      .from(studentInsights)
      .where(eq(studentInsights.studentId, studentId))
      .orderBy(desc(studentInsights.updatedAt))
      .limit(1);

    const [profile] = await db
      .select({
        pacePreference: studentLearningProfiles.pacePreference,
        visualScore: studentLearningProfiles.visualScore,
        auditoryScore: studentLearningProfiles.auditoryScore,
        readingScore: studentLearningProfiles.readingScore,
        kinestheticScore: studentLearningProfiles.kinestheticScore,
      })
      .from(studentLearningProfiles)
      .where(eq(studentLearningProfiles.studentId, studentId))
      .limit(1);

    const interventions = await db
      .select()
      .from(teacherInterventions)
      .where(eq(teacherInterventions.studentId, studentId))
      .orderBy(desc(teacherInterventions.createdAt))
      .limit(20);

    return {
      student,
      insight: insight || null,
      profile: profile || null,
      interventions,
    };
  }

  async getStudentSuggestions(
    teacherId: string,
    studentId: string,
  ): Promise<any> {
    return this.interventionAiService.getSuggestions(teacherId, studentId);
  }

  async createIntervention(
    teacherId: string,
    payload: CreateTeacherInterventionDto,
  ): Promise<any> {
    await this.learningProfileService.assertTeacherCanAccessStudent(
      teacherId,
      payload.studentId,
    );

    if (payload.classId) {
      await this.classAnalyticsService.assertTeacherCanAccessClass(
        teacherId,
        payload.classId,
      );
    }

    const [created] = await db
      .insert(teacherInterventions)
      .values({
        teacherId,
        studentId: payload.studentId,
        classId: payload.classId || null,
        type: payload.type,
        title: payload.title,
        description: payload.description,
        suggestedActions: payload.suggestedActions || [],
        status: payload.status || 'pending',
        priority: payload.priority || 'medium',
        relatedKpIds: payload.relatedKpIds || [],
        aiConfidence: payload.aiConfidence ?? null,
        teacherNotes: payload.teacherNotes || null,
      })
      .returning();

    return created;
  }

  async updateIntervention(
    teacherId: string,
    interventionId: string,
    payload: UpdateTeacherInterventionDto,
  ): Promise<any> {
    const [existing] = await db
      .select({ id: teacherInterventions.id, teacherId: teacherInterventions.teacherId })
      .from(teacherInterventions)
      .where(eq(teacherInterventions.id, interventionId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Intervention not found');
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own interventions');
    }

    const [updated] = await db
      .update(teacherInterventions)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(teacherInterventions.id, interventionId))
      .returning();

    return updated;
  }

  async createRecommendationOverride(
    teacherId: string,
    payload: RecommendationOverrideDto,
  ): Promise<any> {
    await this.learningProfileService.assertTeacherCanAccessStudent(
      teacherId,
      payload.studentId,
    );

    const [event] = await db
      .select({
        id: recommendationEvents.id,
        studentId: recommendationEvents.studentId,
        metadata: recommendationEvents.metadata,
      })
      .from(recommendationEvents)
      .where(eq(recommendationEvents.id, payload.recommendationEventId))
      .limit(1);

    if (!event || event.studentId !== payload.studentId) {
      throw new NotFoundException('Recommendation event not found for student');
    }

    const [createdOverride] = await db
      .insert(recommendationOverrides)
      .values({
        teacherId,
        studentId: payload.studentId,
        recommendationEventId: payload.recommendationEventId,
        action: payload.action,
        originalRecommendation: payload.originalRecommendation,
        modifiedRecommendation: payload.modifiedRecommendation || null,
        reason: payload.reason,
      })
      .returning();

    await db.insert(teacherInterventions).values({
      teacherId,
      studentId: payload.studentId,
      type: 'recommendation_override',
      title: 'Override gợi ý hệ thống',
      description: payload.reason,
      suggestedActions:
        payload.action === 'modified' && payload.modifiedRecommendation
          ? [payload.modifiedRecommendation]
          : [payload.originalRecommendation],
      status: 'completed',
      priority: 'medium',
      relatedKpIds: [],
      teacherNotes: `Action: ${payload.action}`,
    });

    return createdOverride;
  }
}
