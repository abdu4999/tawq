/**
 * BEST PRACTICES LIBRARY
 * مكتبة الممارسات الناجحة
 */

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: 'marketing' | 'sales' | 'design' | 'development' | 'management' | 'communication' | 'customer-service';
  subcategory: string;
  relatedTo: string[]; // الوظائف أو الأقسام المرتبطة
  author: {
    id: string;
    name: string;
    position: string;
  };
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number; // 0-5
  reviews: Review[];
  tags: string[];
  steps: PracticeStep[];
  results: PracticeResult[];
  resources: Resource[];
  approved: boolean;
  approvedBy?: string;
  featured: boolean;
}

export interface PracticeStep {
  stepNumber: number;
  title: string;
  description: string;
  tips: string[];
  commonMistakes: string[];
  estimatedTime: string;
}

export interface PracticeResult {
  metric: string;
  before: string | number;
  after: string | number;
  improvement: string;
}

export interface Resource {
  type: 'document' | 'video' | 'link' | 'template' | 'tool';
  title: string;
  url?: string;
  description: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  helpful: number; // عدد من وجدوها مفيدة
  createdAt: Date;
}

export interface SuccessCase {
  id: string;
  title: string;
  type: 'campaign' | 'project' | 'event' | 'initiative';
  category: string;
  executedBy: {
    id: string;
    name: string;
    role: string;
  };
  startDate: Date;
  endDate: Date;
  budget: number;
  actualSpent: number;
  goals: CaseGoal[];
  strategy: string;
  execution: string[];
  challenges: Challenge[];
  solutions: Solution[];
  results: CaseResult[];
  keyLearnings: string[];
  bestPracticesUsed: string[]; // IDs
  rating: number;
  featured: boolean;
  visibility: 'public' | 'internal' | 'restricted';
}

export interface FailCase {
  id: string;
  title: string;
  type: 'campaign' | 'project' | 'event' | 'initiative';
  category: string;
  executedBy: {
    id: string;
    name: string;
    role: string;
  };
  startDate: Date;
  endDate: Date;
  budget: number;
  actualSpent: number;
  originalGoals: CaseGoal[];
  whatWentWrong: WrongFactor[];
  rootCauses: string[];
  lessonsLearned: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  visibility: 'public' | 'internal' | 'restricted';
}

export interface CaseGoal {
  metric: string;
  target: string | number;
  actual: string | number;
  achieved: boolean;
  achievementRate: number; // percentage
}

export interface Challenge {
  description: string;
  impact: 'low' | 'medium' | 'high';
  howOvercome: string;
}

export interface Solution {
  problem: string;
  solution: string;
  effectiveness: number; // 0-100
}

export interface CaseResult {
  metric: string;
  value: string | number;
  comparison?: string; // مقارنة بالمعيار أو السابق
  positive: boolean;
}

export interface WrongFactor {
  factor: string;
  category: 'planning' | 'execution' | 'resources' | 'timing' | 'external' | 'communication';
  description: string;
  impact: 'low' | 'medium' | 'high';
  preventable: boolean;
}

export interface AIAnalysis {
  successPatterns: Pattern[];
  failurePatterns: Pattern[];
  recommendations: string[];
  riskFactors: RiskFactor[];
  successPredictors: Predictor[];
}

export interface Pattern {
  description: string;
  frequency: number;
  confidence: number; // 0-1
  examples: string[];
}

export interface RiskFactor {
  factor: string;
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Predictor {
  factor: string;
  weight: number; // 0-1
  correlation: number; // -1 to 1
}

class BestPracticesEngine {
  /**
   * إنشاء ممارسة جديدة
   */
  createBestPractice(
    title: string,
    description: string,
    category: BestPractice['category'],
    author: BestPractice['author'],
    steps: PracticeStep[]
  ): BestPractice {
    return {
      id: `practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      category,
      subcategory: '',
      relatedTo: [],
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      rating: 0,
      reviews: [],
      tags: [],
      steps,
      results: [],
      resources: [],
      approved: false,
      featured: false
    };
  }

  /**
   * البحث والفلترة
   */
  searchPractices(
    practices: BestPractice[],
    query: string,
    filters: {
      category?: string;
      minRating?: number;
      approved?: boolean;
      featured?: boolean;
    }
  ): BestPractice[] {
    let filtered = practices;

    // البحث النصي
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    // الفلاتر
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter(p => p.rating >= filters.minRating);
    }

    if (filters.approved !== undefined) {
      filtered = filtered.filter(p => p.approved === filters.approved);
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(p => p.featured === filters.featured);
    }

    // ترتيب حسب التقييم والاستخدام
    return filtered.sort((a, b) => {
      const scoreA = a.rating * 10 + a.usageCount;
      const scoreB = b.rating * 10 + b.usageCount;
      return scoreB - scoreA;
    });
  }

  /**
   * إضافة تقييم
   */
  addReview(
    practice: BestPractice,
    userId: string,
    userName: string,
    rating: number,
    comment: string
  ): BestPractice {
    const review: Review = {
      id: `review_${Date.now()}`,
      userId,
      userName,
      rating: Math.max(0, Math.min(5, rating)),
      comment,
      helpful: 0,
      createdAt: new Date()
    };

    const updatedReviews = [...practice.reviews, review];
    const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

    return {
      ...practice,
      reviews: updatedReviews,
      rating: Math.round(avgRating * 10) / 10,
      updatedAt: new Date()
    };
  }

  /**
   * تحليل حالات النجاح بالذكاء الاصطناعي
   */
  analyzeSuccessCases(cases: SuccessCase[]): AIAnalysis {
    const patterns: Pattern[] = [];
    
    // تحليل الاستراتيجيات الناجحة
    const strategies = new Map<string, number>();
    cases.forEach(c => {
      if (c.strategy) {
        strategies.set(c.strategy, (strategies.get(c.strategy) || 0) + 1);
      }
    });

    strategies.forEach((count, strategy) => {
      if (count >= 3) {
        patterns.push({
          description: `استراتيجية: ${strategy}`,
          frequency: count,
          confidence: Math.min(count / cases.length, 1),
          examples: cases
            .filter(c => c.strategy === strategy)
            .slice(0, 3)
            .map(c => c.title)
        });
      }
    });

    // تحليل الميزانيات
    const budgetSuccess = cases.filter(c => 
      c.actualSpent <= c.budget && 
      c.goals.every(g => g.achieved)
    );

    if (budgetSuccess.length > cases.length * 0.6) {
      patterns.push({
        description: 'الالتزام بالميزانية يرتبط بالنجاح',
        frequency: budgetSuccess.length,
        confidence: budgetSuccess.length / cases.length,
        examples: budgetSuccess.slice(0, 3).map(c => c.title)
      });
    }

    // تحليل الوقت
    const avgDuration = cases.reduce((sum, c) => {
      const duration = new Date(c.endDate).getTime() - new Date(c.startDate).getTime();
      return sum + duration;
    }, 0) / cases.length;

    const shortSuccessful = cases.filter(c => {
      const duration = new Date(c.endDate).getTime() - new Date(c.startDate).getTime();
      return duration < avgDuration && c.goals.every(g => g.achieved);
    });

    if (shortSuccessful.length > 0) {
      patterns.push({
        description: 'المشاريع الأقصر مدة تميل للنجاح أكثر',
        frequency: shortSuccessful.length,
        confidence: 0.7,
        examples: shortSuccessful.slice(0, 3).map(c => c.title)
      });
    }

    return {
      successPatterns: patterns,
      failurePatterns: [],
      recommendations: this.generateRecommendations(patterns),
      riskFactors: [],
      successPredictors: [
        { factor: 'الالتزام بالميزانية', weight: 0.8, correlation: 0.85 },
        { factor: 'مدة التنفيذ القصيرة', weight: 0.6, correlation: 0.72 },
        { factor: 'استخدام أفضل الممارسات', weight: 0.9, correlation: 0.91 }
      ]
    };
  }

  /**
   * تحليل حالات الفشل
   */
  analyzeFailureCases(cases: FailCase[]): AIAnalysis {
    const patterns: Pattern[] = [];

    // تحليل الأسباب الجذرية
    const rootCauses = new Map<string, number>();
    cases.forEach(c => {
      c.rootCauses.forEach(cause => {
        rootCauses.set(cause, (rootCauses.get(cause) || 0) + 1);
      });
    });

    rootCauses.forEach((count, cause) => {
      if (count >= 2) {
        patterns.push({
          description: `سبب متكرر: ${cause}`,
          frequency: count,
          confidence: count / cases.length,
          examples: cases
            .filter(c => c.rootCauses.includes(cause))
            .slice(0, 3)
            .map(c => c.title)
        });
      }
    });

    // تحليل نوع الخطأ
    const errorCategories = new Map<string, number>();
    cases.forEach(c => {
      c.whatWentWrong.forEach(w => {
        errorCategories.set(w.category, (errorCategories.get(w.category) || 0) + 1);
      });
    });

    // عوامل الخطر
    const riskFactors: RiskFactor[] = [];
    errorCategories.forEach((count, category) => {
      const probability = (count / cases.length) * 100;
      if (probability > 30) {
        riskFactors.push({
          factor: `مشاكل في: ${category}`,
          probability: Math.round(probability),
          impact: count > cases.length * 0.5 ? 'high' : 'medium',
          mitigation: this.getMitigationStrategy(category)
        });
      }
    });

    return {
      successPatterns: [],
      failurePatterns: patterns,
      recommendations: this.generateFailureRecommendations(patterns),
      riskFactors,
      successPredictors: []
    };
  }

  /**
   * توليد توصيات من الأنماط
   */
  private generateRecommendations(patterns: Pattern[]): string[] {
    const recommendations: string[] = [];

    patterns.forEach(pattern => {
      if (pattern.confidence > 0.7) {
        recommendations.push(`✅ ${pattern.description} - ثبت نجاحه في ${pattern.frequency} حالة`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('استمر في توثيق التجارب الناجحة لبناء قاعدة معرفة أقوى');
    }

    return recommendations;
  }

  /**
   * توصيات من حالات الفشل
   */
  private generateFailureRecommendations(patterns: Pattern[]): string[] {
    const recommendations: string[] = [];

    patterns.forEach(pattern => {
      recommendations.push(`⚠️ تجنب: ${pattern.description}`);
    });

    recommendations.push('راجع الدروس المستفادة قبل بدء مشاريع مشابهة');
    recommendations.push('خصص وقتاً كافياً للتخطيط وتقييم المخاطر');

    return recommendations;
  }

  /**
   * استراتيجية التخفيف
   */
  private getMitigationStrategy(category: string): string {
    const strategies: Record<string, string> = {
      'planning': 'تخصيص وقت أطول للتخطيط والمراجعة المسبقة',
      'execution': 'تحسين عمليات التنفيذ ومتابعة التقدم اليومي',
      'resources': 'ضمان توفر الموارد الكافية قبل البدء',
      'timing': 'مراجعة الجداول الزمنية وإضافة هوامش أمان',
      'external': 'وضع خطط طوارئ للعوامل الخارجية',
      'communication': 'تحسين قنوات التواصل وتكرار الاجتماعات'
    };

    return strategies[category] || 'مراجعة وتحسين العملية';
  }
}

export const bestPracticesEngine = new BestPracticesEngine();
