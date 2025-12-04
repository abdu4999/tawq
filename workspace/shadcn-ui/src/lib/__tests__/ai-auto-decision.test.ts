import { describe, it, expect } from 'vitest';
import { aiAutoDecision, DecisionContext } from '../ai-auto-decision';

describe('AI Auto Decision Engine', () => {
  const mockContext: DecisionContext = {
    triggeredBy: 'burnout_alert',
    relatedEntities: [],
    currentState: {},
    constraints: [],
    objectives: ['reduce_burnout']
  };

  describe('analyzeAndDecide', () => {
    it('should generate decision for burnout context', () => {
      const decision = aiAutoDecision.analyzeAndDecide(mockContext);
      
      expect(decision.type).toBe('performance-action'); // Default fallback or specific logic
      expect(decision.options).toHaveLength(2); // No action + Workload reduction
      expect(decision.recommendedOption).toBe('option_workload_reduction');
      expect(decision.urgency).toBe('high');
    });

    it('should respect budget constraints', () => {
      const constrainedContext: DecisionContext = {
        ...mockContext,
        constraints: [{
          type: 'budget',
          value: 1000, // Less than workload reduction cost (5000)
          strict: true,
          description: 'Low budget'
        }]
      };

      const decision = aiAutoDecision.analyzeAndDecide(constrainedContext);
      // Workload reduction cost is 5000, so it violates constraint.
      // Probability is halved.
      // No action cost is 0.
      
      // Let's check if it still recommends it or if score drops enough.
      // Workload reduction score: 25*0.4 + (85*0.5)*0.3 + (100-100)*0.2 + 100*0.1
      // = 10 + 12.75 + 0 + 10 = 32.75
      
      // No action score: -5*0.4 + 40*0.3 + 100*0.2 + 50*0.1
      // = -2 + 12 + 20 + 5 = 35
      
      // So No Action should win
      expect(decision.recommendedOption).toBe('option_no_action');
    });
  });

  describe('acceptDecision', () => {
    it('should update status to accepted', () => {
      const decision = aiAutoDecision.analyzeAndDecide(mockContext);
      const accepted = aiAutoDecision.acceptDecision(decision, 'user1');
      
      expect(accepted.status).toBe('accepted');
      expect(accepted.decidedBy).toBe('user1');
      expect(accepted.decidedAt).toBeDefined();
    });
  });

  describe('rejectDecision', () => {
    it('should update status to rejected', () => {
      const decision = aiAutoDecision.analyzeAndDecide(mockContext);
      const rejected = aiAutoDecision.rejectDecision(decision, 'user1', 'Too expensive');
      
      expect(rejected.status).toBe('rejected');
      expect(rejected.outcomeNotes).toBe('Too expensive');
    });
  });
});
