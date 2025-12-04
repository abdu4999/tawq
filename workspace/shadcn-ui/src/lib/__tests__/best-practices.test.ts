import { describe, it, expect } from 'vitest';
import { bestPracticesEngine, BestPractice, SuccessCase, FailCase } from '../best-practices';

describe('Best Practices Engine', () => {
  describe('createBestPractice', () => {
    it('should create a new best practice', () => {
      const practice = bestPracticesEngine.createBestPractice(
        'Title',
        'Desc',
        'marketing',
        { id: '1', name: 'Author', position: 'Pos' },
        []
      );
      expect(practice.title).toBe('Title');
      expect(practice.category).toBe('marketing');
      expect(practice.rating).toBe(0);
    });
  });

  describe('searchPractices', () => {
    const practices: BestPractice[] = [
      {
        ...bestPracticesEngine.createBestPractice('P1', 'Desc1', 'marketing', { id: '1', name: 'A', position: 'P' }, []),
        rating: 4,
        usageCount: 10,
        approved: true
      },
      {
        ...bestPracticesEngine.createBestPractice('P2', 'Desc2', 'sales', { id: '1', name: 'A', position: 'P' }, []),
        rating: 5,
        usageCount: 5,
        approved: false
      }
    ];

    it('should filter by category', () => {
      const results = bestPracticesEngine.searchPractices(practices, '', { category: 'marketing' });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('P1');
    });

    it('should filter by approval status', () => {
      const results = bestPracticesEngine.searchPractices(practices, '', { approved: true });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('P1');
    });

    it('should sort by score (rating + usage)', () => {
      // P1: 4*10 + 10 = 50
      // P2: 5*10 + 5 = 55
      const results = bestPracticesEngine.searchPractices(practices, '', {});
      expect(results[0].title).toBe('P2');
      expect(results[1].title).toBe('P1');
    });
  });

  describe('addReview', () => {
    it('should update rating correctly', () => {
      let practice = bestPracticesEngine.createBestPractice('P1', 'D', 'marketing', { id: '1', name: 'A', position: 'P' }, []);
      
      practice = bestPracticesEngine.addReview(practice, 'u1', 'User1', 5, 'Good');
      expect(practice.rating).toBe(5);
      expect(practice.reviews).toHaveLength(1);

      practice = bestPracticesEngine.addReview(practice, 'u2', 'User2', 3, 'Okay');
      // (5 + 3) / 2 = 4
      expect(practice.rating).toBe(4);
      expect(practice.reviews).toHaveLength(2);
    });
  });

  describe('analyzeSuccessCases', () => {
    it('should identify successful strategies', () => {
      const cases: SuccessCase[] = [
        { strategy: 'S1', title: 'C1' } as any,
        { strategy: 'S1', title: 'C2' } as any,
        { strategy: 'S1', title: 'C3' } as any
      ];

      const analysis = bestPracticesEngine.analyzeSuccessCases(cases);
      expect(analysis.successPatterns).toHaveLength(1);
      expect(analysis.successPatterns[0].description).toContain('S1');
    });
  });

  describe('analyzeFailureCases', () => {
    it('should identify common root causes', () => {
      const cases: FailCase[] = [
        { rootCauses: ['C1'], title: 'F1', whatWentWrong: [] } as any,
        { rootCauses: ['C1'], title: 'F2', whatWentWrong: [] } as any
      ];

      const analysis = bestPracticesEngine.analyzeFailureCases(cases);
      expect(analysis.failurePatterns).toHaveLength(1);
      expect(analysis.failurePatterns[0].description).toContain('C1');
    });

    it('should identify risk factors', () => {
      const cases: FailCase[] = [
        { rootCauses: [], title: 'F1', whatWentWrong: [{ category: 'planning' }] } as any,
        { rootCauses: [], title: 'F2', whatWentWrong: [{ category: 'planning' }] } as any
      ];

      const analysis = bestPracticesEngine.analyzeFailureCases(cases);
      expect(analysis.riskFactors).toHaveLength(1);
      expect(analysis.riskFactors[0].factor).toContain('planning');
    });
  });
});
