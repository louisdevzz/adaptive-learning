import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import {
  db,
  questionBank,
  questionMetadata,
  kpExercises,
  knowledgePoint,
} from '../../db';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AssignToKpDto } from './dto/assign-to-kp.dto';

@Injectable()
export class QuestionBankService {
  // ==================== QUESTIONS ====================

  async create(createQuestionDto: CreateQuestionDto) {
    // Validate that the skill (KP) exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, createQuestionDto.metadata.skillId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new BadRequestException('Skill (Knowledge Point) not found');
    }

    // Use transaction to create question with metadata
    return await db.transaction(async (tx) => {
      // 1. Create the question
      const [question] = await tx
        .insert(questionBank)
        .values({
          questionText: createQuestionDto.questionText,
          options: createQuestionDto.options,
          correctAnswer: createQuestionDto.correctAnswer,
          questionType: createQuestionDto.questionType,
          isActive: createQuestionDto.isActive ?? true,
        })
        .returning();

      // 2. Create question metadata (required for all questions)
      await tx.insert(questionMetadata).values({
        questionId: question.id,
        difficulty: createQuestionDto.metadata.difficulty,
        discrimination: createQuestionDto.metadata.discrimination,
        skillId: createQuestionDto.metadata.skillId,
        tags: createQuestionDto.metadata.tags,
        estimatedTime: createQuestionDto.metadata.estimatedTime,
      });

      return question;
    });
  }

  async findAll(questionType?: string, isActive?: boolean) {
    let query = db.select().from(questionBank);

    const conditions: SQL[] = [];
    if (questionType) conditions.push(eq(questionBank.questionType, questionType as any));
    if (isActive !== undefined) conditions.push(eq(questionBank.isActive, isActive));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async findOne(id: string) {
    const result = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Question not found');
    }

    return result[0];
  }

  async findOneWithMetadata(id: string) {
    const question = await this.findOne(id);

    const metadataResult = await db
      .select()
      .from(questionMetadata)
      .where(eq(questionMetadata.questionId, id))
      .limit(1);

    return {
      ...question,
      metadata: metadataResult[0] || null,
    };
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    await this.findOne(id);

    // Validate skill if provided
    if (updateQuestionDto.metadata?.skillId) {
      const kpResult = await db
        .select()
        .from(knowledgePoint)
        .where(eq(knowledgePoint.id, updateQuestionDto.metadata.skillId))
        .limit(1);

      if (kpResult.length === 0) {
        throw new BadRequestException('Skill (Knowledge Point) not found');
      }
    }

    return await db.transaction(async (tx) => {
      // 1. Update the question
      const questionUpdateData: any = { updatedAt: new Date() };
      if (updateQuestionDto.questionText) questionUpdateData.questionText = updateQuestionDto.questionText;
      if (updateQuestionDto.options) questionUpdateData.options = updateQuestionDto.options;
      if (updateQuestionDto.correctAnswer) questionUpdateData.correctAnswer = updateQuestionDto.correctAnswer;
      if (updateQuestionDto.questionType) questionUpdateData.questionType = updateQuestionDto.questionType;
      if (updateQuestionDto.isActive !== undefined) questionUpdateData.isActive = updateQuestionDto.isActive;

      const [updated] = await tx
        .update(questionBank)
        .set(questionUpdateData)
        .where(eq(questionBank.id, id))
        .returning();

      // 2. Update metadata if provided
      if (updateQuestionDto.metadata) {
        const metadataUpdateData: any = {};
        if (updateQuestionDto.metadata.difficulty) metadataUpdateData.difficulty = updateQuestionDto.metadata.difficulty;
        if (updateQuestionDto.metadata.discrimination) metadataUpdateData.discrimination = updateQuestionDto.metadata.discrimination;
        if (updateQuestionDto.metadata.skillId) metadataUpdateData.skillId = updateQuestionDto.metadata.skillId;
        if (updateQuestionDto.metadata.tags) metadataUpdateData.tags = updateQuestionDto.metadata.tags;
        if (updateQuestionDto.metadata.estimatedTime) metadataUpdateData.estimatedTime = updateQuestionDto.metadata.estimatedTime;

        await tx
          .update(questionMetadata)
          .set(metadataUpdateData)
          .where(eq(questionMetadata.questionId, id));
      }

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await db.delete(questionBank).where(eq(questionBank.id, id));

    return { message: 'Question deleted successfully' };
  }

  // ==================== KP ASSIGNMENTS ====================

  async assignToKp(assignDto: AssignToKpDto) {
    // Validate KP exists
    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, assignDto.kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    // Validate question exists
    await this.findOne(assignDto.questionId);

    // Check if already assigned
    const existing = await db
      .select()
      .from(kpExercises)
      .where(
        and(
          eq(kpExercises.kpId, assignDto.kpId),
          eq(kpExercises.questionId, assignDto.questionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Question already assigned to this KP');
    }

    const [assignment] = await db
      .insert(kpExercises)
      .values({
        kpId: assignDto.kpId,
        questionId: assignDto.questionId,
        difficulty: assignDto.difficulty,
      })
      .returning();

    return assignment;
  }

  async removeFromKp(kpId: string, questionId: string) {
    const result = await db
      .delete(kpExercises)
      .where(
        and(
          eq(kpExercises.kpId, kpId),
          eq(kpExercises.questionId, questionId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Question not assigned to this KP');
    }

    return { message: 'Question removed from KP successfully' };
  }

  async getQuestionsByKp(kpId: string) {
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
      .select({
        question: questionBank,
        exercise: kpExercises,
      })
      .from(kpExercises)
      .innerJoin(questionBank, eq(kpExercises.questionId, questionBank.id))
      .where(eq(kpExercises.kpId, kpId));

    return result.map((row) => ({
      ...row.question,
      difficulty: row.exercise.difficulty,
    }));
  }

  // ==================== METADATA ====================

  async getQuestionMetadata(questionId: string) {
    await this.findOne(questionId);

    const result = await db
      .select()
      .from(questionMetadata)
      .where(eq(questionMetadata.questionId, questionId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Question metadata not found');
    }

    return result[0];
  }
}
