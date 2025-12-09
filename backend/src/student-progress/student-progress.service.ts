import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import {
  db,
  studentKpProgress,
  studentKpHistory,
  studentMastery,
  studentInsights,
  students,
  knowledgePoint,
} from '../../db';
import { UpdateKpProgressDto } from './dto/update-kp-progress.dto';

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

    if (result.length === 0) {
      throw new NotFoundException('Student KP progress not found');
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
}
