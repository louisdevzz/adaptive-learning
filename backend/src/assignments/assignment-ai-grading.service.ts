import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, asc, desc, eq, inArray, lt } from 'drizzle-orm';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import {
  db,
  assignmentGradingRuns,
  assignments,
  studentAssignments,
} from '../../db';
import { createChatModel } from '../common/ai/chat-model.factory';

type AssignmentType =
  | 'practice'
  | 'quiz'
  | 'exam'
  | 'homework'
  | 'test'
  | 'adaptive';

interface AiSuggestion {
  suggestedScore: number;
  feedback: string;
  criteriaBreakdown: unknown;
  confidence: number;
}

@Injectable()
export class AssignmentAiGradingService {
  private readonly logger = new Logger(AssignmentAiGradingService.name);
  private readonly maxRunsPerTick = 5;
  private readonly maxRetry = 2;
  private readonly staleProcessingMinutes = 10;

  async enqueueRun(studentAssignmentId: string) {
    const [created] = await db
      .insert(assignmentGradingRuns)
      .values({
        studentAssignmentId,
        status: 'pending',
      })
      .returning();

    return created;
  }

  async requeueRun(studentAssignmentId: string) {
    return this.enqueueRun(studentAssignmentId);
  }

  async getLatestRun(studentAssignmentId: string) {
    const rows = await db
      .select()
      .from(assignmentGradingRuns)
      .where(eq(assignmentGradingRuns.studentAssignmentId, studentAssignmentId))
      .orderBy(desc(assignmentGradingRuns.createdAt))
      .limit(1);

    return rows[0] ?? null;
  }

  async getLatestRunsByStudentAssignmentIds(studentAssignmentIds: string[]) {
    if (studentAssignmentIds.length === 0) return new Map<string, any>();

    const rows = await db
      .select()
      .from(assignmentGradingRuns)
      .where(
        inArray(
          assignmentGradingRuns.studentAssignmentId,
          studentAssignmentIds,
        ),
      )
      .orderBy(
        desc(assignmentGradingRuns.createdAt),
        desc(assignmentGradingRuns.id),
      );

    const latestByStudentAssignmentId = new Map<string, any>();
    for (const row of rows) {
      if (!latestByStudentAssignmentId.has(row.studentAssignmentId)) {
        latestByStudentAssignmentId.set(row.studentAssignmentId, row);
      }
    }

    return latestByStudentAssignmentId;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingRuns() {
    await this.recoverStaleRuns();

    const pendingRuns = await db
      .select()
      .from(assignmentGradingRuns)
      .where(eq(assignmentGradingRuns.status, 'pending'))
      .orderBy(asc(assignmentGradingRuns.createdAt))
      .limit(this.maxRunsPerTick);

    for (const run of pendingRuns) {
      await this.processRunIfClaimed(run.id);
    }
  }

  private async processRunIfClaimed(runId: string) {
    const [claimed] = await db
      .update(assignmentGradingRuns)
      .set({
        status: 'processing',
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
      })
      .where(
        and(
          eq(assignmentGradingRuns.id, runId),
          eq(assignmentGradingRuns.status, 'pending'),
        ),
      )
      .returning();

    if (!claimed) {
      return;
    }

    try {
      await this.processRun(claimed.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown grading error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `AI grading run ${claimed.id} failed: ${message}`,
        stack,
      );
      await this.markRunFailed(claimed.id, message);
    }
  }

  private async recoverStaleRuns() {
    const staleThreshold = new Date(
      Date.now() - this.staleProcessingMinutes * 60 * 1000,
    );

    const staleRuns = await db
      .select()
      .from(assignmentGradingRuns)
      .where(
        and(
          eq(assignmentGradingRuns.status, 'processing'),
          lt(assignmentGradingRuns.startedAt, staleThreshold),
        ),
      );

    for (const stale of staleRuns) {
      if (stale.retryCount < this.maxRetry) {
        await db
          .update(assignmentGradingRuns)
          .set({
            status: 'pending',
            retryCount: stale.retryCount + 1,
            startedAt: null,
            completedAt: null,
            errorMessage: 'Processing timeout, retrying',
          })
          .where(eq(assignmentGradingRuns.id, stale.id));
      } else {
        await this.markRunFailed(stale.id, 'Processing timeout');
      }
    }
  }

  private async processRun(runId: string) {
    const contextRows = await db
      .select({
        runId: assignmentGradingRuns.id,
        studentAssignmentId: assignmentGradingRuns.studentAssignmentId,
        assignmentType: assignments.assignmentType,
        gradingRubric: assignments.gradingRubric,
        submissionUrl: studentAssignments.submissionUrl,
        submissionMimeType: studentAssignments.submissionMimeType,
        submissionStatus: studentAssignments.status,
      })
      .from(assignmentGradingRuns)
      .innerJoin(
        studentAssignments,
        eq(assignmentGradingRuns.studentAssignmentId, studentAssignments.id),
      )
      .innerJoin(
        assignments,
        eq(studentAssignments.assignmentId, assignments.id),
      )
      .where(eq(assignmentGradingRuns.id, runId))
      .limit(1);

    const context = contextRows[0];
    if (!context) {
      throw new Error('Grading run context not found');
    }

    if (!context.submissionUrl) {
      throw new Error('Submission file URL is missing');
    }

    if (
      context.submissionStatus !== 'submitted' &&
      context.submissionStatus !== 'graded'
    ) {
      throw new Error('Submission is not in a gradable state');
    }

    this.assertAllowedSubmissionUrl(context.submissionUrl);

    const extractedText = await this.extractSubmissionText(
      context.submissionUrl,
      context.submissionMimeType,
    );
    const normalizedText = this.normalizeText(extractedText);

    if (!normalizedText) {
      throw new Error('Could not extract text from submission');
    }

    const rubricUsed =
      context.gradingRubric?.trim() ||
      this.getDefaultRubric(context.assignmentType as AssignmentType);

    const { provider, model, chatModel } = createChatModel({
      temperature: 0.2,
    });

    const prompt = this.buildGradingPrompt(rubricUsed, normalizedText);
    const response = await chatModel.invoke([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    const suggestion = this.parseSuggestion(response.content);

    await db
      .update(assignmentGradingRuns)
      .set({
        status: 'completed',
        provider,
        model,
        rubricUsed,
        extractedText: normalizedText.slice(0, 12000),
        suggestedScore: suggestion.suggestedScore,
        feedback: suggestion.feedback,
        criteriaBreakdown: suggestion.criteriaBreakdown as any,
        confidence: suggestion.confidence,
        errorMessage: null,
        completedAt: new Date(),
      })
      .where(eq(assignmentGradingRuns.id, runId));
  }

  private async markRunFailed(runId: string, errorMessage: string) {
    await db
      .update(assignmentGradingRuns)
      .set({
        status: 'failed',
        errorMessage: errorMessage.slice(0, 1000),
        completedAt: new Date(),
      })
      .where(eq(assignmentGradingRuns.id, runId));
  }

  private assertAllowedSubmissionUrl(url: string) {
    const publicUrl = process.env.R2_PUBLIC_URL?.trim();
    if (!publicUrl) {
      throw new Error('R2_PUBLIC_URL is not configured');
    }

    let expectedBase: URL;
    let submittedUrl: URL;
    try {
      expectedBase = new URL(publicUrl);
    } catch {
      throw new Error('R2_PUBLIC_URL is invalid');
    }

    try {
      submittedUrl = new URL(url);
    } catch {
      throw new Error('Submission URL is invalid');
    }

    if (submittedUrl.origin !== expectedBase.origin) {
      throw new Error('Submission URL is not allowed');
    }

    const expectedPath = expectedBase.pathname.replace(/\/?$/, '/');
    const submittedPath = submittedUrl.pathname;

    if (expectedPath !== '/' && !submittedPath.startsWith(expectedPath)) {
      throw new Error('Submission URL is not allowed');
    }
  }

  private async extractSubmissionText(url: string, mimeType?: string | null) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download submission file (${response.status})`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const effectiveMime = (mimeType || '').toLowerCase();
    const path = new URL(url).pathname.toLowerCase();

    if (effectiveMime.includes('pdf') || path.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      return parsed.text || '';
    }

    if (
      effectiveMime.includes(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ) ||
      path.endsWith('.docx')
    ) {
      const parsed = await mammoth.extractRawText({ buffer });
      return parsed.value || '';
    }

    throw new Error(
      'Unsupported submission file format. Only PDF and DOCX are supported',
    );
  }

  private normalizeText(rawText: string) {
    return rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private buildGradingPrompt(rubric: string, submissionText: string) {
    return `Bạn là trợ lý chấm bài tự luận cho học sinh.

Nhiệm vụ:
1) Chấm bài theo thang điểm 0 đến 10.
2) Áp dụng rubric bên dưới.
3) Trả về JSON hợp lệ và CHỈ JSON.

Rubric:
${rubric}

Nội dung bài làm:
"""
${submissionText}
"""

Yêu cầu JSON output:
{
  "suggestedScore": number, // từ 0 đến 10
  "feedback": string, // nhận xét ngắn gọn, hành động cụ thể để cải thiện
  "criteriaBreakdown": [
    {
      "criterion": string,
      "score": number,
      "maxScore": number,
      "comment": string
    }
  ],
  "confidence": number // từ 0 đến 100
}`;
  }

  private parseSuggestion(content: unknown): AiSuggestion {
    const text = this.extractTextContent(content);
    if (!text) {
      throw new Error('AI response is empty');
    }

    const jsonText = this.extractJsonText(text);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error(`AI response is not valid JSON: ${text.slice(0, 200)}`);
    }

    if (typeof parsed.feedback !== 'string' || !parsed.feedback.trim()) {
      throw new Error('AI response missing feedback');
    }

    const score = Number(parsed.suggestedScore);
    if (!Number.isFinite(score)) {
      throw new Error('AI response missing suggestedScore');
    }

    const rawConfidence = Number(parsed.confidence);
    const confidence = Number.isFinite(rawConfidence)
      ? rawConfidence <= 1
        ? Math.round(rawConfidence * 100)
        : Math.round(rawConfidence)
      : 50;

    return {
      suggestedScore: Math.max(0, Math.min(10, Number(score.toFixed(2)))),
      feedback: parsed.feedback.trim(),
      criteriaBreakdown: parsed.criteriaBreakdown ?? [],
      confidence: Math.max(0, Math.min(100, confidence)),
    };
  }

  private extractTextContent(content: unknown) {
    if (typeof content === 'string') return content;

    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (
            part &&
            typeof part === 'object' &&
            'text' in part &&
            typeof (part as { text?: unknown }).text === 'string'
          ) {
            return (part as { text: string }).text;
          }
          return '';
        })
        .join('\n')
        .trim();
    }

    return '';
  }

  private extractJsonText(text: string) {
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (markdownMatch) {
      return markdownMatch[1];
    }

    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0];
    }

    return text;
  }

  private getDefaultRubric(assignmentType: AssignmentType) {
    const titleByType: Record<AssignmentType, string> = {
      practice: 'Rubric luyện tập',
      quiz: 'Rubric quiz',
      exam: 'Rubric kiểm tra',
      homework: 'Rubric bài tập về nhà',
      test: 'Rubric test',
      adaptive: 'Rubric adaptive',
    };

    return `${titleByType[assignmentType]} (thang 10):
- Hiểu đúng yêu cầu và khái niệm: 0-3 điểm
- Lập luận, phương pháp giải, tính logic: 0-4 điểm
- Độ chính xác kết quả và trình bày: 0-2 điểm
- Diễn đạt rõ ràng, dùng thuật ngữ phù hợp: 0-1 điểm`;
  }
}
