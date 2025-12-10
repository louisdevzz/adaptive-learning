import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
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
} from '../../db';
import { UpdateKpProgressDto } from './dto/update-kp-progress.dto';
import { SubmitQuestionAttemptDto } from './dto/submit-question-attempt.dto';

@Injectable()
export class StudentProgressService {
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

    return await db.transaction(async (tx) => {
      // Check if progress exists
      const existing = await tx
        .select()
        .from(studentKpProgress)
        .where(
          and(
            eq(studentKpProgress.studentId, updateDto.studentId),
            eq(studentKpProgress.kpId, updateDto.kpId)
          )
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
          eq(studentKpProgress.kpId, kpId)
        )
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
    const result = await db
      .select({
        progress: studentKpProgress,
        kp: knowledgePoint,
      })
      .from(studentKpProgress)
      .innerJoin(knowledgePoint, eq(studentKpProgress.kpId, knowledgePoint.id))
      .where(eq(studentKpProgress.studentId, studentId));

    return result.map((row) => ({
      ...row.progress,
      knowledgePoint: row.kp,
    }));
  }

  async getKpHistory(studentId: string, kpId: string) {
    const result = await db
      .select()
      .from(studentKpHistory)
      .where(
        and(
          eq(studentKpHistory.studentId, studentId),
          eq(studentKpHistory.kpId, kpId)
        )
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
          eq(studentMastery.courseId, courseId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Student mastery data not found');
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
      throw new NotFoundException('Student insights not found');
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
    if (question.questionType === 'multiple_choice' && question.options && Array.isArray(question.options)) {
      const answerIndex = parseInt(question.correctAnswer);
      if (!isNaN(answerIndex) && answerIndex >= 1 && answerIndex <= question.options.length) {
        correctAnswer = question.options[answerIndex - 1];
      }
    }

    // Check if answer is correct
    const isCorrect = String(submitDto.selectedAnswer) === String(correctAnswer);

    return await db.transaction(async (tx) => {
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

      // Get all attempts for this KP to calculate mastery score
      const allAttempts = await tx
        .select()
        .from(questionAttempts)
        .where(
          and(
            eq(questionAttempts.studentId, submitDto.studentId),
            eq(questionAttempts.kpId, submitDto.kpId)
          )
        )
        .orderBy(desc(questionAttempts.attemptTime));

      // Calculate mastery score based on recent attempts
      // Consider last 10 attempts, weight recent attempts more heavily
      const recentAttempts = allAttempts.slice(0, 10);
      const recentCount = recentAttempts.length;
      
      if (recentCount === 0) {
        throw new BadRequestException('Failed to create attempt');
      }

      // Calculate weighted score (more recent = higher weight)
      let weightedSum = 0;
      let totalWeight = 0;
      
      recentAttempts.forEach((att, index) => {
        const weight = recentCount - index; // Most recent gets highest weight
        weightedSum += att.isCorrect ? weight : 0;
        totalWeight += weight;
      });

      const masteryScore = Math.round((weightedSum / totalWeight) * 100);
      const confidence = Math.min(100, Math.round((recentCount / 10) * 100)); // Confidence based on attempt count

      // Get existing progress
      const existing = await tx
        .select()
        .from(studentKpProgress)
        .where(
          and(
            eq(studentKpProgress.studentId, submitDto.studentId),
            eq(studentKpProgress.kpId, submitDto.kpId)
          )
        )
        .limit(1);

      const oldScore = existing.length > 0 ? existing[0].masteryScore : 0;

      // Update or create progress
      if (existing.length > 0) {
        await tx
          .update(studentKpProgress)
          .set({
            masteryScore,
            confidence,
            lastAttemptId: attempt.id,
            lastUpdated: new Date(),
          })
          .where(eq(studentKpProgress.id, existing[0].id));
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
      };
    });
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
          eq(questionAttempts.kpId, kpId)
        )
      )
      .orderBy(desc(questionAttempts.attemptTime));

    // Group by questionId and get the most recent attempt for each question
    const latestAttemptsByQuestion: Record<string, any> = {};
    
    attempts.forEach((attempt) => {
      if (!latestAttemptsByQuestion[attempt.questionId] || 
          new Date(attempt.attemptTime) > new Date(latestAttemptsByQuestion[attempt.questionId].attemptTime)) {
        latestAttemptsByQuestion[attempt.questionId] = attempt;
      }
    });

    return Object.values(latestAttemptsByQuestion);
  }
}
