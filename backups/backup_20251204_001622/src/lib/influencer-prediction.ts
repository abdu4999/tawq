/**
 * INFLUENCER PREDICTION MODEL
 * نموذج التنبؤ بأداء المشاهير والمؤثرين
 */

export interface InfluencerData {
  id: string;
  name: string;
  platform: 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'snapchat' | 'multi';
  category: string; // نوع المحتوى
  followers: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagementRate: number; // percentage
  };
  historicalPerformance: CampaignPerformance[];
  audience: AudienceData;
  contentQuality: number; // 0-100
  reliability: number; // 0-100
  lastUpdated: Date;
}

export interface CampaignPerformance {
  campaignId: string;
  date: Date;
  type: 'sponsored-post' | 'story' | 'video' | 'live' | 'collaboration';
  reach: number;
  engagement: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number; // percentage
}

export interface AudienceData {
  demographics: {
    ageGroups: Record<string, number>; // percentage
    gender: Record<string, number>; // percentage
    locations: Record<string, number>; // percentage
  };
  interests: string[];
  authenticity: number; // 0-100 (نسبة المتابعين الحقيقيين)
  activeFollowers: number; // المتابعين النشطين فعلياً
}

export interface PredictionResult {
  influencerId: string;
  influencerName: string;
  predictedReach: number;
  predictedEngagement: number;
  predictedConversions: number;
  predictedRevenue: number;
  estimatedCost: number;
  predictedROI: number;
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendation: 'highly-recommended' | 'recommended' | 'consider-alternatives' | 'not-recommended';
  score: number; // 0-100
  color: 'green' | 'yellow' | 'red';
  reasoning: string[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainedOn: Date;
  sampleSize: number;
}

class InfluencerPredictionEngine {
  /**
   * التنبؤ بأداء المؤثر
   */
  predictPerformance(
    influencer: InfluencerData,
    campaignBudget: number,
    campaignType: string,
    targetAudience?: string[]
  ): PredictionResult {
    // حساب معدل الأداء التاريخي
    const avgPerformance = this.calculateAveragePerformance(influencer.historicalPerformance);
    
    // حساب معامل الجودة
    const qualityFactor = this.calculateQualityFactor(influencer);
    
    // حساب معامل الجمهور
    const audienceFactor = this.calculateAudienceMatch(influencer.audience, targetAudience);
    
    // حساب معامل الموثوقية
    const reliabilityFactor = influencer.reliability / 100;

    // التنبؤ بالوصول
    const baseReach = influencer.followers * influencer.engagement.engagementRate / 100;
    const predictedReach = Math.round(baseReach * qualityFactor * audienceFactor);

    // التنبؤ بالتفاعل
    const predictedEngagement = Math.round(predictedReach * (influencer.engagement.engagementRate / 100));

    // التنبؤ بالتحويلات (conversion rate متوسط 2-5%)
    const conversionRate = this.estimateConversionRate(influencer, campaignType);
    const predictedConversions = Math.round(predictedReach * conversionRate);

    // التنبؤ بالإيرادات
    const avgOrderValue = campaignBudget * 0.1; // افتراضي
    const predictedRevenue = predictedConversions * avgOrderValue;

    // تقدير التكلفة
    const estimatedCost = this.estimateCost(influencer, campaignType);

    // حساب ROI المتوقع
    const predictedROI = estimatedCost > 0 
      ? ((predictedRevenue - estimatedCost) / estimatedCost) * 100 
      : 0;

    // حساب الثقة
    const confidence = this.calculateConfidence(influencer);

    // تحديد المخاطر
    const { riskLevel, riskFactors } = this.assessRisk(influencer, predictedROI);

    // حساب النقاط الإجمالية
    const score = this.calculateScore(
      predictedROI,
      confidence,
      qualityFactor,
      audienceFactor,
      reliabilityFactor
    );

    // التوصية
    const recommendation = this.generateRecommendation(score, riskLevel);

    // اللون
    const color = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';

    // الأسباب
    const reasoning = this.generateReasoning(
      score,
      predictedROI,
      confidence,
      qualityFactor,
      audienceFactor
    );

    return {
      influencerId: influencer.id,
      influencerName: influencer.name,
      predictedReach,
      predictedEngagement,
      predictedConversions,
      predictedRevenue: Math.round(predictedRevenue),
      estimatedCost: Math.round(estimatedCost),
      predictedROI: Math.round(predictedROI),
      confidence: Math.round(confidence),
      riskLevel,
      riskFactors,
      recommendation,
      score: Math.round(score),
      color,
      reasoning
    };
  }

  /**
   * حساب متوسط الأداء التاريخي
   */
  private calculateAveragePerformance(history: CampaignPerformance[]) {
    if (history.length === 0) return { roi: 0, engagement: 0, conversions: 0 };

    const total = history.reduce((acc, perf) => ({
      roi: acc.roi + perf.roi,
      engagement: acc.engagement + perf.engagement,
      conversions: acc.conversions + perf.conversions
    }), { roi: 0, engagement: 0, conversions: 0 });

    return {
      roi: total.roi / history.length,
      engagement: total.engagement / history.length,
      conversions: total.conversions / history.length
    };
  }

  /**
   * حساب معامل الجودة
   */
  private calculateQualityFactor(influencer: InfluencerData): number {
    const contentScore = influencer.contentQuality / 100;
    const authenticityScore = influencer.audience.authenticity / 100;
    const engagementScore = Math.min(influencer.engagement.engagementRate / 10, 1);

    return (contentScore * 0.4 + authenticityScore * 0.4 + engagementScore * 0.2);
  }

  /**
   * حساب توافق الجمهور
   */
  private calculateAudienceMatch(audience: AudienceData, targetAudience?: string[]): number {
    if (!targetAudience || targetAudience.length === 0) return 1;

    // مقارنة الاهتمامات
    const matchingInterests = audience.interests.filter(interest =>
      targetAudience.some(target => 
        interest.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(interest.toLowerCase())
      )
    );

    const matchScore = matchingInterests.length / Math.max(targetAudience.length, 1);
    return Math.max(matchScore, 0.5); // على الأقل 50%
  }

  /**
   * تقدير معدل التحويل
   */
  private estimateConversionRate(influencer: InfluencerData, campaignType: string): number {
    let baseRate = 0.02; // 2% معدل أساسي

    // تعديل حسب نوع الحملة
    if (campaignType === 'video') baseRate *= 1.5;
    else if (campaignType === 'story') baseRate *= 0.8;
    else if (campaignType === 'live') baseRate *= 2;

    // تعديل حسب الموثوقية
    const reliabilityBonus = (influencer.reliability / 100) * 0.01;
    baseRate += reliabilityBonus;

    // تعديل حسب الجودة
    const qualityBonus = (influencer.contentQuality / 100) * 0.015;
    baseRate += qualityBonus;

    return Math.min(baseRate, 0.1); // حد أقصى 10%
  }

  /**
   * تقدير التكلفة
   */
  private estimateCost(influencer: InfluencerData, campaignType: string): number {
    // تكلفة أساسية بناءً على عدد المتابعين
    let baseCost = 0;
    
    if (influencer.followers < 10000) baseCost = 500;
    else if (influencer.followers < 50000) baseCost = 2000;
    else if (influencer.followers < 100000) baseCost = 5000;
    else if (influencer.followers < 500000) baseCost = 15000;
    else if (influencer.followers < 1000000) baseCost = 30000;
    else baseCost = 50000;

    // ضرب في معدل التفاعل
    const engagementMultiplier = Math.max(influencer.engagement.engagementRate / 5, 1);
    baseCost *= engagementMultiplier;

    // تعديل حسب نوع المحتوى
    if (campaignType === 'video') baseCost *= 1.5;
    else if (campaignType === 'live') baseCost *= 2;

    return baseCost;
  }

  /**
   * حساب مستوى الثقة
   */
  private calculateConfidence(influencer: InfluencerData): number {
    let confidence = 50; // ثقة أساسية

    // البيانات التاريخية تزيد الثقة
    if (influencer.historicalPerformance.length > 10) confidence += 30;
    else if (influencer.historicalPerformance.length > 5) confidence += 20;
    else if (influencer.historicalPerformance.length > 0) confidence += 10;

    // الموثوقية
    confidence += (influencer.reliability / 100) * 10;

    // أصالة المتابعين
    confidence += (influencer.audience.authenticity / 100) * 10;

    return Math.min(confidence, 100);
  }

  /**
   * تقييم المخاطر
   */
  private assessRisk(
    influencer: InfluencerData,
    predictedROI: number
  ): { riskLevel: 'low' | 'medium' | 'high'; riskFactors: string[] } {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // موثوقية منخفضة
    if (influencer.reliability < 60) {
      riskFactors.push('موثوقية المؤثر منخفضة');
      riskScore += 30;
    }

    // أصالة متابعين منخفضة
    if (influencer.audience.authenticity < 70) {
      riskFactors.push('نسبة عالية من المتابعين الوهميين');
      riskScore += 25;
    }

    // ROI متوقع سلبي
    if (predictedROI < 0) {
      riskFactors.push('عائد استثمار متوقع سلبي');
      riskScore += 40;
    }

    // بيانات تاريخية قليلة
    if (influencer.historicalPerformance.length < 3) {
      riskFactors.push('بيانات أداء تاريخية محدودة');
      riskScore += 15;
    }

    // معدل تفاعل منخفض
    if (influencer.engagement.engagementRate < 2) {
      riskFactors.push('معدل تفاعل منخفض');
      riskScore += 20;
    }

    const riskLevel: 'low' | 'medium' | 'high' = 
      riskScore < 30 ? 'low' :
      riskScore < 60 ? 'medium' : 'high';

    return { riskLevel, riskFactors };
  }

  /**
   * حساب النقاط الإجمالية
   */
  private calculateScore(
    roi: number,
    confidence: number,
    quality: number,
    audience: number,
    reliability: number
  ): number {
    // ROI الموجب يحصل على نقاط عالية
    const roiScore = roi > 0 ? Math.min((roi / 100) * 50, 40) : 0;

    // الثقة
    const confidenceScore = (confidence / 100) * 20;

    // الجودة
    const qualityScore = quality * 15;

    // الجمهور
    const audienceScore = audience * 15;

    // الموثوقية
    const reliabilityScore = reliability * 10;

    return roiScore + confidenceScore + qualityScore + audienceScore + reliabilityScore;
  }

  /**
   * توليد التوصية
   */
  private generateRecommendation(
    score: number,
    riskLevel: string
  ): PredictionResult['recommendation'] {
    if (score >= 80 && riskLevel === 'low') return 'highly-recommended';
    if (score >= 60 && riskLevel !== 'high') return 'recommended';
    if (score >= 40) return 'consider-alternatives';
    return 'not-recommended';
  }

  /**
   * توليد الأسباب
   */
  private generateReasoning(
    score: number,
    roi: number,
    confidence: number,
    quality: number,
    audience: number
  ): string[] {
    const reasons: string[] = [];

    if (roi > 100) reasons.push(`✅ عائد استثمار ممتاز متوقع: ${roi.toFixed(0)}%`);
    else if (roi > 50) reasons.push(`✓ عائد استثمار جيد متوقع: ${roi.toFixed(0)}%`);
    else if (roi < 0) reasons.push(`⚠️ عائد استثمار سلبي متوقع: ${roi.toFixed(0)}%`);

    if (confidence > 80) reasons.push('✅ مستوى ثقة عالي في التنبؤات');
    else if (confidence < 50) reasons.push('⚠️ مستوى ثقة منخفض - بيانات محدودة');

    if (quality > 0.8) reasons.push('✅ جودة محتوى عالية');
    else if (quality < 0.5) reasons.push('⚠️ جودة محتوى تحتاج تحسين');

    if (audience > 0.8) reasons.push('✅ توافق ممتاز مع الجمهور المستهدف');
    else if (audience < 0.6) reasons.push('⚠️ توافق محدود مع الجمهور المستهدف');

    if (score >= 80) reasons.push('🌟 مرشح ممتاز للحملة');
    else if (score < 40) reasons.push('⛔ ننصح بالبحث عن بدائل أفضل');

    return reasons;
  }

  /**
   * مقارنة عدة مؤثرين
   */
  compareInfluencers(predictions: PredictionResult[]): PredictionResult[] {
    return predictions.sort((a, b) => {
      // ترتيب حسب النقاط أولاً
      if (b.score !== a.score) return b.score - a.score;
      
      // ثم ROI
      if (b.predictedROI !== a.predictedROI) return b.predictedROI - a.predictedROI;
      
      // ثم الثقة
      return b.confidence - a.confidence;
    });
  }
}

export const influencerPrediction = new InfluencerPredictionEngine();
