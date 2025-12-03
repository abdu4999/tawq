/**
 * BURNOUT LAB - مختبر الاحتراق الوظيفي
 * يقيس ويتنبأ باحتمالية الاحتراق الوظيفي للموظفين
 */

export interface BurnoutRecord {
  employeeId: string;
  employeeName: string;
  burnoutScore: number; // 0-100
  fatigueLevel: number; // 0-100
  stressLevel: number; // 0-100
  workloadIndex: number; // 0-100
  recoveryScore: number; // 0-100 قدرة على التعافي
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  symptoms: BurnoutSymptom[];
  weeklyTrend: TrendPoint[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface BurnoutSymptom {
  type: 'exhaustion' | 'cynicism' | 'inefficacy' | 'detachment' | 'physical';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  detected: Date;
}

export interface TrendPoint {
  date: Date;
  burnoutScore: number;
  fatigueLevel: number;
  stressLevel: number;
}

export interface BurnoutPrediction {
  employeeId: string;
  predictedBurnout: number;
  timeToRisk: number; // أيام حتى الوصول لمستوى خطر
  confidence: number; // 0-1
  preventiveActions: string[];
}

class BurnoutLabEngine {
  /**
   * حساب درجة الاحتراق الوظيفي
   */
  calculateBurnoutScore(
    workHours: number,
    tasksCompleted: number,
    tasksOverdue: number,
    errorRate: number,
    focusScore: number,
    restDays: number
  ): number {
    // المعادلة الأساسية للاحتراق
    let burnoutScore = 0;

    // ساعات العمل الطويلة (أكثر من 50 ساعة أسبوعياً)
    if (workHours > 50) {
      burnoutScore += (workHours - 50) * 2;
    }

    // المهام المتأخرة تزيد الضغط
    burnoutScore += tasksOverdue * 5;

    // معدل الأخطاء يشير للإرهاق
    burnoutScore += errorRate * 10;

    // انخفاض التركيز
    burnoutScore += (100 - focusScore) * 0.5;

    // قلة الراحة
    if (restDays < 1) {
      burnoutScore += 20;
    }

    return Math.min(Math.round(burnoutScore), 100);
  }

  /**
   * حساب مستوى الإرهاق
   */
  calculateFatigueLevel(
    consecutiveWorkDays: number,
    averageWorkHoursPerDay: number,
    sleepQualityIndicator: number // من micro measurement
  ): number {
    let fatigue = 0;

    // أيام عمل متواصلة بدون راحة
    fatigue += consecutiveWorkDays * 5;

    // ساعات عمل يومية
    if (averageWorkHoursPerDay > 10) {
      fatigue += (averageWorkHoursPerDay - 10) * 8;
    }

    // جودة النوم (مؤشرات من أوقات العمل المتأخرة)
    fatigue += (100 - sleepQualityIndicator) * 0.3;

    return Math.min(Math.round(fatigue), 100);
  }

  /**
   * اكتشاف أعراض الاحتراق
   */
  detectSymptoms(
    burnoutScore: number,
    productivityChange: number, // سلبي = انخفاض
    engagementScore: number,
    errorRate: number
  ): BurnoutSymptom[] {
    const symptoms: BurnoutSymptom[] = [];

    // الإرهاق (Exhaustion)
    if (burnoutScore > 60) {
      symptoms.push({
        type: 'exhaustion',
        severity: burnoutScore > 80 ? 'severe' : 'moderate',
        description: 'علامات الإرهاق الشديد وانخفاض الطاقة',
        detected: new Date()
      });
    }

    // السخرية وفقدان الحماس (Cynicism)
    if (engagementScore < 40) {
      symptoms.push({
        type: 'cynicism',
        severity: engagementScore < 20 ? 'severe' : 'moderate',
        description: 'انخفاض الحماس والانفصال العاطفي عن العمل',
        detected: new Date()
      });
    }

    // الشعور بعدم الفعالية (Inefficacy)
    if (productivityChange < -30) {
      symptoms.push({
        type: 'inefficacy',
        severity: productivityChange < -50 ? 'severe' : 'moderate',
        description: 'انخفاض حاد في الإنتاجية والشعور بعدم القدرة على الإنجاز',
        detected: new Date()
      });
    }

    // الانفصال (Detachment)
    if (engagementScore < 30 && burnoutScore > 50) {
      symptoms.push({
        type: 'detachment',
        severity: 'moderate',
        description: 'الانعزال وتجنب التفاعل مع الفريق والمهام',
        detected: new Date()
      });
    }

    // أعراض جسدية (Physical)
    if (errorRate > 20 && burnoutScore > 70) {
      symptoms.push({
        type: 'physical',
        severity: 'severe',
        description: 'أعراض جسدية: زيادة الأخطاء، بطء الاستجابة',
        detected: new Date()
      });
    }

    return symptoms;
  }

  /**
   * تحديد مستوى الخطر
   */
  determineRiskLevel(burnoutScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (burnoutScore >= 80) return 'critical';
    if (burnoutScore >= 60) return 'high';
    if (burnoutScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * توليد توصيات
   */
  generateRecommendations(record: BurnoutRecord): string[] {
    const recommendations: string[] = [];

    if (record.riskLevel === 'critical') {
      recommendations.push('🚨 حالة حرجة! يحتاج إجازة فورية لمدة 3-5 أيام على الأقل');
      recommendations.push('👨‍⚕️ استشارة طبيب أو أخصائي نفسي ضرورية');
      recommendations.push('📉 تقليل عبء العمل بنسبة 50% على الأقل');
    }

    if (record.riskLevel === 'high') {
      recommendations.push('⚠️ يحتاج راحة عاجلة - إجازة 2-3 أيام');
      recommendations.push('🔄 إعادة توزيع بعض المهام على زملاء آخرين');
      recommendations.push('💆 أنشطة استرخاء وتخفيف الضغط');
    }

    if (record.fatigueLevel > 70) {
      recommendations.push('😴 يحتاج تحسين جودة النوم - تجنب العمل المتأخر');
      recommendations.push('⏰ ساعات عمل مرنة للتعافي');
    }

    if (record.workloadIndex > 80) {
      recommendations.push('📊 عبء العمل مرتفع جداً - يحتاج تخفيف فوري');
      recommendations.push('👥 توظيف مساعد أو توزيع المهام');
    }

    record.symptoms.forEach(symptom => {
      if (symptom.type === 'exhaustion' && symptom.severity === 'severe') {
        recommendations.push('🔋 استراحات متكررة (15 دقيقة كل ساعتين)');
      }
      if (symptom.type === 'cynicism') {
        recommendations.push('💬 جلسات تحفيزية ومناقشة الأهداف الشخصية');
      }
      if (symptom.type === 'inefficacy') {
        recommendations.push('🎯 تحديد أهداف صغيرة قابلة للتحقيق لاستعادة الثقة');
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('✅ مستوى صحي - استمر في الحفاظ على التوازن');
    }

    return recommendations;
  }

  /**
   * التنبؤ باحتمالية الاحتراق المستقبلي
   */
  predictFutureBurnout(
    currentBurnout: number,
    trend: TrendPoint[]
  ): BurnoutPrediction {
    // حساب معدل الزيادة
    if (trend.length < 2) {
      return {
        employeeId: '',
        predictedBurnout: currentBurnout,
        timeToRisk: 999,
        confidence: 0.5,
        preventiveActions: []
      };
    }

    const recentTrend = trend.slice(-7); // آخر أسبوع
    const avgIncrease = recentTrend.reduce((sum, point, i) => {
      if (i === 0) return 0;
      return sum + (point.burnoutScore - recentTrend[i-1].burnoutScore);
    }, 0) / (recentTrend.length - 1);

    // التنبؤ بالوقت حتى الوصول لمستوى خطر (80+)
    let timeToRisk = 999;
    if (avgIncrease > 0 && currentBurnout < 80) {
      timeToRisk = Math.ceil((80 - currentBurnout) / avgIncrease);
    }

    // التنبؤ بالنقاط بعد 7 أيام
    const predictedBurnout = Math.min(currentBurnout + (avgIncrease * 7), 100);

    const preventiveActions: string[] = [];
    if (predictedBurnout > 70) {
      preventiveActions.push('تقليل ساعات العمل الأسبوعية');
      preventiveActions.push('جدولة إجازة قريبة');
      preventiveActions.push('تفويض بعض المهام');
    }

    return {
      employeeId: '',
      predictedBurnout: Math.round(predictedBurnout),
      timeToRisk,
      confidence: recentTrend.length >= 5 ? 0.8 : 0.6,
      preventiveActions
    };
  }

  /**
   * تحليل شامل للاحتراق
   */
  performFullAnalysis(
    employeeId: string,
    employeeName: string,
    workData: {
      weeklyHours: number;
      tasksCompleted: number;
      tasksOverdue: number;
      errorRate: number;
      focusScore: number;
      restDays: number;
      consecutiveWorkDays: number;
      avgHoursPerDay: number;
      productivityChange: number;
      engagementScore: number;
    },
    historicalTrend?: TrendPoint[]
  ): BurnoutRecord {
    const burnoutScore = this.calculateBurnoutScore(
      workData.weeklyHours,
      workData.tasksCompleted,
      workData.tasksOverdue,
      workData.errorRate,
      workData.focusScore,
      workData.restDays
    );

    const fatigueLevel = this.calculateFatigueLevel(
      workData.consecutiveWorkDays,
      workData.avgHoursPerDay,
      workData.focusScore // استخدام focus كمؤشر لجودة النوم
    );

    const stressLevel = Math.min(
      (workData.tasksOverdue * 5) + (workData.errorRate * 3),
      100
    );

    const workloadIndex = Math.min(
      (workData.weeklyHours / 40) * 50 + (workData.tasksOverdue * 2),
      100
    );

    const recoveryScore = Math.max(
      100 - ((100 - workData.focusScore) + workData.consecutiveWorkDays * 5),
      0
    );

    const symptoms = this.detectSymptoms(
      burnoutScore,
      workData.productivityChange,
      workData.engagementScore,
      workData.errorRate
    );

    const riskLevel = this.determineRiskLevel(burnoutScore);

    const weeklyTrend = historicalTrend || [
      {
        date: new Date(),
        burnoutScore,
        fatigueLevel,
        stressLevel
      }
    ];

    const record: BurnoutRecord = {
      employeeId,
      employeeName,
      burnoutScore: Math.round(burnoutScore),
      fatigueLevel: Math.round(fatigueLevel),
      stressLevel: Math.round(stressLevel),
      workloadIndex: Math.round(workloadIndex),
      recoveryScore: Math.round(recoveryScore),
      riskLevel,
      symptoms,
      weeklyTrend,
      recommendations: [],
      lastUpdated: new Date()
    };

    record.recommendations = this.generateRecommendations(record);

    return record;
  }
}

export const burnoutLab = new BurnoutLabEngine();
