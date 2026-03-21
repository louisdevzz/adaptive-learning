import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import {
  classEnrollment,
  classes,
  db,
  learningStyleAssessments,
  questionAttempts,
  studentLearningProfiles,
  students,
  teacherClassMap,
} from '../../db';
import { SubmitVarkAssessmentDto } from './dto/submit-vark-assessment.dto';
import { UpdatePacePreferenceDto } from './dto/update-pace-preference.dto';
import {
  ProcessedVarkAssessment,
  VARK_ASSESSMENT_VERSION,
  VARK_QUESTIONS,
  processVarkAssessment,
} from './vark-assessment';

export interface LearningMemoryEntry {
  timestamp: string;
  type: 'mastery_delta' | 'mastery_threshold' | 'failure_streak';
  kpId: string;
  kpTitle: string;
  content: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LearningProfileService {
  async getAssessmentQuestions() {
    return {
      version: VARK_ASSESSMENT_VERSION,
      totalQuestions: VARK_QUESTIONS.length,
      questions: VARK_QUESTIONS,
    };
  }

  async getOrCreateProfile(studentId: string) {
    await this.ensureStudentExists(studentId);

    const existing = await db
      .select()
      .from(studentLearningProfiles)
      .where(eq(studentLearningProfiles.studentId, studentId))
      .limit(1);

    if (existing.length > 0) {
      return this.toProfileResponse(existing[0]);
    }

    const [created] = await db
      .insert(studentLearningProfiles)
      .values({
        studentId,
        learningMemory: [],
        profileSource: 'default',
      })
      .returning();

    return this.toProfileResponse(created);
  }

  async processAssessment(studentId: string, payload: SubmitVarkAssessmentDto) {
    if (!payload.answers || payload.answers.length === 0) {
      throw new BadRequestException('Answers are required');
    }

    const processed = processVarkAssessment(payload.answers);
    if (processed.totalAnswers === 0) {
      throw new BadRequestException('Assessment answers are invalid');
    }

    await this.ensureStudentExists(studentId);

    await db.insert(learningStyleAssessments).values({
      studentId,
      responses: payload.answers,
      computedScores: processed,
      version: VARK_ASSESSMENT_VERSION,
    });

    const profile = await this.getOrCreateProfile(studentId);

    const [updated] = await db
      .update(studentLearningProfiles)
      .set({
        visualScore: processed.scores.visual,
        auditoryScore: processed.scores.auditory,
        readingScore: processed.scores.reading,
        kinestheticScore: processed.scores.kinesthetic,
        profileSource: 'assessment',
        assessmentVersion: VARK_ASSESSMENT_VERSION,
        updatedAt: new Date(),
      })
      .where(eq(studentLearningProfiles.studentId, studentId))
      .returning();

    return {
      ...this.toProfileResponse(updated),
      assessment: processed,
      previousDominantStyle: profile.dominantStyle,
    };
  }

  async updatePacePreference(
    studentId: string,
    payload: UpdatePacePreferenceDto,
  ) {
    await this.ensureStudentExists(studentId);

    await this.getOrCreateProfile(studentId);

    const [updated] = await db
      .update(studentLearningProfiles)
      .set({
        pacePreference: payload.pacePreference,
        updatedAt: new Date(),
      })
      .where(eq(studentLearningProfiles.studentId, studentId))
      .returning();

    return this.toProfileResponse(updated);
  }

  async appendLearningMemory(studentId: string, entry: LearningMemoryEntry) {
    const profile = await this.getOrCreateProfile(studentId);

    const memory = Array.isArray(profile.learningMemory)
      ? [...profile.learningMemory, entry]
      : [entry];

    const trimmed = memory.slice(-50);

    const [updated] = await db
      .update(studentLearningProfiles)
      .set({
        learningMemory: trimmed,
        updatedAt: new Date(),
      })
      .where(eq(studentLearningProfiles.studentId, studentId))
      .returning();

    return this.toProfileResponse(updated);
  }

  async assertTeacherCanAccessStudent(teacherId: string, studentId: string) {
    const mapped = await db
      .select({ id: classEnrollment.id })
      .from(classEnrollment)
      .innerJoin(
        teacherClassMap,
        and(
          eq(classEnrollment.classId, teacherClassMap.classId),
          eq(teacherClassMap.teacherId, teacherId),
          eq(teacherClassMap.status, 'active'),
        ),
      )
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
        ),
      )
      .limit(1);

    if (mapped.length > 0) {
      return;
    }

    const homeroomMapped = await db
      .select({ id: classEnrollment.id })
      .from(classEnrollment)
      .innerJoin(classes, eq(classEnrollment.classId, classes.id))
      .where(
        and(
          eq(classEnrollment.studentId, studentId),
          eq(classEnrollment.status, 'active'),
          eq(classes.homeroomTeacherId, teacherId),
        ),
      )
      .limit(1);

    if (homeroomMapped.length === 0) {
      throw new ForbiddenException(
        'Teacher does not have access to this student',
      );
    }
  }

  async getRecentFailures(studentId: string, kpId: string): Promise<number> {
    const recentAttempts = await db
      .select({ isCorrect: questionAttempts.isCorrect })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          eq(questionAttempts.kpId, kpId),
        ),
      )
      .orderBy(desc(questionAttempts.attemptTime))
      .limit(5);

    let streak = 0;
    for (const attempt of recentAttempts) {
      if (attempt.isCorrect) {
        break;
      }
      streak += 1;
    }

    return streak;
  }

  private async ensureStudentExists(studentId: string) {
    const student = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (student.length === 0) {
      throw new NotFoundException('Student not found');
    }
  }

  private toProfileResponse(
    profile: typeof studentLearningProfiles.$inferSelect,
  ) {
    const assessment = {
      visual: profile.visualScore,
      auditory: profile.auditoryScore,
      reading: profile.readingScore,
      kinesthetic: profile.kinestheticScore,
    };

    const dominantStyle = this.getDominantStyle(assessment);

    return {
      id: profile.id,
      studentId: profile.studentId,
      visualScore: profile.visualScore,
      auditoryScore: profile.auditoryScore,
      readingScore: profile.readingScore,
      kinestheticScore: profile.kinestheticScore,
      pacePreference: profile.pacePreference,
      profileSource: profile.profileSource,
      assessmentVersion: profile.assessmentVersion,
      dominantStyle,
      learningMemory: Array.isArray(profile.learningMemory)
        ? profile.learningMemory
        : [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private getDominantStyle(scores: {
    visual: number;
    auditory: number;
    reading: number;
    kinesthetic: number;
  }) {
    const entries: Array<
      ['visual' | 'auditory' | 'reading' | 'kinesthetic', number]
    > = [
      ['visual', scores.visual],
      ['auditory', scores.auditory],
      ['reading', scores.reading],
      ['kinesthetic', scores.kinesthetic],
    ];

    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  computeForTesting(payload: SubmitVarkAssessmentDto): ProcessedVarkAssessment {
    return processVarkAssessment(payload.answers);
  }
}
