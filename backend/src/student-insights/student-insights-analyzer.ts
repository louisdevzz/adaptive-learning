/**
 * Pure computation module for student insights analysis.
 * No database or AI dependencies — takes data in, returns analysis out.
 */

export interface KpProgressData {
  kpId: string;
  kpTitle: string;
  masteryScore: number;
  lastUpdated: Date;
  totalAttempts: number;
}

export interface KpHistoryRecord {
  kpId: string;
  oldScore: number;
  newScore: number;
  timestamp: Date;
}

export interface AttemptData {
  attemptTime: Date;
  timeSpent: number;
  isCorrect: boolean;
}

export interface TimeOnTaskData {
  timeSpentSeconds: number;
  computedAt: Date;
}

export interface StrengthWeakness {
  kpId: string;
  kpTitle: string;
  masteryScore: number;
  reason?: string; // Filled by AI enrichment
}

export interface RiskKp {
  kpId: string;
  kpTitle: string;
  masteryScore: number;
  riskType: 'score_decline' | 'stale_low_mastery';
}

export interface LearningPattern {
  avgTimePerQuestion: number; // seconds
  velocityTrend: 'improving' | 'declining' | 'stable';
  consistencyScore: number; // 0-100
}

export interface InsightsResult {
  strengths: StrengthWeakness[];
  weaknesses: StrengthWeakness[];
  riskKps: RiskKp[];
  learningPattern: LearningPattern;
  engagementScore: number;
}

/**
 * Compute strengths: KPs with masteryScore >= 80
 */
export function computeStrengths(
  progressData: KpProgressData[],
): StrengthWeakness[] {
  return progressData
    .filter((p) => p.masteryScore >= 80)
    .sort((a, b) => b.masteryScore - a.masteryScore)
    .map((p) => ({
      kpId: p.kpId,
      kpTitle: p.kpTitle,
      masteryScore: p.masteryScore,
    }));
}

/**
 * Compute weaknesses: KPs with masteryScore < 60 AND >= 3 attempts
 */
export function computeWeaknesses(
  progressData: KpProgressData[],
): StrengthWeakness[] {
  return progressData
    .filter((p) => p.masteryScore < 60 && p.totalAttempts >= 3)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .map((p) => ({
      kpId: p.kpId,
      kpTitle: p.kpTitle,
      masteryScore: p.masteryScore,
    }));
}

/**
 * Compute risk KPs:
 * - Score decline > 15 points in 7 days
 * - Low mastery (< 50) + no activity for 5+ days
 */
export function computeRiskKps(
  progressData: KpProgressData[],
  historyRecords: KpHistoryRecord[],
  now: Date = new Date(),
): RiskKp[] {
  const risks: RiskKp[] = [];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Group history by kpId
  const historyByKp = new Map<string, KpHistoryRecord[]>();
  for (const record of historyRecords) {
    const records = historyByKp.get(record.kpId) || [];
    records.push(record);
    historyByKp.set(record.kpId, records);
  }

  for (const progress of progressData) {
    const kpHistory = historyByKp.get(progress.kpId) || [];

    // Check for score decline > 15 in 7 days
    const recentHistory = kpHistory.filter(
      (h) => new Date(h.timestamp) >= sevenDaysAgo,
    );
    if (recentHistory.length >= 2) {
      const sortedByTime = [...recentHistory].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      const earliest = sortedByTime[0];
      const latest = sortedByTime[sortedByTime.length - 1];
      if (earliest.newScore - latest.newScore > 15) {
        risks.push({
          kpId: progress.kpId,
          kpTitle: progress.kpTitle,
          masteryScore: progress.masteryScore,
          riskType: 'score_decline',
        });
        continue;
      }
    }

    // Check for stale low mastery
    if (
      progress.masteryScore < 50 &&
      new Date(progress.lastUpdated) < fiveDaysAgo
    ) {
      risks.push({
        kpId: progress.kpId,
        kpTitle: progress.kpTitle,
        masteryScore: progress.masteryScore,
        riskType: 'stale_low_mastery',
      });
    }
  }

  return risks;
}

/**
 * Compute learning pattern from attempt data
 */
export function computeLearningPattern(
  attempts: AttemptData[],
): LearningPattern {
  if (attempts.length === 0) {
    return {
      avgTimePerQuestion: 0,
      velocityTrend: 'stable',
      consistencyScore: 0,
    };
  }

  // Average time per question
  const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
  const avgTimePerQuestion = Math.round(totalTime / attempts.length);

  // Velocity trend: compare accuracy of recent half vs older half
  const sorted = [...attempts].sort(
    (a, b) =>
      new Date(a.attemptTime).getTime() - new Date(b.attemptTime).getTime(),
  );
  const midpoint = Math.floor(sorted.length / 2);

  let velocityTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (sorted.length >= 4) {
    const olderHalf = sorted.slice(0, midpoint);
    const newerHalf = sorted.slice(midpoint);

    const olderAccuracy =
      olderHalf.filter((a) => a.isCorrect).length / olderHalf.length;
    const newerAccuracy =
      newerHalf.filter((a) => a.isCorrect).length / newerHalf.length;

    const diff = newerAccuracy - olderAccuracy;
    if (diff > 0.1) velocityTrend = 'improving';
    else if (diff < -0.1) velocityTrend = 'declining';
  }

  // Consistency score: how regularly the student practices
  // Based on standard deviation of daily attempt counts over last 14 days
  const consistencyScore = computeConsistencyScore(attempts);

  return { avgTimePerQuestion, velocityTrend, consistencyScore };
}

function computeConsistencyScore(attempts: AttemptData[]): number {
  if (attempts.length < 2) return 0;

  // Count attempts per day over last 14 days
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentAttempts = attempts.filter(
    (a) => new Date(a.attemptTime) >= fourteenDaysAgo,
  );

  if (recentAttempts.length === 0) return 0;

  // Count how many of the 14 days had activity
  const activeDays = new Set(
    recentAttempts.map((a) =>
      new Date(a.attemptTime).toISOString().split('T')[0],
    ),
  );

  // Consistency = (active days / 14) * 100
  return Math.round((activeDays.size / 14) * 100);
}

/**
 * Compute engagement score: weighted composite
 * - Recent attempts (40%)
 * - Study minutes (30%)
 * - Streak / consistency (30%)
 */
export function computeEngagementScore(
  recentAttemptCount: number,
  recentStudyMinutes: number,
  consistencyScore: number,
): number {
  // Normalize each component to 0-100
  const attemptScore = Math.min(100, (recentAttemptCount / 30) * 100); // 30 attempts/week = 100%
  const studyScore = Math.min(100, (recentStudyMinutes / 300) * 100); // 5 hours/week = 100%

  const engagement = Math.round(
    attemptScore * 0.4 + studyScore * 0.3 + consistencyScore * 0.3,
  );

  return Math.min(100, Math.max(0, engagement));
}

/**
 * Full insights computation pipeline
 */
export function computeInsights(
  progressData: KpProgressData[],
  historyRecords: KpHistoryRecord[],
  attempts: AttemptData[],
  recentStudyMinutes: number,
  now?: Date,
): InsightsResult {
  const strengths = computeStrengths(progressData);
  const weaknesses = computeWeaknesses(progressData);
  const riskKps = computeRiskKps(progressData, historyRecords, now);
  const learningPattern = computeLearningPattern(attempts);

  // Count recent attempts (last 7 days)
  const sevenDaysAgo = new Date(
    (now || new Date()).getTime() - 7 * 24 * 60 * 60 * 1000,
  );
  const recentAttemptCount = attempts.filter(
    (a) => new Date(a.attemptTime) >= sevenDaysAgo,
  ).length;

  const engagementScore = computeEngagementScore(
    recentAttemptCount,
    recentStudyMinutes,
    learningPattern.consistencyScore,
  );

  return {
    strengths,
    weaknesses,
    riskKps,
    learningPattern,
    engagementScore,
  };
}
