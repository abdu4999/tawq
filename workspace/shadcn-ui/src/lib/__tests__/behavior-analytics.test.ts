import { describe, it, expect, beforeEach } from 'vitest';
import { behaviorAnalytics } from '../behavior-analytics';
import { MicroEvent } from '../micro-measurement';

describe('BehaviorAnalyticsEngine', () => {
  const mockEmployeeId = 'emp-123';
  const mockEmployeeName = 'John Doe';
  const baseTime = new Date('2025-01-01T10:00:00Z').getTime();

  const createEvent = (
    offsetMs: number, 
    type: MicroEvent['eventType'], 
    screen: string = 'Home',
    duration: number = 0
  ): MicroEvent => ({
    id: `evt-${offsetMs}`,
    sessionId: 'sess-1',
    employeeId: mockEmployeeId,
    employeeName: mockEmployeeName,
    timestamp: new Date(baseTime + offsetMs),
    eventType: type,
    screenName: screen,
    duration
  });

  describe('calculateDistractionIndex', () => {
    it('should return 0 for empty events', () => {
      expect(behaviorAnalytics.calculateDistractionIndex([])).toBe(0);
    });

    it('should detect high distraction from frequent navigation', () => {
      // Create > 5 navigation events within 1 minute
      const events: MicroEvent[] = [];
      for (let i = 0; i < 8; i++) {
        events.push(createEvent(i * 5000, 'navigation', `Screen-${i}`));
      }
      
      const index = behaviorAnalytics.calculateDistractionIndex(events);
      // (8 - 5) * 10 = 30 base score
      expect(index).toBeGreaterThanOrEqual(30);
    });

    it('should detect distraction from blur events (loss of focus)', () => {
      const events: MicroEvent[] = [
        createEvent(0, 'navigation', 'Home'),
        createEvent(10000, 'blur', 'Home', 30000), // 30s blur
        createEvent(60000, 'navigation', 'Settings') // Total time 60s
      ];

      const index = behaviorAnalytics.calculateDistractionIndex(events);
      // 30s blur / 60s total = 50%
      expect(index).toBeGreaterThanOrEqual(50);
    });
  });

  describe('calculateConfusionScore', () => {
    it('should detect hesitation (long time between clicks)', () => {
      const events: MicroEvent[] = [
        createEvent(0, 'click', 'Home'),
        createEvent(10000, 'click', 'Home') // 10s gap (hesitation)
      ];

      const score = behaviorAnalytics.calculateConfusionScore(events);
      expect(score).toBeGreaterThan(0);
    });

    it('should detect backtracking', () => {
      const events: MicroEvent[] = [
        createEvent(0, 'navigation', 'Home'),
        createEvent(1000, 'navigation', 'Settings'),
        createEvent(2000, 'navigation', 'Home') // Back to Home
      ];

      const score = behaviorAnalytics.calculateConfusionScore(events);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('calculateStressIndicators', () => {
    it('should detect rapid clicking', () => {
      const events: MicroEvent[] = [
        createEvent(0, 'click', 'Home'),
        createEvent(100, 'click', 'Home'), // 100ms gap
        createEvent(200, 'click', 'Home')  // 100ms gap
      ];

      const indicators = behaviorAnalytics.calculateStressIndicators(events);
      expect(indicators.rapidClicking).toBe(2);
    });

    it('should detect late working hours', () => {
      const lateTime = new Date('2025-01-01T23:00:00Z').getTime();
      const events: MicroEvent[] = [
        {
          ...createEvent(0, 'click'),
          timestamp: new Date(lateTime)
        }
      ];

      const indicators = behaviorAnalytics.calculateStressIndicators(events);
      expect(indicators.workingHoursLate).toBe(true);
    });
  });

  describe('analyzeDistractionPatterns', () => {
    it('should identify frequent switching pattern', () => {
      const events: MicroEvent[] = [];
      // 4 navigation events out of 5 total = 80% switching rate
      for (let i = 0; i < 4; i++) {
        events.push(createEvent(i * 1000, 'navigation', `Screen-${i}`));
      }
      events.push(createEvent(5000, 'click', 'Screen-3'));

      const patterns = behaviorAnalytics.analyzeDistractionPatterns(events);
      expect(patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'frequent_switching' })
        ])
      );
    });

    it('should identify long idle pattern', () => {
      const events: MicroEvent[] = [
        createEvent(0, 'blur', 'Home', 70000) // > 60s idle
      ];

      const patterns = behaviorAnalytics.analyzeDistractionPatterns(events);
      expect(patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'long_idle' })
        ])
      );
    });
  });

  describe('generateRecommendations', () => {
    it('should suggest focus time for high distraction', () => {
      const analysis = {
        employeeId: mockEmployeeId,
        employeeName: mockEmployeeName,
        distractionIndex: 80,
        confusionScore: 0,
        stressIndicator: 0,
        focusQuality: 'poor' as const,
        patterns: [],
        recommendations: [],
        timestamp: new Date()
      };

      const recommendations = behaviorAnalytics.generateRecommendations(analysis);
      expect(recommendations.some(r => r.includes('مستوى تشتت عالي'))).toBe(true);
    });

    it('should suggest rest for high stress', () => {
      const analysis = {
        employeeId: mockEmployeeId,
        employeeName: mockEmployeeName,
        distractionIndex: 0,
        confusionScore: 0,
        stressIndicator: 80,
        focusQuality: 'excellent' as const,
        patterns: [],
        recommendations: [],
        timestamp: new Date()
      };

      const recommendations = behaviorAnalytics.generateRecommendations(analysis);
      expect(recommendations.some(r => r.includes('مؤشرات توتر عالية'))).toBe(true);
    });
  });

  describe('performFullAnalysis', () => {
    it('should return a complete analysis object', () => {
      const events: MicroEvent[] = [
        createEvent(0, 'navigation', 'Home'),
        createEvent(1000, 'click', 'Home')
      ];

      const analysis = behaviorAnalytics.performFullAnalysis(mockEmployeeId, mockEmployeeName, events);
      
      expect(analysis).toHaveProperty('distractionIndex');
      expect(analysis).toHaveProperty('confusionScore');
      expect(analysis).toHaveProperty('stressIndicator');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis.employeeId).toBe(mockEmployeeId);
    });
  });
});
