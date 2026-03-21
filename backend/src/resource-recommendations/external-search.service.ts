import { Injectable, Logger } from '@nestjs/common';

interface ExternalSearchParams {
  kpTitle: string;
  dominantStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
}

interface ExternalSearchResult {
  resourceType: 'video' | 'article' | 'interactive' | 'quiz' | 'other';
  url: string;
  title: string;
  source: string;
  language: string;
  relevanceScore: number;
  metadata: Record<string, unknown>;
}

@Injectable()
export class ExternalSearchService {
  private readonly logger = new Logger(ExternalSearchService.name);

  async searchExternalResources(
    params: ExternalSearchParams,
  ): Promise<ExternalSearchResult[]> {
    const { kpTitle, dominantStyle } = params;
    const query = this.buildVietnameseQuery(kpTitle, dominantStyle);

    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      return this.fallbackResources(kpTitle);
    }

    try {
      const response = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          query,
          numResults: 10,
          useAutoprompt: true,
          type: 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error(`Exa search failed with ${response.status}`);
      }

      const payload = (await response.json()) as {
        results?: Array<{
          title?: string;
          url?: string;
          score?: number;
          publishedDate?: string;
        }>;
      };

      const results = payload.results || [];
      if (results.length === 0) {
        return this.fallbackResources(kpTitle);
      }

      return results
        .filter((item) => item.url)
        .map((item, index) => {
          const resourceType = this.inferResourceType(item.url || '', item.title || '');
          return {
            resourceType,
            url: item.url || '',
            title: item.title || `Tài liệu ${kpTitle}`,
            source: 'exa',
            language: 'vi',
            relevanceScore: this.normalizeScore(item.score, index),
            metadata: {
              publishedDate: item.publishedDate || null,
              query,
            },
          } as ExternalSearchResult;
        });
    } catch (error) {
      this.logger.warn(
        `External search failed, fallback to static suggestions: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return this.fallbackResources(kpTitle);
    }
  }

  private buildVietnameseQuery(
    kpTitle: string,
    dominantStyle: ExternalSearchParams['dominantStyle'],
  ) {
    const styleHint: Record<ExternalSearchParams['dominantStyle'], string> = {
      visual: 'video minh hoạ sơ đồ',
      auditory: 'bài giảng thuyết minh',
      reading: 'bài viết tài liệu pdf',
      kinesthetic: 'bài tập thực hành tương tác',
    };

    return `${kpTitle} bài giảng bài tập video tiếng Việt ${styleHint[dominantStyle]}`;
  }

  private inferResourceType(url: string, title: string): ExternalSearchResult['resourceType'] {
    const text = `${url} ${title}`.toLowerCase();

    if (text.includes('youtube') || text.includes('video')) {
      return 'video';
    }
    if (text.includes('quiz') || text.includes('trắc nghiệm')) {
      return 'quiz';
    }
    if (text.includes('interactive') || text.includes('game') || text.includes('practice')) {
      return 'interactive';
    }
    if (text.includes('pdf') || text.includes('article') || text.includes('wiki')) {
      return 'article';
    }

    return 'other';
  }

  private normalizeScore(score: number | undefined, index: number) {
    if (typeof score === 'number') {
      if (score <= 1) {
        return Math.round(score * 100);
      }
      return Math.round(score);
    }

    return Math.max(40, 95 - index * 7);
  }

  private fallbackResources(kpTitle: string): ExternalSearchResult[] {
    const encoded = encodeURIComponent(kpTitle);

    return [
      {
        resourceType: 'video',
        url: `https://www.youtube.com/results?search_query=${encoded}+b%C3%A0i+gi%E1%BA%A3ng`,
        title: `Video bài giảng về ${kpTitle}`,
        source: 'fallback',
        language: 'vi',
        relevanceScore: 75,
        metadata: { fallback: true },
      },
      {
        resourceType: 'article',
        url: `https://www.google.com/search?q=${encoded}+t%C3%A0i+li%E1%BB%87u`,
        title: `Tài liệu đọc thêm về ${kpTitle}`,
        source: 'fallback',
        language: 'vi',
        relevanceScore: 68,
        metadata: { fallback: true },
      },
      {
        resourceType: 'interactive',
        url: `https://www.google.com/search?q=${encoded}+b%C3%A0i+t%E1%BA%ADp+th%E1%BB%B1c+h%C3%A0nh`,
        title: `Bài tập thực hành ${kpTitle}`,
        source: 'fallback',
        language: 'vi',
        relevanceScore: 64,
        metadata: { fallback: true },
      },
    ];
  }
}
