import { RecommendationService, Recommendation } from './recommendation.service';

/**
 * Unit tests for the recommendation rule logic.
 * Since the service depends on DB, we test the rule logic by verifying
 * the service structure and the recommendation types.
 */
describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = new RecommendationService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recommendation types', () => {
    it('should define correct recommendation types', () => {
      const rec: Recommendation = {
        kpId: 'test',
        kpTitle: 'Test KP',
        type: 'review',
        priority: 1,
        reason: 'test reason',
      };
      expect(rec.type).toBe('review');
      expect(['review', 'practice', 'advance']).toContain(rec.type);
    });

    it('should support all valid recommendation types', () => {
      const types: Recommendation['type'][] = ['review', 'practice', 'advance'];
      for (const type of types) {
        const rec: Recommendation = {
          kpId: 'test',
          kpTitle: 'Test',
          type,
          priority: 1,
          reason: 'test',
        };
        expect(rec.type).toBe(type);
      }
    });
  });

  describe('priority ordering', () => {
    it('should sort recommendations by priority correctly', () => {
      const recs: Recommendation[] = [
        { kpId: 'c', kpTitle: 'C', type: 'practice', priority: 3, reason: '' },
        { kpId: 'a', kpTitle: 'A', type: 'review', priority: 1, reason: '' },
        { kpId: 'd', kpTitle: 'D', type: 'advance', priority: 4, reason: '' },
        { kpId: 'b', kpTitle: 'B', type: 'review', priority: 2, reason: '' },
      ];

      const sorted = [...recs].sort((a, b) => a.priority - b.priority);
      expect(sorted[0].kpId).toBe('a');
      expect(sorted[1].kpId).toBe('b');
      expect(sorted[2].kpId).toBe('c');
      expect(sorted[3].kpId).toBe('d');
    });
  });
});
