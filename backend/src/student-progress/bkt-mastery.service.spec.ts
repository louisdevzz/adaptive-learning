import { BktMasteryService } from './bkt-mastery.service';

describe('BktMasteryService', () => {
  let service: BktMasteryService;

  beforeEach(() => {
    service = new BktMasteryService();
  });

  describe('deriveBktParams', () => {
    it('should return defaults when no options provided', () => {
      const params = service.deriveBktParams();
      expect(params.pL).toBe(0.2);
      expect(params.pT).toBe(0.1);
      expect(params.pS).toBe(0.1);
      expect(params.pG).toBe(0.25);
    });

    it('should adjust params based on question difficulty', () => {
      const easyParams = service.deriveBktParams({ questionDifficulty: 2 });
      const hardParams = service.deriveBktParams({ questionDifficulty: 9 });

      // Harder questions → higher slip, lower guess
      expect(hardParams.pS).toBeGreaterThan(easyParams.pS);
      expect(hardParams.pG).toBeLessThan(easyParams.pG);
    });

    it('should adjust params based on KP difficulty when no question metadata', () => {
      const params = service.deriveBktParams({ kpDifficultyLevel: 3 });
      expect(params.pS).toBeGreaterThan(0.05);
      expect(params.pG).toBeLessThan(0.35);
    });

    it('should prefer question difficulty over KP difficulty', () => {
      const params = service.deriveBktParams({
        questionDifficulty: 8,
        kpDifficultyLevel: 1,
      });
      // Should use question difficulty (high), not KP difficulty (low)
      expect(params.pS).toBeGreaterThan(0.15);
    });

    it('should reduce slip and guess for high discrimination', () => {
      const lowDisc = service.deriveBktParams({
        questionDifficulty: 5,
        discrimination: 0.2,
      });
      const highDisc = service.deriveBktParams({
        questionDifficulty: 5,
        discrimination: 0.9,
      });

      expect(highDisc.pS).toBeLessThan(lowDisc.pS);
      expect(highDisc.pG).toBeLessThan(lowDisc.pG);
    });
  });

  describe('updateMastery', () => {
    it('should increase mastery on correct answer', () => {
      const result = service.updateMastery(0.2, true);
      expect(result.pL).toBeGreaterThan(0.2);
      expect(result.masteryScore).toBeGreaterThan(20);
    });

    it('should decrease mastery on incorrect answer (relative to correct)', () => {
      const correctResult = service.updateMastery(0.5, true);
      const incorrectResult = service.updateMastery(0.5, false);
      expect(incorrectResult.pL).toBeLessThan(correctResult.pL);
    });

    it('should keep mastery between 0 and 100', () => {
      const highResult = service.updateMastery(0.99, true);
      expect(highResult.masteryScore).toBeLessThanOrEqual(100);
      expect(highResult.pL).toBeLessThanOrEqual(1);

      const lowResult = service.updateMastery(0.01, false);
      expect(lowResult.masteryScore).toBeGreaterThanOrEqual(0);
      expect(lowResult.pL).toBeGreaterThanOrEqual(0);
    });

    it('should always allow learning transition (pL never fully stuck at 0)', () => {
      // Even with incorrect answer, pT ensures some learning
      const result = service.updateMastery(0.0, false);
      expect(result.pL).toBeGreaterThan(0);
    });
  });

  describe('processResponseSequence', () => {
    it('should increase monotonically with 5 correct answers', () => {
      const scores: number[] = [];
      let pL = 0.2;

      for (let i = 0; i < 5; i++) {
        const result = service.updateMastery(pL, true);
        pL = result.pL;
        scores.push(result.masteryScore);
      }

      // Each score should be >= previous
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
      }

      // After 5 correct, mastery should be significantly higher than start
      expect(scores[scores.length - 1]).toBeGreaterThan(50);
    });

    it('should stay above 0 with 5 wrong answers', () => {
      const result = service.processResponseSequence(
        [false, false, false, false, false],
        undefined,
        0.5,
      );

      expect(result.masteryScore).toBeGreaterThan(0);
      expect(result.masteryScore).toBeLessThan(50);
    });

    it('should handle mixed responses realistically', () => {
      // Correct, correct, wrong, correct, correct
      const result = service.processResponseSequence(
        [true, true, false, true, true],
        undefined,
        0.2,
      );

      // Should show net improvement despite one wrong answer
      expect(result.masteryScore).toBeGreaterThan(20);
    });
  });

  describe('masteryScoreToPL', () => {
    it('should convert score to probability', () => {
      expect(service.masteryScoreToPL(50)).toBe(0.5);
      expect(service.masteryScoreToPL(100)).toBe(1);
      expect(service.masteryScoreToPL(0)).toBe(0);
    });

    it('should clamp out-of-range values', () => {
      expect(service.masteryScoreToPL(150)).toBe(1);
      expect(service.masteryScoreToPL(-10)).toBe(0);
    });
  });
});
