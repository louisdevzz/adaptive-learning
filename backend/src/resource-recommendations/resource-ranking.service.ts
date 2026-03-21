import { Injectable } from '@nestjs/common';

export interface RankedResource {
  id: string;
  kpId: string;
  resourceType: 'video' | 'article' | 'interactive' | 'quiz' | 'other';
  url: string;
  title: string;
  source: string;
  language: string;
  relevanceScore: number;
  metadata: Record<string, unknown>;
  learningStyleMatch: number;
  historicalEffectiveness: number;
  paceScore: number;
  finalScore: number;
}

interface ResourceInput {
  id: string;
  kpId: string;
  resourceType: 'video' | 'article' | 'interactive' | 'quiz' | 'other';
  url: string;
  title: string;
  source: string;
  language: string;
  relevanceScore: number;
  metadata?: Record<string, unknown>;
}

interface ProfileInput {
  dominantStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  pacePreference: 'slow' | 'moderate' | 'fast';
}

interface EffectivenessStat {
  viewedCount: number;
  helpfulCount: number;
}

@Injectable()
export class ResourceRankingService {
  rankResources(
    resources: ResourceInput[],
    profile: ProfileInput,
    effectivenessMap: Map<string, EffectivenessStat>,
  ): RankedResource[] {
    return resources
      .map((resource) => {
        const styleMatch = this.computeLearningStyleMatch(
          resource.resourceType,
          profile.dominantStyle,
        );

        const historical = this.computeHistoricalEffectiveness(
          effectivenessMap.get(resource.id),
        );

        const paceScore = this.computePaceScore(
          resource.resourceType,
          profile.pacePreference,
        );

        const relevance = this.normalizeRelevance(resource.relevanceScore);

        const finalScore =
          styleMatch * 0.4 +
          historical * 0.3 +
          relevance * 0.2 +
          paceScore * 0.1;

        return {
          ...resource,
          metadata: resource.metadata || {},
          learningStyleMatch: styleMatch,
          historicalEffectiveness: historical,
          paceScore,
          finalScore: Number(finalScore.toFixed(4)),
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  computeLearningStyleMatch(
    resourceType: ResourceInput['resourceType'],
    dominantStyle: ProfileInput['dominantStyle'],
  ) {
    const matrix: Record<
      ResourceInput['resourceType'],
      Record<ProfileInput['dominantStyle'], number>
    > = {
      video: {
        visual: 1.0,
        auditory: 0.8,
        reading: 0.3,
        kinesthetic: 0.6,
      },
      article: {
        visual: 0.5,
        auditory: 0.3,
        reading: 1.0,
        kinesthetic: 0.4,
      },
      interactive: {
        visual: 0.7,
        auditory: 0.5,
        reading: 0.4,
        kinesthetic: 1.0,
      },
      quiz: {
        visual: 0.6,
        auditory: 0.4,
        reading: 0.6,
        kinesthetic: 0.8,
      },
      other: {
        visual: 0.5,
        auditory: 0.5,
        reading: 0.5,
        kinesthetic: 0.5,
      },
    };

    return matrix[resourceType]?.[dominantStyle] ?? 0.5;
  }

  computeHistoricalEffectiveness(stat?: EffectivenessStat) {
    if (!stat || stat.viewedCount <= 0) {
      return 0.5;
    }

    return Math.max(0, Math.min(1, stat.helpfulCount / stat.viewedCount));
  }

  computePaceScore(
    resourceType: ResourceInput['resourceType'],
    pacePreference: ProfileInput['pacePreference'],
  ) {
    const matrix: Record<
      ProfileInput['pacePreference'],
      Record<ResourceInput['resourceType'], number>
    > = {
      slow: {
        video: 0.9,
        article: 0.8,
        interactive: 0.6,
        quiz: 0.5,
        other: 0.6,
      },
      moderate: {
        video: 0.8,
        article: 0.8,
        interactive: 0.8,
        quiz: 0.8,
        other: 0.7,
      },
      fast: {
        video: 0.7,
        article: 0.6,
        interactive: 0.9,
        quiz: 1.0,
        other: 0.7,
      },
    };

    return matrix[pacePreference]?.[resourceType] ?? 0.7;
  }

  private normalizeRelevance(score: number) {
    if (score <= 1) {
      return Math.max(0, score);
    }

    return Math.max(0, Math.min(1, score / 100));
  }
}
