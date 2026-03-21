import {
  computeStrengths,
  computeWeaknesses,
  computeRiskKps,
  computeLearningPattern,
  computeEngagementScore,
  computeInsights,
  KpProgressData,
  KpHistoryRecord,
  AttemptData,
} from './student-insights-analyzer';

const now = new Date('2026-03-21T12:00:00Z');

function makeProgress(
  kpId: string,
  masteryScore: number,
  totalAttempts: number,
  lastUpdatedDaysAgo = 0,
): KpProgressData {
  return {
    kpId,
    kpTitle: `KP ${kpId}`,
    masteryScore,
    totalAttempts,
    lastUpdated: new Date(
      now.getTime() - lastUpdatedDaysAgo * 24 * 60 * 60 * 1000,
    ),
  };
}

describe('computeStrengths', () => {
  it('should return KPs with mastery >= 80', () => {
    const data = [
      makeProgress('a', 90, 5),
      makeProgress('b', 50, 5),
      makeProgress('c', 85, 3),
    ];
    const result = computeStrengths(data);
    expect(result).toHaveLength(2);
    expect(result[0].kpId).toBe('a');
    expect(result[1].kpId).toBe('c');
  });

  it('should return empty array when no strengths', () => {
    const data = [makeProgress('a', 50, 5)];
    expect(computeStrengths(data)).toHaveLength(0);
  });
});

describe('computeWeaknesses', () => {
  it('should return KPs with mastery < 60 and >= 3 attempts', () => {
    const data = [
      makeProgress('a', 30, 5),
      makeProgress('b', 55, 3),
      makeProgress('c', 40, 2), // Not enough attempts
      makeProgress('d', 80, 10),
    ];
    const result = computeWeaknesses(data);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.kpId)).toEqual(['a', 'b']);
  });
});

describe('computeRiskKps', () => {
  it('should detect score decline > 15 in 7 days', () => {
    const progress = [makeProgress('a', 40, 5)];
    const history: KpHistoryRecord[] = [
      {
        kpId: 'a',
        oldScore: 50,
        newScore: 60,
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        kpId: 'a',
        oldScore: 60,
        newScore: 40,
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];
    const risks = computeRiskKps(progress, history, now);
    expect(risks).toHaveLength(1);
    expect(risks[0].riskType).toBe('score_decline');
  });

  it('should detect stale low mastery', () => {
    const progress = [makeProgress('a', 30, 5, 7)]; // Last updated 7 days ago
    const risks = computeRiskKps(progress, [], now);
    expect(risks).toHaveLength(1);
    expect(risks[0].riskType).toBe('stale_low_mastery');
  });

  it('should not flag active high-mastery KPs', () => {
    const progress = [makeProgress('a', 85, 10, 0)];
    expect(computeRiskKps(progress, [], now)).toHaveLength(0);
  });
});

describe('computeLearningPattern', () => {
  it('should return stable for empty attempts', () => {
    const result = computeLearningPattern([]);
    expect(result.velocityTrend).toBe('stable');
    expect(result.avgTimePerQuestion).toBe(0);
  });

  it('should detect improving trend', () => {
    const attempts: AttemptData[] = [
      // Older half: mostly wrong
      ...[1, 2, 3, 4].map((i) => ({
        attemptTime: new Date(now.getTime() - (10 - i) * 24 * 60 * 60 * 1000),
        timeSpent: 30,
        isCorrect: false,
      })),
      // Newer half: mostly correct
      ...[5, 6, 7, 8].map((i) => ({
        attemptTime: new Date(now.getTime() - (10 - i) * 24 * 60 * 60 * 1000),
        timeSpent: 25,
        isCorrect: true,
      })),
    ];
    const result = computeLearningPattern(attempts);
    expect(result.velocityTrend).toBe('improving');
  });

  it('should compute avg time per question', () => {
    const attempts: AttemptData[] = [
      { attemptTime: now, timeSpent: 20, isCorrect: true },
      { attemptTime: now, timeSpent: 40, isCorrect: false },
    ];
    expect(computeLearningPattern(attempts).avgTimePerQuestion).toBe(30);
  });
});

describe('computeEngagementScore', () => {
  it('should return 0 for no activity', () => {
    expect(computeEngagementScore(0, 0, 0)).toBe(0);
  });

  it('should return 100 for max activity', () => {
    expect(computeEngagementScore(30, 300, 100)).toBe(100);
  });

  it('should cap at 100', () => {
    expect(computeEngagementScore(100, 1000, 100)).toBe(100);
  });
});

describe('computeInsights', () => {
  it('should produce complete insights', () => {
    const progress = [
      makeProgress('a', 90, 10),
      makeProgress('b', 30, 5),
      makeProgress('c', 45, 4, 7),
    ];
    const history: KpHistoryRecord[] = [];
    const attempts: AttemptData[] = [
      { attemptTime: now, timeSpent: 30, isCorrect: true },
    ];

    const result = computeInsights(progress, history, attempts, 60, now);

    expect(result.strengths).toHaveLength(1);
    expect(result.weaknesses).toHaveLength(2);
    expect(result.riskKps.length).toBeGreaterThanOrEqual(0);
    expect(result.learningPattern).toBeDefined();
    expect(result.engagementScore).toBeGreaterThanOrEqual(0);
    expect(result.engagementScore).toBeLessThanOrEqual(100);
  });
});
