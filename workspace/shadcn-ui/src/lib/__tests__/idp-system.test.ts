import { describe, it, expect } from 'vitest';
import { idpSystem, IDPPlan, Strength, Weakness, SkillAssessment } from '../idp-system';

describe('IDP System Engine', () => {
  describe('createIDPPlan', () => {
    it('should create a new IDP plan with default values', () => {
      const plan = idpSystem.createIDPPlan('emp1', 'John Doe', 'Dev', 'IT', 2);
      expect(plan.employeeId).toBe('emp1');
      expect(plan.currentLevel).toBe(2);
      expect(plan.targetLevel).toBe(3);
      expect(plan.progress.overallProgress).toBe(0);
    });
  });

  describe('analyzeStrengths', () => {
    it('should identify productivity strength', () => {
      const strengths = idpSystem.analyzeStrengths(
        { productivityScore: 85, focusScore: 50, qualityScore: 50 },
        []
      );
      expect(strengths).toContainEqual(expect.objectContaining({
        id: 'strength_productivity'
      }));
    });

    it('should identify focus strength', () => {
      const strengths = idpSystem.analyzeStrengths(
        { productivityScore: 50, focusScore: 80, qualityScore: 50 },
        []
      );
      expect(strengths).toContainEqual(expect.objectContaining({
        id: 'strength_focus'
      }));
    });
  });

  describe('analyzeWeaknesses', () => {
    it('should identify distraction weakness', () => {
      const weaknesses = idpSystem.analyzeWeaknesses(
        {},
        { distractionIndex: 70, confusionScore: 0, stressIndicator: 0 }
      );
      expect(weaknesses).toContainEqual(expect.objectContaining({
        id: 'weakness_distraction'
      }));
    });

    it('should identify stress weakness', () => {
      const weaknesses = idpSystem.analyzeWeaknesses(
        {},
        { distractionIndex: 0, confusionScore: 0, stressIndicator: 80 }
      );
      expect(weaknesses).toContainEqual(expect.objectContaining({
        id: 'weakness_stress',
        impact: 'high'
      }));
    });
  });

  describe('generate30DaysGoals', () => {
    it('should generate goals for high impact weaknesses', () => {
      const weaknesses: Weakness[] = [{
        id: 'w1',
        category: 'soft',
        title: 'Weakness 1',
        description: 'Desc',
        impact: 'high',
        improvementPlan: 'Plan',
        resources: []
      }];
      
      const goals = idpSystem.generate30DaysGoals(weaknesses, []);
      expect(goals).toHaveLength(1);
      expect(goals[0].title).toContain('Weakness 1');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate overall progress correctly', () => {
      const plan: IDPPlan = idpSystem.createIDPPlan('e1', 'n1', 'p', 'd', 1);
      
      // Mock goals progress
      plan.goals30Days = [{ progress: 100 } as any];
      plan.goals90Days = [{ progress: 50 } as any];
      plan.skills = [];
      plan.developmentActivities = [];

      // 30d: 100 * 0.3 = 30
      // 90d: 50 * 0.4 = 20
      // Total: 50
      
      const progress = idpSystem.calculateProgress(plan);
      expect(progress.overallProgress).toBe(50);
      expect(progress.goals30DaysProgress).toBe(100);
      expect(progress.goals90DaysProgress).toBe(50);
    });
  });

  describe('generateWeeklyRecommendation', () => {
    it('should generate recommendations based on delayed goals', () => {
      const plan: IDPPlan = idpSystem.createIDPPlan('e1', 'n1', 'p', 'd', 1);
      plan.goals30Days = [{ 
        title: 'Delayed Goal', 
        status: 'delayed', 
        targetDate: new Date() 
      } as any];

      const rec = idpSystem.generateWeeklyRecommendation(plan);
      expect(rec.focusAreas).toContain('تسريع الأهداف المتأخرة');
      expect(rec.suggestedActivities[0]).toContain('Delayed Goal');
    });
  });
});
