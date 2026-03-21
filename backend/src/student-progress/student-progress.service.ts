import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, and, desc, sql, inArray, gte } from 'drizzle-orm';
import {
  db,
  studentKpProgress,
  studentKpHistory,
  studentMastery,
  studentInsights,
  students,
  knowledgePoint,
  questionAttempts,
  questionBank,
  questionMetadata,
  kpExercises,
  timeOnTask,
  sectionKpMap,
  modules,
  sections,
  courses,
} from '../../db';
import { UpdateKpProgressDto } from './dto/update-kp-progress.dto';
import { SubmitQuestionAttemptDto } from './dto/submit-question-attempt.dto';
import { SubmitContentQuestionDto } from './dto/submit-content-question.dto';
import { BktMasteryService } from './bkt-mastery.service';

@Injectable()
export class StudentProgressService {
  private readonly logger = new Logger(StudentProgressService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly bktMasteryService: BktMasteryService,
  ) {}

  // ==================== STUDENT KP PROGRESS ====================

  async updateKpProgress(updateDto: UpdateKpProgressDto) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, updateDto.studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Validate KP exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, updateDto.kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    return await db
      .transaction(async (tx) => {
        // Check if progress exists
        const existing = await tx
          .select()
          .from(studentKpProgress)
          .where(
            and(
              eq(studentKpProgress.studentId, updateDto.studentId),
              eq(studentKpProgress.kpId, updateDto.kpId),
            ),
          )
          .limit(1);

        let oldScore = 0;
        let progress;

        if (existing.length > 0) {
          oldScore = existing[0].masteryScore;

          // Update existing progress
          [progress] = await tx
            .update(studentKpProgress)
            .set({
              masteryScore: updateDto.masteryScore,
              confidence: updateDto.confidence,
              lastAttemptId: updateDto.lastAttemptId,
              lastUpdated: new Date(),
            })
            .where(eq(studentKpProgress.id, existing[0].id))
            .returning();
        } else {
          // Create new progress
          [progress] = await tx
            .insert(studentKpProgress)
            .values({
              studentId: updateDto.studentId,
              kpId: updateDto.kpId,
              masteryScore: updateDto.masteryScore,
              confidence: updateDto.confidence,
              lastAttemptId: updateDto.lastAttemptId,
            })
            .returning();
        }

        // Create history record
        await tx.insert(studentKpHistory).values({
          studentId: updateDto.studentId,
          kpId: updateDto.kpId,
          oldScore,
          newScore: updateDto.masteryScore,
          confidence: updateDto.confidence,
          source: 'assessment',
          attemptId: updateDto.lastAttemptId,
        });

        return { progress, oldMasteryScore: oldScore };
      })
      .then(({ progress, oldMasteryScore }) => {
        // Emit event after transaction commits
        this.eventEmitter.emit('progress.updated', {
          studentId: updateDto.studentId,
          kpId: updateDto.kpId,
          newMasteryScore: updateDto.masteryScore,
          oldMasteryScore,
          timestamp: new Date(),
        });
        return progress;
      });
  }

  async getStudentKpProgress(studentId: string, kpId: string) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Validate KP exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    const result = await db
      .select()
      .from(studentKpProgress)
      .where(
        and(
          eq(studentKpProgress.studentId, studentId),
          eq(studentKpProgress.kpId, kpId),
        ),
      )
      .limit(1);

    // Return null if no progress found (student hasn't started this KP yet)
    // This is a valid state, not an error
    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  async getAllStudentProgress(studentId: string) {
    // Get all KP progress
    const result = await db
      .select({
        progress: studentKpProgress,
        kp: knowledgePoint,
      })
      .from(studentKpProgress)
      .innerJoin(knowledgePoint, eq(studentKpProgress.kpId, knowledgePoint.id))
      .where(eq(studentKpProgress.studentId, studentId));

    // Get attempt stats for all KPs
    const kpIds = result.map((row) => row.progress.kpId);

    const attemptStatsMap: Map<
      string,
      { totalAttempts: number; correctAttempts: number; accuracyRate: number }
    > = new Map();

    if (kpIds.length > 0) {
      const attemptStats = await db
        .select({
          kpId: questionAttempts.kpId,
          totalAttempts: sql<number>`COUNT(*)`,
          correctAttempts: sql<number>`SUM(CASE WHEN ${questionAttempts.isCorrect} THEN 1 ELSE 0 END)`,
        })
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.studentId, studentId),
            inArray(questionAttempts.kpId, kpIds),
          ),
        )
        .groupBy(questionAttempts.kpId);

      attemptStats.forEach((stat) => {
        if (stat.kpId) {
          attemptStatsMap.set(stat.kpId, {
            totalAttempts: Number(stat.totalAttempts),
            correctAttempts: Number(stat.correctAttempts),
            accuracyRate: Math.round(
              (Number(stat.correctAttempts) / Number(stat.totalAttempts)) * 100,
            ),
          });
        }
      });
    }

    return result.map((row) => {
      const stats = attemptStatsMap.get(row.progress.kpId);
      return {
        ...row.progress,
        knowledgePoint: row.kp,
        attemptStats: stats || {
          totalAttempts: 0,
          correctAttempts: 0,
          accuracyRate: 0,
        },
      };
    });
  }

  async getKpHistory(studentId: string, kpId: string) {
    const result = await db
      .select()
      .from(studentKpHistory)
      .where(
        and(
          eq(studentKpHistory.studentId, studentId),
          eq(studentKpHistory.kpId, kpId),
        ),
      )
      .orderBy(desc(studentKpHistory.timestamp));

    return result;
  }

  // ==================== STUDENT MASTERY ====================

  async getStudentMastery(studentId: string, courseId: string) {
    const result = await db
      .select()
      .from(studentMastery)
      .where(
        and(
          eq(studentMastery.studentId, studentId),
          eq(studentMastery.courseId, courseId),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      // Return default mastery data if not found
      return {
        studentId,
        courseId,
        overallMasteryScore: 0,
        strengths: [],
        weaknesses: [],
      };
    }

    return result[0];
  }

  async getAllStudentMastery(studentId: string) {
    const result = await db
      .select()
      .from(studentMastery)
      .where(eq(studentMastery.studentId, studentId));

    return result;
  }

  // ==================== STUDENT INSIGHTS ====================

  async getStudentInsights(studentId: string) {
    const result = await db
      .select()
      .from(studentInsights)
      .where(eq(studentInsights.studentId, studentId))
      .limit(1);

    if (result.length === 0) {
      // Return default insights if not found
      return {
        studentId,
        overallMastery: 0,
        totalKpsMastered: 0,
        streakDays: 0,
        averageTimePerDay: 0,
        strengths: [],
        weaknesses: [],
        riskKps: [],
        learningPattern: {},
        engagementScore: 0,
      };
    }

    return result[0];
  }

  // ==================== QUESTION ATTEMPTS & PROGRESS ====================

  async submitQuestionAttempt(submitDto: SubmitQuestionAttemptDto) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, submitDto.studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Validate question exists and get correct answer
    const questionResult = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.id, submitDto.questionId))
      .limit(1);

    if (questionResult.length === 0) {
      throw new NotFoundException('Question not found');
    }

    const question = questionResult[0];

    // Validate KP exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, submitDto.kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    // Get correct answer (handle index format for multiple choice)
    let correctAnswer = question.correctAnswer;
    if (
      question.questionType === 'multiple_choice' &&
      question.options &&
      Array.isArray(question.options)
    ) {
      const answerIndex = parseInt(question.correctAnswer);
      if (
        !isNaN(answerIndex) &&
        answerIndex >= 1 &&
        answerIndex <= question.options.length
      ) {
        correctAnswer = question.options[answerIndex - 1];
      }
    }

    // Check if answer is correct
    const isCorrect =
      String(submitDto.selectedAnswer) === String(correctAnswer);

    const txResult = await db.transaction(async (tx) => {
      // Create question attempt
      const [attempt] = await tx
        .insert(questionAttempts)
        .values({
          studentId: submitDto.studentId,
          questionId: submitDto.questionId,
          kpId: submitDto.kpId,
          selectedAnswer: submitDto.selectedAnswer,
          isCorrect,
          timeSpent: submitDto.timeSpent || 0,
        })
        .returning();

      // Count total attempts for confidence calculation
      const [attemptCount] = await tx
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.studentId, submitDto.studentId),
            eq(questionAttempts.kpId, submitDto.kpId),
          ),
        );

      const totalAttempts = Number(attemptCount?.count || 1);

      // BKT mastery calculation
      // Get question metadata for BKT parameter derivation
      const qMeta = await tx
        .select({
          difficulty: questionMetadata.difficulty,
          discrimination: questionMetadata.discrimination,
        })
        .from(questionMetadata)
        .where(eq(questionMetadata.questionId, submitDto.questionId))
        .limit(1);

      const bktParams = this.bktMasteryService.deriveBktParams({
        questionDifficulty: qMeta[0]?.difficulty,
        discrimination: qMeta[0]?.discrimination,
        kpDifficultyLevel: kpResult[0].difficultyLevel,
      });

      // Get existing progress to use as prior
      const existingForBkt = await tx
        .select()
        .from(studentKpProgress)
        .where(
          and(
            eq(studentKpProgress.studentId, submitDto.studentId),
            eq(studentKpProgress.kpId, submitDto.kpId),
          ),
        )
        .limit(1);

      const priorPL =
        existingForBkt.length > 0
          ? this.bktMasteryService.masteryScoreToPL(
              existingForBkt[0].masteryScore,
            )
          : bktParams.pL; // Use P(L0) default for first attempt

      const bktResult = this.bktMasteryService.updateMastery(
        priorPL,
        isCorrect,
        bktParams,
      );

      const masteryScore = bktResult.masteryScore;
      const confidence = Math.min(100, Math.round((totalAttempts / 10) * 100));

      const oldScore =
        existingForBkt.length > 0 ? existingForBkt[0].masteryScore : 0;

      // Update or create progress
      if (existingForBkt.length > 0) {
        await tx
          .update(studentKpProgress)
          .set({
            masteryScore,
            confidence,
            lastAttemptId: attempt.id,
            lastUpdated: new Date(),
          })
          .where(eq(studentKpProgress.id, existingForBkt[0].id));
      } else {
        await tx.insert(studentKpProgress).values({
          studentId: submitDto.studentId,
          kpId: submitDto.kpId,
          masteryScore,
          confidence,
          lastAttemptId: attempt.id,
        });
      }

      // Create history record
      await tx.insert(studentKpHistory).values({
        studentId: submitDto.studentId,
        kpId: submitDto.kpId,
        oldScore,
        newScore: masteryScore,
        confidence,
        source: 'practice',
        attemptId: attempt.id,
      });

      return {
        attempt,
        isCorrect,
        masteryScore,
        confidence,
        oldMasteryScore: oldScore,
      };
    });

    // Emit event after transaction commits to avoid seeing uncommitted data
    this.eventEmitter.emit('progress.updated', {
      studentId: submitDto.studentId,
      kpId: submitDto.kpId,
      newMasteryScore: txResult.masteryScore,
      oldMasteryScore: txResult.oldMasteryScore,
      timestamp: new Date(),
    });

    // Update aggregated course mastery asynchronously
    this.updateCourseMastery(submitDto.studentId, submitDto.kpId).catch((err) =>
      this.logger.error('Course mastery update failed:', err?.message),
    );

    return {
      attempt: txResult.attempt,
      isCorrect: txResult.isCorrect,
      masteryScore: txResult.masteryScore,
      confidence: txResult.confidence,
    };
  }

  async getStudentQuestionAttempts(studentId: string, kpId: string) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Validate KP exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    // Get all attempts for this student and KP, ordered by most recent first
    const attempts = await db
      .select()
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          eq(questionAttempts.kpId, kpId),
        ),
      )
      .orderBy(desc(questionAttempts.attemptTime));

    // Group by questionId and get the most recent attempt for each question
    const latestAttemptsByQuestion: Record<string, any> = {};

    attempts.forEach((attempt) => {
      if (
        !latestAttemptsByQuestion[attempt.questionId] ||
        new Date(attempt.attemptTime) >
          new Date(latestAttemptsByQuestion[attempt.questionId].attemptTime)
      ) {
        latestAttemptsByQuestion[attempt.questionId] = attempt;
      }
    });

    return Object.values(latestAttemptsByQuestion);
  }

  // ==================== CONTENT QUESTION PROGRESS ====================

  async submitContentQuestion(submitDto: SubmitContentQuestionDto) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, submitDto.studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Validate KP exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, submitDto.kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    // Get question count from kp_exercises instead of content
    const exercisesResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(kpExercises)
      .where(eq(kpExercises.kpId, submitDto.kpId));

    const exerciseCount = Number(exercisesResult[0]?.count || 0);
    const totalQuestions = submitDto.totalQuestions || exerciseCount;

    if (totalQuestions === 0) {
      throw new BadRequestException('No questions found for this KP');
    }

    // Get existing progress
    const existing = await db
      .select()
      .from(studentKpProgress)
      .where(
        and(
          eq(studentKpProgress.studentId, submitDto.studentId),
          eq(studentKpProgress.kpId, submitDto.kpId),
        ),
      )
      .limit(1);

    const oldScore = existing.length > 0 ? existing[0].masteryScore : 0;

    // Calculate new mastery score based on weighted approach:
    // - Use existing score as base
    // - Each correct answer increases score, each wrong answer decreases
    let masteryScore: number;
    const scorePerQuestion = Math.round(100 / totalQuestions);

    if (existing.length > 0) {
      // Update existing score
      if (submitDto.isCorrect) {
        masteryScore = Math.min(
          100,
          existing[0].masteryScore + scorePerQuestion,
        );
      } else {
        masteryScore = Math.max(
          0,
          existing[0].masteryScore - Math.round(scorePerQuestion / 2),
        );
      }
    } else {
      // First attempt
      masteryScore = submitDto.isCorrect ? scorePerQuestion : 0;
    }

    const confidence = Math.min(
      100,
      (existing.length > 0 ? (existing[0].confidence ?? 0) : 0) +
        Math.round(100 / totalQuestions),
    );

    // Update or create progress
    if (existing.length > 0) {
      await db
        .update(studentKpProgress)
        .set({
          masteryScore,
          confidence,
          lastUpdated: new Date(),
        })
        .where(eq(studentKpProgress.id, existing[0].id));
    } else {
      await db.insert(studentKpProgress).values({
        studentId: submitDto.studentId,
        kpId: submitDto.kpId,
        masteryScore,
        confidence,
      });
    }

    // Create history record
    await db.insert(studentKpHistory).values({
      studentId: submitDto.studentId,
      kpId: submitDto.kpId,
      oldScore,
      newScore: masteryScore,
      confidence,
      source: 'practice',
    });

    // Emit event after DB writes complete
    this.eventEmitter.emit('progress.updated', {
      studentId: submitDto.studentId,
      kpId: submitDto.kpId,
      newMasteryScore: masteryScore,
      oldMasteryScore: oldScore,
      timestamp: new Date(),
    });

    return {
      isCorrect: submitDto.isCorrect,
      masteryScore,
      confidence,
    };
  }

  // ==================== TIME TRACKING ====================

  async trackTimeOnTask(
    studentId: string,
    kpId: string,
    timeSpentSeconds: number,
  ) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Validate KP exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    // Insert time tracking record
    const [record] = await db
      .insert(timeOnTask)
      .values({
        studentId,
        kpId,
        timeSpentSeconds,
      })
      .returning();

    return record;
  }

  async getKpAttemptStats(studentId: string, kpId: string) {
    // Get all attempts for this KP
    const attempts = await db
      .select({
        isCorrect: questionAttempts.isCorrect,
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          eq(questionAttempts.kpId, kpId),
        ),
      )
      .orderBy(desc(questionAttempts.attemptTime));

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const accuracyRate =
      totalAttempts > 0
        ? Math.round((correctAttempts / totalAttempts) * 100)
        : 0;

    return {
      totalAttempts,
      correctAttempts,
      incorrectAttempts: totalAttempts - correctAttempts,
      accuracyRate,
      latestAttemptCorrect: attempts.length > 0 ? attempts[0].isCorrect : null,
    };
  }

  async getTotalStudyTime(studentId: string, courseId?: string) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Build conditions array
    const conditions: any[] = [eq(timeOnTask.studentId, studentId)];

    // If courseId provided, filter by KPs in that course
    if (courseId) {
      // Get all KP IDs in the course
      const courseKps = await db
        .select({
          kpId: sectionKpMap.kpId,
        })
        .from(modules)
        .innerJoin(sections, eq(sections.moduleId, modules.id))
        .innerJoin(sectionKpMap, eq(sectionKpMap.sectionId, sections.id))
        .where(eq(modules.courseId, courseId));

      const kpIds = courseKps.map((k) => k.kpId);

      if (kpIds.length > 0) {
        conditions.push(inArray(timeOnTask.kpId, kpIds));
      }
    }

    const result = await db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0)`,
      })
      .from(timeOnTask)
      .where(and(...conditions));
    const totalSeconds = result[0]?.totalSeconds || 0;

    return {
      totalSeconds,
      totalMinutes: Math.round(totalSeconds / 60),
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
    };
  }

  // ==================== WEEKLY ACTIVITY ====================

  // ==================== COURSE MASTERY AGGREGATION ====================

  async updateCourseMastery(studentId: string, kpId: string): Promise<void> {
    try {
      // Find courses containing this KP
      const courseResults = await db
        .select({
          courseId: courses.id,
        })
        .from(sectionKpMap)
        .innerJoin(sections, eq(sectionKpMap.sectionId, sections.id))
        .innerJoin(modules, eq(sections.moduleId, modules.id))
        .innerJoin(courses, eq(modules.courseId, courses.id))
        .where(eq(sectionKpMap.kpId, kpId));

      for (const { courseId } of courseResults) {
        // Get all KP IDs in this course
        const courseKps = await db
          .select({ kpId: sectionKpMap.kpId })
          .from(sectionKpMap)
          .innerJoin(sections, eq(sectionKpMap.sectionId, sections.id))
          .innerJoin(modules, eq(sections.moduleId, modules.id))
          .where(eq(modules.courseId, courseId));

        const kpIds = courseKps.map((k) => k.kpId);
        if (kpIds.length === 0) continue;

        // Get student progress for all KPs in course
        const progressRows = await db
          .select({
            kpId: studentKpProgress.kpId,
            masteryScore: studentKpProgress.masteryScore,
          })
          .from(studentKpProgress)
          .where(
            and(
              eq(studentKpProgress.studentId, studentId),
              inArray(studentKpProgress.kpId, kpIds),
            ),
          );

        // Calculate overall mastery (average of all KPs, unstarted = 0)
        const scoreMap = new Map(
          progressRows.map((r) => [r.kpId, r.masteryScore]),
        );
        const totalScore = kpIds.reduce(
          (sum, id) => sum + (scoreMap.get(id) || 0),
          0,
        );
        const overallMasteryScore = Math.round(totalScore / kpIds.length);

        // Identify strengths (>= 80) and weaknesses (< 40)
        const strengths = progressRows
          .filter((r) => r.masteryScore >= 80)
          .map((r) => r.kpId);
        const weaknesses = progressRows
          .filter((r) => r.masteryScore < 40)
          .map((r) => r.kpId);

        // Upsert student_mastery
        const existing = await db
          .select()
          .from(studentMastery)
          .where(
            and(
              eq(studentMastery.studentId, studentId),
              eq(studentMastery.courseId, courseId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(studentMastery)
            .set({
              overallMasteryScore,
              strengths,
              weaknesses,
              updatedAt: new Date(),
            })
            .where(eq(studentMastery.id, existing[0].id));
        } else {
          await db.insert(studentMastery).values({
            studentId,
            courseId,
            overallMasteryScore,
            strengths,
            weaknesses,
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to update course mastery for student ${studentId}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  // ==================== WEEKLY ACTIVITY ====================

  async getWeeklyActivity(studentId: string) {
    // Validate student exists
    const studentResult = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (studentResult.length === 0) {
      throw new NotFoundException('Student not found');
    }

    // Get last 7 days data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get daily attempts count
    const dailyAttempts = await db
      .select({
        date: sql<string>`DATE(${questionAttempts.attemptTime})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(questionAttempts)
      .where(
        and(
          eq(questionAttempts.studentId, studentId),
          gte(questionAttempts.attemptTime, sevenDaysAgo),
        ),
      )
      .groupBy(sql`DATE(${questionAttempts.attemptTime})`)
      .orderBy(sql`DATE(${questionAttempts.attemptTime})`);

    // Get daily study time (in minutes)
    const dailyStudyTime = await db
      .select({
        date: sql<string>`DATE(${timeOnTask.computedAt})`,
        totalMinutes: sql<number>`COALESCE(SUM(${timeOnTask.timeSpentSeconds}), 0) / 60`,
      })
      .from(timeOnTask)
      .where(
        and(
          eq(timeOnTask.studentId, studentId),
          gte(timeOnTask.computedAt, sevenDaysAgo),
        ),
      )
      .groupBy(sql`DATE(${timeOnTask.computedAt})`)
      .orderBy(sql`DATE(${timeOnTask.computedAt})`);

    // Create maps for easy lookup
    const attemptsMap = new Map(
      dailyAttempts.map((d) => [d.date, Number(d.count)]),
    );
    const studyTimeMap = new Map(
      dailyStudyTime.map((d) => [d.date, Number(d.totalMinutes)]),
    );

    // Generate last 7 days array
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const result: Array<{
      date: string;
      fullDate: string;
      attempts: number;
      timeSpent: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];

      result.push({
        date: dayName,
        fullDate: dateStr,
        attempts: attemptsMap.get(dateStr) || 0,
        timeSpent: studyTimeMap.get(dateStr) || 0,
      });
    }

    return result;
  }
}
