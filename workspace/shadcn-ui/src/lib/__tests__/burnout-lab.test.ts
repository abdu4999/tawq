import { describe, it, expect } from 'vitest';
import { burnoutLab } from '../burnout-lab';

describe('Burnout Lab Engine', () => {
  describe('calculateBurnoutScore', () => {
    it('should return high score for overworked employee', () => {
      // workHours > 50, tasksOverdue, errorRate, low focus
      const score = burnoutLab.calculateBurnoutScore(
        60, // workHours (60-50)*2 = 20
        10, // tasksCompleted
        5,  // tasksOverdue * 5 = 25
        3,  // errorRate * 10 = 30
        50, // focusScore (100-50)*0.5 = 25
        0   // restDays < 1 => +20
      );
      // Total: 20 + 25 + 30 + 25 + 20 = 120 -> capped at 100
      expect(score).toBe(100);
    });

    it('should return low score for balanced employee', () => {
      const score = burnoutLab.calculateBurnoutScore(
        40, // workHours
        10, // tasksCompleted
        0,  // tasksOverdue
        0,  // errorRate
        90, // focusScore (100-90)*0.5 = 5
        2   // restDays
      );
      // Total: 0 + 0 + 0 + 5 + 0 = 5
      expect(score).toBe(5);
    });
  });

  describe('calculateFatigueLevel', () => {
    it('should calculate fatigue correctly', () => {
      const fatigue = burnoutLab.calculateFatigueLevel(
        5,  // consecutiveWorkDays * 5 = 25
        12, // averageWorkHoursPerDay (12-10)*8 = 16
        80  // sleepQualityIndicator (100-80)*0.3 = 6
      );
      // Total: 25 + 16 + 6 = 47
      expect(fatigue).toBe(47);
    });
  });

  describe('detectSymptoms', () => {
    it('should detect exhaustion when burnout score is high', () => {
      const symptoms = burnoutLab.detectSymptoms(
        85, // burnoutScore > 60 -> exhaustion (severe > 80)
        0,  // productivityChange
        80, // engagementScore
        0   // errorRate
      );
      expect(symptoms).toContainEqual(expect.objectContaining({
        type: 'exhaustion',
        severity: 'severe'
      }));
    });

    it('should detect cynicism when engagement is low', () => {
      const symptoms = burnoutLab.detectSymptoms(
        50,
        0,
        30, // engagementScore < 40 -> cynicism
        0
      );
      expect(symptoms).toContainEqual(expect.objectContaining({
        type: 'cynicism'
      }));
    });

    it('should detect inefficacy when productivity drops', () => {
      const symptoms = burnoutLab.detectSymptoms(
        50,
        -40, // productivityChange < -30 -> inefficacy
        80,
        0
      );
      expect(symptoms).toContainEqual(expect.objectContaining({
        type: 'inefficacy'
      }));
    });
  });

  describe('determineRiskLevel', () => {
    it('should return critical for score >= 80', () => {
      expect(burnoutLab.determineRiskLevel(80)).toBe('critical');
      expect(burnoutLab.determineRiskLevel(90)).toBe('critical');
    });

    it('should return high for score >= 60', () => {
      expect(burnoutLab.determineRiskLevel(60)).toBe('high');
      expect(burnoutLab.determineRiskLevel(79)).toBe('high');
    });

    it('should return medium for score >= 40', () => {
      expect(burnoutLab.determineRiskLevel(40)).toBe('medium');
      expect(burnoutLab.determineRiskLevel(59)).toBe('medium');
    });

    it('should return low for score < 40', () => {
      expect(burnoutLab.determineRiskLevel(39)).toBe('low');
      expect(burnoutLab.determineRiskLevel(0)).toBe('low');
    });
  });

  describe('predictFutureBurnout', () => {
    it('should predict burnout increase based on trend', () => {
      const trend = [
        { date: new Date(), burnoutScore: 50, fatigueLevel: 0, stressLevel: 0 },
        { date: new Date(), burnoutScore: 55, fatigueLevel: 0, stressLevel: 0 },
        { date: new Date(), burnoutScore: 60, fatigueLevel: 0, stressLevel: 0 }
      ];
      // Avg increase: (55-50 + 60-55) / 2 = 5 per step
      // Current: 60
      // Predicted in 7 days: 60 + (5 * 7) = 95
      
      const prediction = burnoutLab.predictFutureBurnout(60, trend);
      expect(prediction.predictedBurnout).toBe(95);
      expect(prediction.timeToRisk).toBeLessThan(7); // (80-60)/5 = 4 days
    });
  });
});
