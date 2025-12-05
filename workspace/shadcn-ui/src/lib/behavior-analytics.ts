/**
 * BEHAVIOR ANALYTICS ENGINE
 * تحليل السلوك والتشتت - فهم كيف يعمل الموظف
 */

import { MicroEvent, BehaviorMetrics } from './micro-measurement';

export interface DistractionAnalysis {
  employeeId: string;
  employeeName: string;
  distractionIndex: number; // 0-100
  confusionScore: number; // 0-100
  stressIndicator: number; // 0-100
  focusQuality: 'excellent' | 'good' | 'fair' | 'poor';
  patterns: DistractionPattern[];
  recommendations: string[];
  timestamp: Date;
}

export interface DistractionPattern {
  type: 'frequent_switching' | 'long_idle' | 'rapid_clicking' | 'hesitation' | 'confusion';
  severity: 'low' | 'medium' | 'high';
  description: string;
  frequency: number;
  averageDuration: number;
}

export interface ConfusionMap {
  screenName: string;
  confusionScore: number;
  indicators: {
    backtracking: number; // عدد مرات الرجوع
    hesitationTime: number; // وقت التردد بالميلي ثانية
    errorClicks: number; // نقرات خاطئة
    helpSearches: number; // بحث عن مساعدة
  };
}

export interface StressIndicators {
  rapidClicking: number; // نقرات سريعة متتالية
  typingErrors: number; // أخطاء كتابة
  taskSwitching: number; // تبديل مهام
  workingHoursLate: boolean; // عمل في ساعات متأخرة
  shortBreaks: number; // استراحات قصيرة جداً
}

export interface BehaviorScore {
  employeeId: string;
  employeeName: string;
  productivityScore: number; // 0-100
  engagementScore: number; // 0-100
  efficiencyScore: number; // 0-100
  qualityScore: number; // 0-100
  overallScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

class BehaviorAnalyticsEngine {
  /**
   * حساب مؤشر التشتت
   */
  calculateDistractionIndex(events: MicroEvent[]): number {
    if (events.length === 0) return 0;

    let distractionScore = 0;
    const timeWindow = 60000; // دقيقة واحدة

    // تحليل التبديل السريع بين الشاشات
    const navigationEvents = events.filter(e => e.eventType === 'navigation');
    const navigationGroups: MicroEvent[][] = [];
    let currentGroup: MicroEvent[] = [];

    navigationEvents.forEach((event, i) => {
      if (i === 0) {
        currentGroup = [event];
      } else {
        const timeDiff = new Date(event.timestamp).getTime() - 
                        new Date(navigationEvents[i-1].timestamp).getTime();
        
        if (timeDiff < timeWindow) {
          currentGroup.push(event);
        } else {
          if (currentGroup.length > 0) {
            navigationGroups.push(currentGroup);
          }
          currentGroup = [event];
        }
      }
    });

    // Add the last group if it exists
    if (currentGroup.length > 0) {
      navigationGroups.push(currentGroup);
    }

    // إذا كان هناك أكثر من 5 تنقلات في دقيقة = تشتت عالي
    navigationGroups.forEach(group => {
      if (group.length > 5) {
        distractionScore += (group.length - 5) * 10;
      }
    });

    // تحليل فقدان التركيز
    const blurEvents = events.filter(e => e.eventType === 'blur');
    const totalBlurTime = blurEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalTime = events.length > 0 
      ? new Date(events[events.length - 1].timestamp).getTime() - 
        new Date(events[0].timestamp).getTime()
      : 0;

    if (totalTime > 0) {
      const blurPercentage = (totalBlurTime / totalTime) * 100;
      distractionScore += blurPercentage;
    }

    return Math.min(Math.round(distractionScore), 100);
  }

  /**
   * حساب درجة الحيرة والتردد
   */
  calculateConfusionScore(events: MicroEvent[]): number {
    if (events.length === 0) return 0;

    let confusionScore = 0;

    // تحليل التردد في النقرات
    const clickEvents = events.filter(e => e.eventType === 'click');
    let hesitationCount = 0;

    for (let i = 1; i < clickEvents.length; i++) {
      const timeDiff = new Date(clickEvents[i].timestamp).getTime() - 
                      new Date(clickEvents[i-1].timestamp).getTime();
      
      // إذا كان الفرق بين نقرتين أكثر من 5 ثوانٍ = تردد
      if (timeDiff > 5000 && timeDiff < 30000) {
        hesitationCount++;
      }
    }

    if (clickEvents.length > 0) {
      confusionScore += (hesitationCount / clickEvents.length) * 50;
    }

    // تحليل الرجوع للشاشات السابقة (backtracking)
    const navigationEvents = events.filter(e => e.eventType === 'navigation');
    const screenHistory: string[] = [];
    let backtrackCount = 0;

    navigationEvents.forEach(event => {
      const screenName = event.screenName;
      const lastIndex = screenHistory.lastIndexOf(screenName);
      
      if (lastIndex !== -1 && lastIndex < screenHistory.length - 1) {
        backtrackCount++;
      }
      
      screenHistory.push(screenName);
    });

    if (navigationEvents.length > 0) {
      confusionScore += (backtrackCount / navigationEvents.length) * 50;
    }

    return Math.min(Math.round(confusionScore), 100);
  }

  /**
   * حساب مؤشرات التوتر
   */
  calculateStressIndicators(events: MicroEvent[]): StressIndicators {
    const clickEvents = events.filter(e => e.eventType === 'click');
    
    // نقرات سريعة متتالية (أقل من 200ms)
    let rapidClicking = 0;
    for (let i = 1; i < clickEvents.length; i++) {
      const timeDiff = new Date(clickEvents[i].timestamp).getTime() - 
                      new Date(clickEvents[i-1].timestamp).getTime();
      if (timeDiff < 200) {
        rapidClicking++;
      }
    }

    // تبديل المهام (تنقلات سريعة)
    const navigationEvents = events.filter(e => e.eventType === 'navigation');
    const taskSwitching = navigationEvents.filter((_, i, arr) => {
      if (i === 0) return false;
      const timeDiff = new Date(arr[i].timestamp).getTime() - 
                      new Date(arr[i-1].timestamp).getTime();
      return timeDiff < 5000;
    }).length;

    // فحص ساعات العمل
    const eventTimes = events.map(e => new Date(e.timestamp).getHours());
    const workingHoursLate = eventTimes.some(hour => hour >= 22 || hour <= 5);

    return {
      rapidClicking,
      typingErrors: 0, // يتم حسابها من بيانات الكتابة الفعلية
      taskSwitching,
      workingHoursLate,
      shortBreaks: 0 // يتم حسابها من فترات الراحة
    };
  }

  /**
   * تحليل أنماط التشتت
   */
  analyzeDistractionPatterns(events: MicroEvent[]): DistractionPattern[] {
    const patterns: DistractionPattern[] = [];

    // نمط: التبديل المتكرر
    const navigationEvents = events.filter(e => e.eventType === 'navigation');
    const switchingRate = navigationEvents.length / (events.length || 1);
    
    if (switchingRate > 0.3) {
      patterns.push({
        type: 'frequent_switching',
        severity: switchingRate > 0.5 ? 'high' : 'medium',
        description: 'يقوم بالتبديل بين الشاشات بشكل متكرر',
        frequency: navigationEvents.length,
        averageDuration: 0
      });
    }

    // نمط: فترات الخمول الطويلة
    const blurEvents = events.filter(e => e.eventType === 'blur');
    const longIdles = blurEvents.filter(e => (e.duration || 0) > 60000); // أكثر من دقيقة
    
    if (longIdles.length > 0) {
      const avgIdleTime = longIdles.reduce((sum, e) => sum + (e.duration || 0), 0) / longIdles.length;
      patterns.push({
        type: 'long_idle',
        severity: avgIdleTime > 300000 ? 'high' : 'medium',
        description: 'فترات خمول طويلة تشير إلى تشتت أو انقطاع',
        frequency: longIdles.length,
        averageDuration: avgIdleTime
      });
    }

    // نمط: النقر السريع
    const clickEvents = events.filter(e => e.eventType === 'click');
    let rapidClicks = 0;
    
    for (let i = 1; i < clickEvents.length; i++) {
      const timeDiff = new Date(clickEvents[i].timestamp).getTime() - 
                      new Date(clickEvents[i-1].timestamp).getTime();
      if (timeDiff < 300) rapidClicks++;
    }

    if (rapidClicks > 10) {
      patterns.push({
        type: 'rapid_clicking',
        severity: rapidClicks > 30 ? 'high' : 'medium',
        description: 'نقرات سريعة ومتتالية قد تشير إلى توتر أو استعجال',
        frequency: rapidClicks,
        averageDuration: 0
      });
    }

    return patterns;
  }

  /**
   * إنشاء خريطة الحيرة للشاشات
   */
  createConfusionMap(events: MicroEvent[]): ConfusionMap[] {
    const screenGroups = new Map<string, MicroEvent[]>();

    events.forEach(event => {
      if (!screenGroups.has(event.screenName)) {
        screenGroups.set(event.screenName, []);
      }
      screenGroups.get(event.screenName)!.push(event);
    });

    const confusionMaps: ConfusionMap[] = [];

    screenGroups.forEach((screenEvents, screenName) => {
      // حساب مرات الرجوع
      const navigationEvents = events.filter(e => 
        e.eventType === 'navigation' && e.screenName === screenName
      );
      const backtracking = navigationEvents.length - 1; // أول زيارة لا تحسب

      // حساب وقت التردد
      const clickEvents = screenEvents.filter(e => e.eventType === 'click');
      let hesitationTime = 0;
      
      for (let i = 1; i < clickEvents.length; i++) {
        const timeDiff = new Date(clickEvents[i].timestamp).getTime() - 
                        new Date(clickEvents[i-1].timestamp).getTime();
        if (timeDiff > 5000 && timeDiff < 30000) {
          hesitationTime += timeDiff;
        }
      }

      // درجة الحيرة للشاشة
      const confusionScore = Math.min(
        (backtracking * 20) + (hesitationTime / 1000) + (clickEvents.length * 2),
        100
      );

      confusionMaps.push({
        screenName,
        confusionScore: Math.round(confusionScore),
        indicators: {
          backtracking,
          hesitationTime,
          errorClicks: 0, // يحتاج بيانات إضافية
          helpSearches: 0 // يحتاج بيانات إضافية
        }
      });
    });

    return confusionMaps.sort((a, b) => b.confusionScore - a.confusionScore);
  }

  /**
   * توليد التوصيات بناءً على التحليل
   */
  generateRecommendations(analysis: DistractionAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.distractionIndex > 70) {
      recommendations.push('⚠️ مستوى تشتت عالي - يحتاج إلى تقليل المشتتات والمقاطعات');
      recommendations.push('💡 اقترح فترات عمل مركزة (Pomodoro) بدون مقاطعات');
    }

    if (analysis.confusionScore > 60) {
      recommendations.push('🎯 يظهر حيرة في بعض الشاشات - يحتاج تدريب إضافي');
      recommendations.push('📚 توفير أدلة استخدام مبسطة للوظائف المعقدة');
    }

    if (analysis.stressIndicator > 70) {
      recommendations.push('😰 مؤشرات توتر عالية - يحتاج استراحة أو تخفيف العبء');
      recommendations.push('🧘 اقترح فترات راحة قصيرة كل 50 دقيقة');
    }

    analysis.patterns.forEach(pattern => {
      if (pattern.type === 'frequent_switching' && pattern.severity === 'high') {
        recommendations.push('🔄 تبديل متكرر بين المهام - حاول التركيز على مهمة واحدة');
      }
      
      if (pattern.type === 'long_idle') {
        recommendations.push('⏸️ فترات خمول ملحوظة - تحقق من الأسباب (مقاطعات؟ نقص تحفيز؟)');
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('✅ أداء جيد - استمر على هذا المنوال');
    }

    return recommendations;
  }

  /**
   * تحليل شامل للسلوك
   */
  performFullAnalysis(
    employeeId: string,
    employeeName: string,
    events: MicroEvent[]
  ): DistractionAnalysis {
    const distractionIndex = this.calculateDistractionIndex(events);
    const confusionScore = this.calculateConfusionScore(events);
    const stressIndicators = this.calculateStressIndicators(events);
    
    // حساب مؤشر التوتر الإجمالي
    const stressIndicator = Math.min(
      (stressIndicators.rapidClicking * 2) +
      (stressIndicators.taskSwitching * 3) +
      (stressIndicators.workingHoursLate ? 20 : 0),
      100
    );

    const patterns = this.analyzeDistractionPatterns(events);

    // تحديد جودة التركيز
    let focusQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (distractionIndex < 30) focusQuality = 'excellent';
    else if (distractionIndex < 50) focusQuality = 'good';
    else if (distractionIndex < 70) focusQuality = 'fair';
    else focusQuality = 'poor';

    const analysis: DistractionAnalysis = {
      employeeId,
      employeeName,
      distractionIndex,
      confusionScore,
      stressIndicator,
      focusQuality,
      patterns,
      recommendations: [],
      timestamp: new Date()
    };

    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * حساب درجة السلوك الشاملة
   */
  calculateBehaviorScore(
    employeeId: string,
    employeeName: string,
    events: MicroEvent[],
    previousScore?: BehaviorScore
  ): BehaviorScore {
    const analysis = this.performFullAnalysis(employeeId, employeeName, events);

    // حساب الإنتاجية
    const productivityScore = Math.max(0, 100 - analysis.distractionIndex);

    // حساب المشاركة
    const engagementScore = Math.max(0, 100 - analysis.confusionScore);

    // حساب الكفاءة
    const clickEvents = events.filter(e => e.eventType === 'click');
    const totalTime = events.length > 0
      ? new Date(events[events.length - 1].timestamp).getTime() - 
        new Date(events[0].timestamp).getTime()
      : 0;
    const efficiencyScore = totalTime > 0
      ? Math.min((clickEvents.length / (totalTime / 60000)) * 10, 100)
      : 50;

    // حساب الجودة
    const qualityScore = Math.max(0, 100 - analysis.stressIndicator);

    // الدرجة الإجمالية
    const overallScore = Math.round(
      (productivityScore * 0.3) +
      (engagementScore * 0.25) +
      (efficiencyScore * 0.25) +
      (qualityScore * 0.2)
    );

    // تحديد الاتجاه
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (previousScore) {
      if (overallScore > previousScore.overallScore + 5) trend = 'improving';
      else if (overallScore < previousScore.overallScore - 5) trend = 'declining';
    }

    return {
      employeeId,
      employeeName,
      productivityScore: Math.round(productivityScore),
      engagementScore: Math.round(engagementScore),
      efficiencyScore: Math.round(efficiencyScore),
      qualityScore: Math.round(qualityScore),
      overallScore,
      trend,
      lastUpdated: new Date()
    };
  }
}

export const behaviorAnalytics = new BehaviorAnalyticsEngine();
