import { describe, it, expect } from 'vitest';
import { influencerPrediction, InfluencerData, PredictionResult } from '../influencer-prediction';

describe('Influencer Prediction Engine', () => {
  const mockInfluencer: InfluencerData = {
    id: 'inf1',
    name: 'Test Influencer',
    platform: 'instagram',
    category: 'lifestyle',
    followers: 100000,
    engagement: {
      likes: 5000,
      comments: 100,
      shares: 50,
      views: 20000,
      engagementRate: 5.15
    },
    historicalPerformance: [],
    audience: {
      demographics: { ageGroups: {}, gender: {}, locations: {} },
      interests: ['fashion', 'travel'],
      authenticity: 90,
      activeFollowers: 80000
    },
    contentQuality: 85,
    reliability: 95,
    lastUpdated: new Date()
  };

  describe('predictPerformance', () => {
    it('should predict positive ROI for good influencer', () => {
      const result = influencerPrediction.predictPerformance(
        mockInfluencer,
        1000, // budget
        'sponsored-post',
        ['fashion']
      );

      expect(result.predictedROI).toBeGreaterThan(0);
      expect(result.recommendation).not.toBe('not-recommended');
      expect(result.riskLevel).toBe('low');
    });

    it('should predict negative ROI/high risk for bad influencer', () => {
      const badInfluencer: InfluencerData = {
        ...mockInfluencer,
        followers: 1000,
        engagement: { ...mockInfluencer.engagement, engagementRate: 0.5 },
        reliability: 40,
        audience: { ...mockInfluencer.audience, authenticity: 40 }
      };

      const result = influencerPrediction.predictPerformance(
        badInfluencer,
        1000,
        'sponsored-post',
        ['tech'] // Mismatch interest
      );

      expect(result.riskLevel).toBe('high');
      expect(result.recommendation).toBe('not-recommended');
    });
  });

  describe('compareInfluencers', () => {
    it('should rank influencers by score', () => {
      const p1: PredictionResult = { score: 80, predictedROI: 50, confidence: 80 } as any;
      const p2: PredictionResult = { score: 90, predictedROI: 60, confidence: 90 } as any;
      const p3: PredictionResult = { score: 70, predictedROI: 40, confidence: 70 } as any;

      const ranked = influencerPrediction.compareInfluencers([p1, p2, p3]);
      expect(ranked[0].score).toBe(90);
      expect(ranked[1].score).toBe(80);
      expect(ranked[2].score).toBe(70);
    });
  });
});
