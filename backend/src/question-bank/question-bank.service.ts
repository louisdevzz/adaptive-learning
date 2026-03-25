import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, SQL, desc } from 'drizzle-orm';
import {
  db,
  questionBank,
  questionMetadata,
  kpExercises,
  knowledgePoint,
  kpResources,
  questionAttempts,
} from '../../db';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AssignToKpDto } from './dto/assign-to-kp.dto';
import { GenerateQuestionDto } from './dto/generate-question.dto';
import { GenerateBatchQuestionsDto } from './dto/generate-batch-questions.dto';
import { HumanMessage } from '@langchain/core/messages';
import { createChatModel } from '../common/ai/chat-model.factory';
import mammoth from 'mammoth';

@Injectable()
export class QuestionBankService {
  private readonly generationEvidenceLimit = 5000;

  // ==================== QUESTIONS ====================

  async create(createQuestionDto: CreateQuestionDto, userId?: string) {
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
          createdBy: userId ?? null,
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

      // 3. Auto-link question to KP via kp_exercises
      await tx.insert(kpExercises).values({
        kpId: createQuestionDto.metadata.skillId,
        questionId: question.id,
        difficulty: createQuestionDto.metadata.difficulty,
      });

      return question;
    });
  }

  async findAll(questionType?: string, isActive?: boolean) {
    let query = db.select().from(questionBank);

    const conditions: SQL[] = [];
    if (questionType)
      conditions.push(eq(questionBank.questionType, questionType as any));
    if (isActive !== undefined)
      conditions.push(eq(questionBank.isActive, isActive));

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
      if (updateQuestionDto.questionText)
        questionUpdateData.questionText = updateQuestionDto.questionText;
      if (updateQuestionDto.options)
        questionUpdateData.options = updateQuestionDto.options;
      if (updateQuestionDto.correctAnswer)
        questionUpdateData.correctAnswer = updateQuestionDto.correctAnswer;
      if (updateQuestionDto.questionType)
        questionUpdateData.questionType = updateQuestionDto.questionType;
      if (updateQuestionDto.isActive !== undefined)
        questionUpdateData.isActive = updateQuestionDto.isActive;

      const [updated] = await tx
        .update(questionBank)
        .set(questionUpdateData)
        .where(eq(questionBank.id, id))
        .returning();

      // 2. Update metadata if provided
      if (updateQuestionDto.metadata) {
        const metadataUpdateData: any = {};
        if (updateQuestionDto.metadata.difficulty)
          metadataUpdateData.difficulty = updateQuestionDto.metadata.difficulty;
        if (updateQuestionDto.metadata.discrimination)
          metadataUpdateData.discrimination =
            updateQuestionDto.metadata.discrimination;
        if (updateQuestionDto.metadata.skillId)
          metadataUpdateData.skillId = updateQuestionDto.metadata.skillId;
        if (updateQuestionDto.metadata.tags)
          metadataUpdateData.tags = updateQuestionDto.metadata.tags;
        if (updateQuestionDto.metadata.estimatedTime)
          metadataUpdateData.estimatedTime =
            updateQuestionDto.metadata.estimatedTime;

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
          eq(kpExercises.questionId, assignDto.questionId),
        ),
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
        and(eq(kpExercises.kpId, kpId), eq(kpExercises.questionId, questionId)),
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

  // ==================== AI QUESTION GENERATION ====================

  async generateQuestion(generateDto: GenerateQuestionDto) {
    const difficultyLabels: Record<number, string> = {
      1: 'Rất dễ',
      2: 'Dễ',
      3: 'Trung bình',
      4: 'Khó',
      5: 'Rất khó',
    };

    const questionTypeLabels: Record<string, string> = {
      multiple_choice: 'Trắc nghiệm',
      true_false: 'Đúng/Sai',
      fill_in_blank: 'Điền vào chỗ trống',
      short_answer: 'Trả lời ngắn',
    };

    const difficultyLabel =
      difficultyLabels[generateDto.difficulty] || 'Trung bình';
    const questionTypeLabel =
      questionTypeLabels[generateDto.questionType] || 'Trắc nghiệm';

    // Build prompt based on question type
    let prompt = '';

    if (generateDto.questionType === 'multiple_choice') {
      prompt = `Tạo một câu hỏi trắc nghiệm về chủ đề "${generateDto.knowledgePointTitle}"${generateDto.knowledgePointDescription ? ` với mô tả: ${generateDto.knowledgePointDescription}` : ''}.

Yêu cầu:
- Độ khó: ${difficultyLabel} (${generateDto.difficulty}/5)
- Loại câu hỏi: ${questionTypeLabel}
- Câu hỏi phải rõ ràng, chính xác và phù hợp với độ khó
- Tạo 4 lựa chọn (A, B, C, D), trong đó chỉ có 1 đáp án đúng
- Các lựa chọn sai phải hợp lý và có tính gây nhiễu

Trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "questionText": "Nội dung câu hỏi",
  "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
  "correctAnswer": "Số thứ tự đáp án đúng (1, 2, 3, hoặc 4)",
  "estimatedTime": <số giây ước tính để trả lời>,
  "discrimination": <số thập phân từ 0.2 đến 1.0, ước tính khả năng phân biệt học sinh giỏi và yếu>
}`;
    } else if (generateDto.questionType === 'true_false') {
      prompt = `Tạo một câu hỏi Đúng/Sai về chủ đề "${generateDto.knowledgePointTitle}"${generateDto.knowledgePointDescription ? ` với mô tả: ${generateDto.knowledgePointDescription}` : ''}.

Yêu cầu:
- Độ khó: ${difficultyLabel} (${generateDto.difficulty}/5)
- Loại câu hỏi: ${questionTypeLabel}
- Câu hỏi phải rõ ràng, chính xác và phù hợp với độ khó
- Đáp án phải là "Đúng" hoặc "Sai"

Trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "questionText": "Nội dung câu hỏi",
  "options": ["Đúng", "Sai"],
  "correctAnswer": "Đúng" hoặc "Sai",
  "estimatedTime": <số giây ước tính để trả lời>,
  "discrimination": <số thập phân từ 0.2 đến 1.0, ước tính khả năng phân biệt học sinh giỏi và yếu>
}`;
    } else if (generateDto.questionType === 'fill_in_blank') {
      prompt = `Tạo một câu hỏi Điền vào chỗ trống về chủ đề "${generateDto.knowledgePointTitle}"${generateDto.knowledgePointDescription ? ` với mô tả: ${generateDto.knowledgePointDescription}` : ''}.

Yêu cầu:
- Độ khó: ${difficultyLabel} (${generateDto.difficulty}/5)
- Loại câu hỏi: ${questionTypeLabel}
- Câu hỏi phải có chỗ trống (___) để điền
- Câu hỏi phải rõ ràng, chính xác và phù hợp với độ khó

Trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "questionText": "Nội dung câu hỏi có chỗ trống (___)",
  "options": [],
  "correctAnswer": "Đáp án đúng để điền vào chỗ trống",
  "estimatedTime": <số giây ước tính để trả lời>,
  "discrimination": <số thập phân từ 0.2 đến 1.0, ước tính khả năng phân biệt học sinh giỏi và yếu>
}`;
    } else if (generateDto.questionType === 'short_answer') {
      prompt = `Tạo một câu hỏi Trả lời ngắn về chủ đề "${generateDto.knowledgePointTitle}"${generateDto.knowledgePointDescription ? ` với mô tả: ${generateDto.knowledgePointDescription}` : ''}.

Yêu cầu:
- Độ khó: ${difficultyLabel} (${generateDto.difficulty}/5)
- Loại câu hỏi: ${questionTypeLabel}
- Câu hỏi phải rõ ràng, chính xác và phù hợp với độ khó
- Câu trả lời phải ngắn gọn (1-2 câu)

Trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "questionText": "Nội dung câu hỏi",
  "options": [],
  "correctAnswer": "Đáp án đúng (ngắn gọn)",
  "estimatedTime": <số giây ước tính để trả lời>,
  "discrimination": <số thập phân từ 0.2 đến 1.0, ước tính khả năng phân biệt học sinh giỏi và yếu>
}`;
    }

    try {
      const { chatModel } = createChatModel({
        provider: generateDto.aiModel,
        temperature: 0.7,
      });

      // Generate question
      const response = await chatModel.invoke([new HumanMessage(prompt)]);
      const content = response.content;

      // Parse JSON from response
      let questionData;
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          questionData = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find JSON object in the response
          const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch) {
            questionData = JSON.parse(jsonObjectMatch[0]);
          } else {
            questionData = JSON.parse(content);
          }
        }
      } catch (parseError) {
        throw new BadRequestException(
          `Failed to parse AI response. Response: ${content.substring(0, 200)}`,
        );
      }

      // Validate and format response
      if (!questionData.questionText || !questionData.correctAnswer) {
        throw new BadRequestException('AI response is missing required fields');
      }

      // Ensure options is an array
      if (!Array.isArray(questionData.options)) {
        questionData.options =
          generateDto.questionType === 'multiple_choice'
            ? []
            : generateDto.questionType === 'true_false'
              ? ['Đúng', 'Sai']
              : [];
      }

      // Validate estimatedTime and discrimination
      const estimatedTime = questionData.estimatedTime
        ? Math.max(
            30,
            Math.min(600, parseInt(questionData.estimatedTime) || 60),
          )
        : 60;

      // Calculate discrimination based on difficulty (higher difficulty = higher discrimination potential)
      // Range: 0.2-0.39 (avg), 0.4-0.69 (good), 0.7-1.0 (excellent)
      let discrimination = questionData.discrimination;
      if (!discrimination || discrimination < 0.2 || discrimination > 1.0) {
        // Estimate based on difficulty: higher difficulty questions tend to have better discrimination
        const baseDiscrimination = 0.3 + (generateDto.difficulty - 1) * 0.15;
        discrimination = Math.min(
          0.9,
          Math.max(0.2, baseDiscrimination + (Math.random() * 0.2 - 0.1)),
        );
      }
      discrimination = Math.max(0.2, Math.min(1.0, parseFloat(discrimination)));

      // Format correct answer for multiple choice (convert to index if needed)
      let correctAnswer = questionData.correctAnswer;
      if (generateDto.questionType === 'multiple_choice') {
        // If correctAnswer is a number (1-4), convert to the actual option text
        const answerIndex = parseInt(correctAnswer);
        if (
          !isNaN(answerIndex) &&
          answerIndex >= 1 &&
          answerIndex <= questionData.options.length
        ) {
          correctAnswer = questionData.options[answerIndex - 1];
        }
      }

      return {
        questionText: questionData.questionText.trim(),
        questionType: generateDto.questionType,
        options: questionData.options,
        correctAnswer: correctAnswer.toString().trim(),
        difficulty: generateDto.difficulty,
        discrimination: parseFloat(discrimination.toFixed(2)),
        estimatedTime,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('AI question generation error:', error);
      throw new BadRequestException(
        `Failed to generate question: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async generateBatchQuestions(
    generateDto: GenerateBatchQuestionsDto,
    userId?: string,
  ) {
    const result = await this.generateAdaptiveQuestionsForKp({
      kpId: generateDto.kpId,
      count: generateDto.count,
      difficulty: generateDto.difficulty,
      questionType: generateDto.questionType,
      aiModel: generateDto.aiModel,
      useSlides: generateDto.useSlides ?? true,
      useResources: generateDto.useResources ?? true,
      useExistingQuestions: generateDto.useExistingQuestions ?? true,
      createdBy: userId,
    });

    return {
      requestedCount: generateDto.count,
      createdCount: result.questions.length,
      questions: result.questions,
      skippedDuplicates: generateDto.count - result.questions.length,
    };
  }

  async generateAdaptiveQuestionsForKp(params: {
    kpId: string;
    count: number;
    difficulty: number;
    questionType: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'short_answer';
    aiModel?: 'openai' | 'gemini' | 'kimi-code' | 'kimi';
    studentId?: string;
    useSlides?: boolean;
    useResources?: boolean;
    useExistingQuestions?: boolean;
    createdBy?: string;
  }) {
    if (params.count <= 0) {
      return { questions: [] as any[] };
    }

    const kpResult = await db
      .select()
      .from(knowledgePoint)
      .where(eq(knowledgePoint.id, params.kpId))
      .limit(1);

    if (kpResult.length === 0) {
      throw new NotFoundException('Knowledge Point not found');
    }

    const kp = kpResult[0];
    const existingQuestionTexts = await this.getKpQuestionTexts(params.kpId);
    const normalizedExisting = new Set(
      existingQuestionTexts.map((text) => this.normalizeQuestionText(text)),
    );

    const sourceContext = await this.buildSourceContext({
      kpId: params.kpId,
      kp,
      studentId: params.studentId,
      useSlides: params.useSlides ?? true,
      useResources: params.useResources ?? true,
      useExistingQuestions: params.useExistingQuestions ?? true,
    });

    const mergedDescription = this.trimText(
      [kp.description, sourceContext].filter(Boolean).join('\n\n'),
      this.generationEvidenceLimit,
    );

    const createdQuestions: Array<any> = [];
    const maxAttempts = Math.max(params.count * 4, 8);
    let attempts = 0;

    while (createdQuestions.length < params.count && attempts < maxAttempts) {
      attempts++;

      let generated: {
        questionText: string;
        questionType: string;
        options: any[];
        correctAnswer: string;
        difficulty: number;
        discrimination: number;
        estimatedTime: number;
      };
      try {
        generated = await this.generateQuestion({
          knowledgePointTitle: kp.title,
          knowledgePointDescription: mergedDescription,
          aiModel: params.aiModel,
          questionType: params.questionType,
          difficulty: params.difficulty,
          skillId: params.kpId,
        });
      } catch {
        continue;
      }

      if (
        this.isDuplicateQuestion(
          generated.questionText,
          existingQuestionTexts,
          normalizedExisting,
        )
      ) {
        continue;
      }

      const metadataDifficulty = this.toMetadataDifficulty(params.difficulty);
      const tags = params.studentId
        ? ['generated_adaptive', 'generated_for_student']
        : ['generated_adaptive'];

      const [insertedQuestion] = await db
        .insert(questionBank)
        .values({
          questionText: generated.questionText,
          options: generated.options ?? [],
          correctAnswer: generated.correctAnswer,
          questionType: generated.questionType,
          isActive: true,
          createdBy: params.createdBy ?? null,
        })
        .returning();

      await db.insert(questionMetadata).values({
        questionId: insertedQuestion.id,
        difficulty: metadataDifficulty,
        discrimination: Math.max(0.2, Math.min(1.0, generated.discrimination)),
        skillId: params.kpId,
        tags,
        estimatedTime: generated.estimatedTime ?? 60,
      });

      await db.insert(kpExercises).values({
        kpId: params.kpId,
        questionId: insertedQuestion.id,
        difficulty: params.difficulty,
      });

      createdQuestions.push({
        ...insertedQuestion,
        difficulty: params.difficulty,
      });
      existingQuestionTexts.push(generated.questionText);
      normalizedExisting.add(this.normalizeQuestionText(generated.questionText));
    }

    return { questions: createdQuestions };
  }

  private async buildSourceContext(options: {
    kpId: string;
    kp: typeof knowledgePoint.$inferSelect;
    studentId?: string;
    useSlides: boolean;
    useResources: boolean;
    useExistingQuestions: boolean;
  }) {
    const contextParts: string[] = [];

    if (options.useSlides) {
      const content = options.kp.content as { slideUrl?: string } | null;
      const slideUrl = content?.slideUrl;
      if (slideUrl) {
        const text = await this.extractTextFromUrl(slideUrl);
        if (text) {
          contextParts.push(`Nội dung từ slide:\n${text}`);
        }
      }
    }

    if (options.useResources) {
      const resources = await db
        .select({
          title: kpResources.title,
          url: kpResources.url,
        })
        .from(kpResources)
        .where(eq(kpResources.kpId, options.kpId))
        .orderBy(kpResources.orderIndex);

      const documentResources = resources.filter((r) =>
        /\.(pdf|docx|pptx|ppt)(\?|$)/i.test(r.url),
      );

      for (const resource of documentResources.slice(0, 3)) {
        const text = await this.extractTextFromUrl(resource.url);
        if (text) {
          contextParts.push(`Tài liệu "${resource.title}":\n${text}`);
        }
      }
    }

    if (options.useExistingQuestions) {
      const existingQuestions = await this.getKpQuestionTexts(options.kpId);
      if (existingQuestions.length > 0) {
        contextParts.push(
          `Các câu hỏi đã có (để học style và tránh trùng):\n- ${existingQuestions
            .slice(0, 20)
            .join('\n- ')}`,
        );
      }
    }

    if (options.studentId) {
      const wrongAttempts = await db
        .select({
          questionText: questionBank.questionText,
        })
        .from(questionAttempts)
        .innerJoin(questionBank, eq(questionAttempts.questionId, questionBank.id))
        .where(
          and(
            eq(questionAttempts.studentId, options.studentId),
            eq(questionAttempts.kpId, options.kpId),
            eq(questionAttempts.isCorrect, false),
          ),
        )
        .orderBy(desc(questionAttempts.attemptTime))
        .limit(30);

      if (wrongAttempts.length > 0) {
        const freq = new Map<string, number>();
        wrongAttempts.forEach((item) => {
          freq.set(item.questionText, (freq.get(item.questionText) ?? 0) + 1);
        });
        const frequentMistakes = Array.from(freq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([text]) => text);

        contextParts.push(
          `Các dạng học sinh hay sai gần đây:\n- ${frequentMistakes.join('\n- ')}`,
        );
      }
    }

    return this.trimText(contextParts.join('\n\n'), this.generationEvidenceLimit);
  }

  private async getKpQuestionTexts(kpId: string) {
    const rows = await db
      .select({
        questionText: questionBank.questionText,
      })
      .from(kpExercises)
      .innerJoin(questionBank, eq(kpExercises.questionId, questionBank.id))
      .where(eq(kpExercises.kpId, kpId));

    return rows.map((row) => row.questionText);
  }

  private normalizeQuestionText(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isDuplicateQuestion(
    candidate: string,
    existingTexts: string[],
    normalizedExisting: Set<string>,
  ) {
    const normalizedCandidate = this.normalizeQuestionText(candidate);
    if (!normalizedCandidate) {
      return true;
    }

    if (normalizedExisting.has(normalizedCandidate)) {
      return true;
    }

    const candidateTokens = this.tokenSet(normalizedCandidate);
    for (const text of existingTexts) {
      const existingTokens = this.tokenSet(this.normalizeQuestionText(text));
      if (this.similarity(candidateTokens, existingTokens) >= 0.82) {
        return true;
      }
    }

    return false;
  }

  private tokenSet(normalizedText: string) {
    return new Set(normalizedText.split(' ').filter(Boolean));
  }

  private similarity(a: Set<string>, b: Set<string>) {
    if (a.size === 0 || b.size === 0) {
      return 0;
    }
    let intersection = 0;
    for (const token of a) {
      if (b.has(token)) {
        intersection++;
      }
    }
    const union = a.size + b.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  private toMetadataDifficulty(difficulty: number) {
    return Math.max(1, Math.min(10, Math.round(difficulty * 2)));
  }

  private trimText(text: string, maxLength: number) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) : text;
  }

  private async extractTextFromUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) return '';

      const buffer = Buffer.from(await response.arrayBuffer());
      const pathname = new URL(url).pathname.toLowerCase();

      if (pathname.endsWith('.pdf')) {
        return this.trimText(await this.extractPdfText(buffer), 2500);
      }

      if (pathname.endsWith('.docx')) {
        const parsed = await mammoth.extractRawText({ buffer });
        return this.trimText(parsed.value || '', 2500);
      }

      if (pathname.endsWith('.pptx') || pathname.endsWith('.ppt')) {
        // V1: keep ppt/pptx as URL evidence if parser is not available.
        return `Nội dung trình chiếu tham chiếu từ: ${url}`;
      }

      return '';
    } catch {
      return '';
    }
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    const pdfModule = (await import('pdf-parse')) as {
      default?: (data: Buffer) => Promise<{ text?: string }>;
    };
    const parseFn = pdfModule.default;
    if (!parseFn) return '';
    const parsed = await parseFn(buffer);
    return parsed?.text || '';
  }
}
