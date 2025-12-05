/**
 * AI AUTO-DECISION ENGINE
 * محرك القرارات التلقائية بالذكاء الاصطناعي
 */

export interface Decision {
  id: string;
  type: 'task-assignment' | 'budget-approval' | 'resource-allocation' | 'priority-adjustment' | 'risk-mitigation' | 'performance-action';
  title: string;
  description: string;
  context: DecisionContext;
  options: DecisionOption[];
  recommendedOption: string; // ID of recommended option
  reasoning: string[];
  confidence: number; // 0-100
  urgency: 'low' | 'medium' | 'high' | 'critical';
  impact: 'minor' | 'moderate' | 'significant' | 'major';
  createdAt: Date;
  expiresAt?: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'modified' | 'expired';
  decidedBy?: string;
  decidedAt?: Date;
  actualOutcome?: string;
  outcomeNotes?: string;
}

export interface DecisionContext {
  triggeredBy: string; // ما أثار الحاجة للقرار
  relatedEntities: {
    type: 'employee' | 'project' | 'task' | 'budget' | 'resource';
    id: string;
    name: string;
  }[];
  currentState: Record<string, any>;
  constraints: Constraint[];
  objectives: string[];
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedImpact: Impact;
  cost: number;
  timeRequired: string;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number; // احتمالية النجاح 0-100
}

export interface Constraint {
  type: 'budget' | 'time' | 'resource' | 'policy' | 'capacity';
  description: string;
  value: any;
  strict: boolean; // إلزامي أم مرن
}

export interface Impact {
  productivity: number; // -100 to 100
  quality: number; // -100 to 100
  morale: number; // -100 to 100
  cost: number; // -100 to 100
  time: number; // -100 to 100
  overall: number; // -100 to 100
}

export interface DecisionRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

export interface ContextAnalysis {
  situation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trends: Trend[];
  predictions: Prediction[];
  similarCases: SimilarCase[];
}

export interface Trend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number; // معدل التغير
  significance: 'low' | 'medium' | 'high';
}

export interface Prediction {
  scenario: string;
  probability: number; // 0-100
  timeframe: string;
  impact: string;
}

export interface SimilarCase {
  caseId: string;
  similarity: number; // 0-100
  decision: string;
  outcome: 'successful' | 'failed' | 'mixed';
  lessons: string[];
}

class AIAutoDecisionEngine {
  private rules: DecisionRule[] = [];

  /**
   * تحليل السياق واتخاذ القرار
   */
  analyzeAndDecide(context: DecisionContext): Decision {
    // تحليل الوضع
    const analysis = this.analyzeContext(context);
    
    // توليد الخيارات
    const options = this.generateOptions(context, analysis);
    
    // تقييم الخيارات
    const evaluatedOptions = this.evaluateOptions(options, context);
    
    // اختيار الأفضل
    const recommended = this.selectBestOption(evaluatedOptions, context);
    
    // توليد المبررات
    const reasoning = this.generateReasoning(recommended, evaluatedOptions, analysis);
    
    // حساب الثقة
    const confidence = this.calculateConfidence(analysis, recommended);
    
    // تحديد الإلحاح والتأثير
    const urgency = this.determineUrgency(analysis);
    const impact = this.determineImpact(recommended.estimatedImpact);

    return {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.inferDecisionType(context),
      title: this.generateTitle(context, recommended),
      description: this.generateDescription(context, analysis),
      context,
      options: evaluatedOptions,
      recommendedOption: recommended.id,
      reasoning,
      confidence,
      urgency,
      impact,
      createdAt: new Date(),
      expiresAt: urgency === 'critical' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ساعة
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // أسبوع
      status: 'pending'
    };
  }

  /**
   * تحليل السياق
   */
  private analyzeContext(context: DecisionContext): ContextAnalysis {
    // تحليل الوضع الحالي
    const situation = this.describeSituation(context);
    
    // تحديد الخطورة
    const severity = this.assessSeverity(context);
    
    // اكتشاف الاتجاهات
    const trends = this.detectTrends(context.currentState);
    
    // التنبؤات
    const predictions = this.makePredictions(trends);
    
    // البحث عن حالات مشابهة
    const similarCases = this.findSimilarCases(context);

    return {
      situation,
      severity,
      trends,
      predictions,
      similarCases
    };
  }

  /**
   * توليد الخيارات
   */
  private generateOptions(context: DecisionContext, analysis: ContextAnalysis): DecisionOption[] {
    const options: DecisionOption[] = [];

    // خيار 1: عدم التدخل (baseline)
    options.push({
      id: 'option_no_action',
      title: 'عدم التدخل - الاستمرار بالوضع الحالي',
      description: 'ترك الأمور تسير بشكل طبيعي دون تدخل',
      pros: ['لا تكلفة إضافية', 'لا مخاطر من التغيير'],
      cons: ['قد تتفاقم المشكلة', 'ضياع فرصة التحسين'],
      estimatedImpact: {
        productivity: -10,
        quality: -5,
        morale: 0,
        cost: 0,
        time: 0,
        overall: -5
      },
      cost: 0,
      timeRequired: '0',
      riskLevel: 'medium',
      probability: 40
    });

    // توليد خيارات بناءً على نوع المشكلة
    if (context.triggeredBy.includes('burnout') || context.triggeredBy.includes('stress')) {
      options.push({
        id: 'option_workload_reduction',
        title: 'تخفيف عبء العمل',
        description: 'إعادة توزيع المهام وتوفير إجازة قصيرة',
        pros: ['تحسين الصحة النفسية', 'منع الاحتراق الوظيفي', 'زيادة الإنتاجية على المدى الطويل'],
        cons: ['تأخير بعض المهام', 'حاجة لإعادة جدولة'],
        estimatedImpact: {
          productivity: -15,
          quality: 10,
          morale: 40,
          cost: -10,
          time: -20,
          overall: 25
        },
        cost: 5000,
        timeRequired: 'أسبوعين',
        riskLevel: 'low',
        probability: 85
      });
    }

    if (context.triggeredBy.includes('performance') || context.triggeredBy.includes('quality')) {
      options.push({
        id: 'option_training',
        title: 'برنامج تدريبي مكثف',
        description: 'توفير تدريب مستهدف لسد الفجوات',
        pros: ['تحسين المهارات', 'زيادة الثقة', 'حل مستدام'],
        cons: ['تكلفة عالية', 'وقت التنفيذ طويل', 'يحتاج التزام'],
        estimatedImpact: {
          productivity: 30,
          quality: 40,
          morale: 20,
          cost: -25,
          time: -15,
          overall: 35
        },
        cost: 15000,
        timeRequired: 'شهر',
        riskLevel: 'medium',
        probability: 75
      });
    }

    if (context.triggeredBy.includes('task') || context.triggeredBy.includes('delay')) {
      options.push({
        id: 'option_priority_adjustment',
        title: 'إعادة ترتيب الأولويات',
        description: 'تأجيل المهام غير العاجلة والتركيز على الحرجة',
        pros: ['تركيز أفضل', 'إنجاز أسرع للمهم', 'تقليل الضغط'],
        cons: ['تأخير بعض المشاريع', 'قد يسبب إحباط للعملاء'],
        estimatedImpact: {
          productivity: 20,
          quality: 15,
          morale: 10,
          cost: 0,
          time: 15,
          overall: 20
        },
        cost: 0,
        timeRequired: 'فوري',
        riskLevel: 'low',
        probability: 90
      });
    }

    return options;
  }

  /**
   * تقييم الخيارات
   */
  private evaluateOptions(options: DecisionOption[], context: DecisionContext): DecisionOption[] {
    return options.filter(option => {
      // Check for strict constraint violations
      const violatesStrict = context.constraints.some(constraint => {
        if (constraint.strict) {
          if (constraint.type === 'budget') return option.cost > constraint.value;
          // Add other strict checks if needed
        }
        return false;
      });
      
      return !violatesStrict;
    }).map(option => {
      // Apply non-strict constraints penalties
      const violatesNonStrict = context.constraints.some(constraint => {
        if (!constraint.strict) {
          if (constraint.type === 'budget') return option.cost > constraint.value;
        }
        return false;
      });

      if (violatesNonStrict) {
        option.probability *= 0.5;
      }

      return option;
    });
  }

  /**
   * اختيار الخيار الأفضل
   */
  private selectBestOption(options: DecisionOption[], context: DecisionContext): DecisionOption {
    // حساب نقاط لكل خيار
    const scores = options.map(option => {
      let score = 0;

      // الأثر الإجمالي (وزن 40%)
      score += option.estimatedImpact.overall * 0.4;

      // احتمالية النجاح (وزن 30%)
      score += option.probability * 0.3;

      // التكلفة (وزن 20% - كلما أقل كلما أفضل)
      score += (100 - Math.min(option.cost / 1000, 100)) * 0.2;

      // المخاطر (وزن 10% - كلما أقل كلما أفضل)
      const riskScore = option.riskLevel === 'low' ? 100 : option.riskLevel === 'medium' ? 50 : 0;
      score += riskScore * 0.1;

      return { option, score };
    });

    // اختيار الأعلى نقاطاً
    scores.sort((a, b) => b.score - a.score);
    return scores[0].option;
  }

  /**
   * توليد المبررات
   */
  private generateReasoning(
    recommended: DecisionOption,
    allOptions: DecisionOption[],
    analysis: ContextAnalysis
  ): string[] {
    const reasons: string[] = [];

    // سبب اختيار هذا الخيار
    reasons.push(`📊 الخيار الموصى به: "${recommended.title}"`);
    reasons.push(`✅ احتمالية النجاح: ${recommended.probability}%`);
    reasons.push(`📈 الأثر الإجمالي المتوقع: ${recommended.estimatedImpact.overall > 0 ? '+' : ''}${recommended.estimatedImpact.overall}`);

    // مقارنة مع الخيارات الأخرى
    const others = allOptions.filter(o => o.id !== recommended.id);
    if (others.length > 0) {
      reasons.push(`\n💡 تم مقارنة ${others.length + 1} خيارات وهذا هو الأفضل`);
    }

    // حالات مشابهة
    if (analysis.similarCases.length > 0) {
      const successfulCases = analysis.similarCases.filter(c => c.outcome === 'successful');
      if (successfulCases.length > 0) {
        reasons.push(`📚 ${successfulCases.length} حالة مشابهة نجحت بقرارات مماثلة`);
      }
    }

    // الفوائد الرئيسية
    recommended.pros.slice(0, 3).forEach(pro => {
      reasons.push(`✓ ${pro}`);
    });

    // التحذيرات
    if (recommended.cons.length > 0) {
      reasons.push(`\n⚠️ نقاط يجب الانتباه لها:`);
      recommended.cons.slice(0, 2).forEach(con => {
        reasons.push(`  • ${con}`);
      });
    }

    return reasons;
  }

  /**
   * حساب مستوى الثقة
   */
  private calculateConfidence(analysis: ContextAnalysis, option: DecisionOption): number {
    let confidence = 50; // ثقة أساسية

    // الحالات المشابهة تزيد الثقة
    const similarityScore = analysis.similarCases.reduce((sum, c) => sum + c.similarity, 0);
    confidence += Math.min(similarityScore / 10, 30);

    // احتمالية النجاح
    confidence += (option.probability / 100) * 15;

    // قوة البيانات
    const strongTrends = analysis.trends.filter(t => t.significance === 'high').length;
    confidence += strongTrends * 5;

    return Math.min(Math.round(confidence), 100);
  }

  /**
   * دوال مساعدة
   */
  private describeSituation(context: DecisionContext): string {
    return `الوضع الحالي: ${context.triggeredBy}`;
  }

  private assessSeverity(context: DecisionContext): 'low' | 'medium' | 'high' | 'critical' {
    if (context.triggeredBy.includes('critical') || context.triggeredBy.includes('emergency')) {
      return 'critical';
    }
    if (context.triggeredBy.includes('burnout') || context.triggeredBy.includes('high')) {
      return 'high';
    }
    if (context.triggeredBy.includes('medium') || context.triggeredBy.includes('warning')) {
      return 'medium';
    }
    return 'low';
  }

  private detectTrends(state: Record<string, any>): Trend[] {
    // في الواقع، هذا يحتاج بيانات تاريخية
    return [];
  }

  private makePredictions(trends: Trend[]): Prediction[] {
    return [];
  }

  private findSimilarCases(context: DecisionContext): SimilarCase[] {
    // في الواقع، هذا يبحث في قاعدة بيانات القرارات السابقة
    return [];
  }

  private inferDecisionType(context: DecisionContext): Decision['type'] {
    if (context.triggeredBy.includes('task')) return 'task-assignment';
    if (context.triggeredBy.includes('budget')) return 'budget-approval';
    if (context.triggeredBy.includes('resource')) return 'resource-allocation';
    if (context.triggeredBy.includes('priority')) return 'priority-adjustment';
    if (context.triggeredBy.includes('risk')) return 'risk-mitigation';
    return 'performance-action';
  }

  private generateTitle(context: DecisionContext, option: DecisionOption): string {
    return `قرار: ${option.title}`;
  }

  private generateDescription(context: DecisionContext, analysis: ContextAnalysis): string {
    return `${analysis.situation}. يتطلب قرار ${analysis.severity === 'critical' ? 'عاجل' : 'مناسب'}.`;
  }

  private determineUrgency(analysis: ContextAnalysis): Decision['urgency'] {
    if (analysis.severity === 'critical') return 'critical';
    if (analysis.severity === 'high') return 'high';
    if (analysis.severity === 'medium') return 'medium';
    return 'low';
  }

  private determineImpact(impact: Impact): Decision['impact'] {
    const absImpact = Math.abs(impact.overall);
    if (absImpact >= 75) return 'major';
    if (absImpact >= 50) return 'significant';
    if (absImpact >= 25) return 'moderate';
    return 'minor';
  }

  /**
   * قبول القرار
   */
  acceptDecision(decision: Decision, userId: string): Decision {
    return {
      ...decision,
      status: 'accepted',
      decidedBy: userId,
      decidedAt: new Date()
    };
  }

  /**
   * رفض القرار
   */
  rejectDecision(decision: Decision, userId: string, reason: string): Decision {
    return {
      ...decision,
      status: 'rejected',
      decidedBy: userId,
      decidedAt: new Date(),
      outcomeNotes: reason
    };
  }

  /**
   * تسجيل النتيجة الفعلية
   */
  recordOutcome(decision: Decision, outcome: string, notes: string): Decision {
    return {
      ...decision,
      actualOutcome: outcome,
      outcomeNotes: notes
    };
  }
}

export const aiAutoDecision = new AIAutoDecisionEngine();
