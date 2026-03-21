import { ResourceRankingService } from './resource-ranking.service';

describe('ResourceRankingService', () => {
  const service = new ResourceRankingService();

  it('should prioritize resource with better final score', () => {
    const ranked = service.rankResources(
      [
        {
          id: 'r1',
          kpId: 'k1',
          resourceType: 'video',
          url: 'https://a',
          title: 'Video A',
          source: 'exa',
          language: 'vi',
          relevanceScore: 90,
        },
        {
          id: 'r2',
          kpId: 'k1',
          resourceType: 'article',
          url: 'https://b',
          title: 'Article B',
          source: 'exa',
          language: 'vi',
          relevanceScore: 50,
        },
      ],
      {
        dominantStyle: 'visual',
        pacePreference: 'moderate',
      },
      new Map([
        ['r1', { viewedCount: 10, helpfulCount: 8 }],
        ['r2', { viewedCount: 10, helpfulCount: 2 }],
      ]),
    );

    expect(ranked[0].id).toBe('r1');
    expect(ranked[0].finalScore).toBeGreaterThan(ranked[1].finalScore);
  });

  it('should map learning style score for video/auditory as 0.8', () => {
    const score = service.computeLearningStyleMatch('video', 'auditory');
    expect(score).toBe(0.8);
  });

  it('should use formula finalScore = 0.4 style + 0.3 history + 0.2 relevance + 0.1 pace', () => {
    const ranked = service.rankResources(
      [
        {
          id: 'r1',
          kpId: 'k1',
          resourceType: 'video',
          url: 'https://a',
          title: 'Video A',
          source: 'exa',
          language: 'vi',
          relevanceScore: 100,
        },
      ],
      {
        dominantStyle: 'visual',
        pacePreference: 'slow',
      },
      new Map([['r1', { viewedCount: 10, helpfulCount: 5 }]]),
    );

    // 0.4*1.0 + 0.3*0.5 + 0.2*1.0 + 0.1*0.9 = 0.84
    expect(ranked[0].finalScore).toBeCloseTo(0.84, 3);
  });
});
