import { Injectable, Logger } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import {
  db,
  studentInsights,
  students,
  studentLearningProfiles,
  users,
} from '../../db';
import { createChatModel } from '../common/ai/chat-model.factory';
import { LearningProfileService } from '../learning-profile/learning-profile.service';

interface SuggestedIntervention {
  title: string;
  actions: string[];
  kpIds: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class InterventionAiService {
  private readonly logger = new Logger(InterventionAiService.name);

  constructor(private readonly learningProfileService: LearningProfileService) {}

  async getSuggestions(teacherId: string, studentId: string) {
    await this.learningProfileService.assertTeacherCanAccessStudent(
      teacherId,
      studentId,
    );

    const [student] = await db
      .select({ fullName: users.fullName })
      .from(students)
      .innerJoin(users, eq(students.id, users.id))
      .where(eq(students.id, studentId))
      .limit(1);

    const [insight] = await db
      .select({
        strengths: studentInsights.strengths,
        weaknesses: studentInsights.weaknesses,
        riskKps: studentInsights.riskKps,
        learningPattern: studentInsights.learningPattern,
        engagementScore: studentInsights.engagementScore,
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
        learningMemory: studentLearningProfiles.learningMemory,
      })
      .from(studentLearningProfiles)
      .where(eq(studentLearningProfiles.studentId, studentId))
      .limit(1);

    try {
      const { chatModel } = createChatModel({ temperature: 0.3 });
      const response = await chatModel.invoke([
        {
          role: 'system',
          content:
            'Bạn là trợ lý can thiệp giáo dục. Trả về JSON hợp lệ theo dạng mảng 3 phần tử, mỗi phần tử gồm: title, actions(string[]), kpIds(string[]), priority(low|medium|high|critical). Ngôn ngữ tiếng Việt, cụ thể, thực thi được.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            studentName: student?.fullName || 'Học sinh',
            insight: insight || null,
            learningProfile: profile || null,
          }),
        },
      ]);

      const raw =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      const parsed = JSON.parse(raw) as SuggestedIntervention[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          studentId,
          source: 'ai',
          suggestions: parsed.slice(0, 3),
        };
      }
    } catch (error) {
      this.logger.warn(
        `Failed to generate AI intervention suggestions: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    return {
      studentId,
      source: 'fallback',
      suggestions: this.buildFallbackSuggestions(insight),
    };
  }

  private buildFallbackSuggestions(insight?: {
    weaknesses?: unknown;
    riskKps?: unknown;
    engagementScore?: number;
  }) {
    const weaknesses = Array.isArray(insight?.weaknesses) ? insight?.weaknesses : [];
    const riskKps = Array.isArray(insight?.riskKps) ? insight?.riskKps : [];

    const topWeakKpIds = weaknesses
      .slice(0, 2)
      .map((item) =>
        item && typeof item === 'object' && 'kpId' in item
          ? String((item as { kpId: unknown }).kpId)
          : '',
      )
      .filter((value) => value.length > 0);

    const topRiskKpIds = riskKps
      .slice(0, 2)
      .map((item) =>
        item && typeof item === 'object' && 'kpId' in item
          ? String((item as { kpId: unknown }).kpId)
          : '',
      )
      .filter((value) => value.length > 0);

    return [
      {
        title: 'Tăng cường luyện tập theo điểm yếu',
        actions: [
          'Giao 3-5 bài tập ngắn tập trung vào các KP yếu nhất',
          'Kiểm tra nhanh sau mỗi buổi để đo mức cải thiện',
        ],
        kpIds: topWeakKpIds,
        priority: 'high' as const,
      },
      {
        title: 'Can thiệp theo KP rủi ro',
        actions: [
          'Dành 10 phút cuối giờ để ôn lại các KP có nguy cơ',
          'Sử dụng tài liệu đa dạng (video + bài tập) cho cùng KP',
        ],
        kpIds: topRiskKpIds,
        priority: 'medium' as const,
      },
      {
        title: 'Theo dõi tương tác học tập',
        actions: [
          'Thiết lập mục tiêu tuần và check-in giữa tuần với học sinh',
          'Phối hợp phụ huynh để đảm bảo lịch học ổn định',
        ],
        kpIds: [],
        priority:
          (insight?.engagementScore || 0) < 30 ? ('critical' as const) : ('medium' as const),
      },
    ];
  }
}
