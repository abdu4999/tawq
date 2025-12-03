import { Employee, Task, Project } from './types';

export interface AIRecommendation {
  id: string;
  type: 'task' | 'training' | 'motivation' | 'performance';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  employeeId: string;
  confidence: number;
  actionRequired: boolean;
}

export interface PsychologicalProfile {
  employeeId: string;
  motivation: 'high' | 'medium' | 'low';
  stress: 'high' | 'medium' | 'low';
  engagement: 'high' | 'medium' | 'low';
  burnout: number; // 0-100
  recommendations: string[];
  lastUpdated: Date;
}

// خريطة ذكاء الموظف
export interface EmployeeIntelligenceMap {
  employeeId: string;
  skills: {
    learningSpeed: number; // 0-100
    taskCompletion: number;
    adaptability: number;
    instructionComprehension: number;
    decisionQuality: number;
    dataAnalysis: number;
    responseToChange: number;
    stressHandling: number;
    communicationSkills: number;
    dataEntryAccuracy: number;
    problemSolving: number;
    attentionToDetail: number;
  };
  strengths: string[];
  weaknesses: string[];
  developmentSuggestions: string[];
  suitableTasks: string[];
  growthPrediction: {
    threeMonths: number;
    sixMonths: number;
  };
  lastUpdated: Date;
}

// مؤشر مخاطر الاستقالة
export interface TurnoverRisk {
  employeeId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    passionDecline: number;
    errorIncrease: number;
    usageDecrease: number;
    lackOfCommunication: number;
    burnoutLevel: number;
    taskIncompletion: number;
    stressIndicators: number;
    behaviorChange: number;
    loginPatternChange: number;
    lackOfInitiative: number;
    distraction: number;
    productivityDecline: number;
  };
  reasons: string[];
  recommendations: string[];
  urgency: 'immediate' | 'urgent' | 'monitor' | 'stable';
  lastUpdated: Date;
}

// خطة التطوير الفردية
export interface IndividualDevelopmentPlan {
  employeeId: string;
  strengths: string[];
  weaknesses: string[];
  goals: {
    thirtyDays: Goal[];
    ninetyDays: Goal[];
    sixMonths: Goal[];
  };
  training: {
    courses: string[];
    videos: string[];
    practicalTasks: string[];
    mentoringSessions: string[];
  };
  performanceImprovement: {
    taskTypes: string[];
    taskVolume: string;
    restPeriods: string;
    stressDistribution: string;
    workPatternChanges: string[];
  };
  readinessLevel: number; // 0-100
  lastUpdated: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  priority: 'high' | 'medium' | 'low';
}

// تحليل سلوك التصفح
export interface NavigationBehavior {
  employeeId: string;
  metrics: {
    totalNavigations: number;
    averageTimePerPage: Record<string, number>;
    frequentlyVisitedPages: Array<{ page: string; visits: number }>;
    confusionPoints: Array<{ page: string; indicators: string[] }>;
    errorPronePages: Array<{ page: string; errorCount: number }>;
    avoidedPages: string[];
  };
  uxIssues: {
    page: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
  }[];
  lastUpdated: Date;
}

// جودة إدخال البيانات
export interface DataEntryQuality {
  employeeId: string;
  metrics: {
    averageEntryTime: number;
    entrySpeed: number; // chars per minute
    errorsDuringEntry: number;
    fieldsModified: number;
    difficultFields: string[];
    ignoredFields: string[];
    accuracy: number; // 0-100
  };
  comparison: {
    rankAmongPeers: number;
    averageTeamAccuracy: number;
  };
  recommendations: string[];
  trainingNeeds: string[];
  lastUpdated: Date;
}

// مراقبة استخدام النظام
export interface SystemUsageMonitor {
  employeeId: string;
  sessions: {
    loginTime: Date;
    logoutTime: Date;
    duration: number;
    longestSession: number;
    averageSession: number;
  };
  pageUsage: {
    mostUsed: Array<{ page: string; time: number }>;
    leastUsed: string[];
    timeConsumingPages: Array<{ page: string; avgTime: number }>;
    frictionPages: Array<{ page: string; reason: string }>;
  };
  productivity: {
    peakHours: string[];
    lowActivityPeriods: string[];
    overallProductivity: number; // 0-100
  };
  lastUpdated: Date;
}

// تنبيهات فورية
export interface RealTimeAlert {
  id: string;
  type: 'performance' | 'burnout' | 'quality' | 'behavior' | 'turnover';
  severity: 'critical' | 'high' | 'medium' | 'low';
  employeeId: string;
  employeeName: string;
  title: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  suggestedActions: string[];
}

interface TrendData {
  pointsTrend: number;
  earningsTrend: number;
}

export class AIEngine {
  // تحليل أداء الموظف وإنشاء التوصيات
  static analyzeEmployeePerformance(employee: Employee, tasks: Task[]): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // تحليل معدل إنجاز المهام
    const completedTasks = tasks.filter(t => t.assigneeId === employee.id && t.status === 'completed');
    const completionRate = completedTasks.length / tasks.filter(t => t.assigneeId === employee.id).length;
    
    if (completionRate < 0.7) {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        type: 'training',
        title: 'تحسين إدارة الوقت',
        description: `${employee.name} يحتاج إلى تدريب على إدارة الوقت. معدل الإنجاز الحالي ${Math.round(completionRate * 100)}%`,
        priority: 'high',
        employeeId: employee.id,
        confidence: 0.85,
        actionRequired: true
      });
    }
    
    // تحليل النقاط والأداء المالي
    if (employee.totalEarnings < 5000) {
      recommendations.push({
        id: `rec_${Date.now()}_2`,
        type: 'motivation',
        title: 'برنامج تحفيز مخصص',
        description: 'يحتاج إلى دعم إضافي لتحسين الأداء المالي',
        priority: 'medium',
        employeeId: employee.id,
        confidence: 0.75,
        actionRequired: false
      });
    }
    
    return recommendations;
  }

  // تحليل الحالة النفسية للموظف
  static analyzePsychologicalState(employee: Employee, tasks: Task[]): PsychologicalProfile {
    const recentTasks = tasks.filter(t => 
      t.assigneeId === employee.id && 
      new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    const overdueTasks = recentTasks.filter(t => 
      t.status !== 'completed' && 
      new Date(t.dueDate) < new Date()
    );
    
    // حساب مستوى التوتر بناءً على المهام المتأخرة
    const stressLevel = overdueTasks.length > 3 ? 'high' : 
                      overdueTasks.length > 1 ? 'medium' : 'low';
    
    // حساب مستوى الدافعية بناءً على النقاط الأخيرة
    const motivationLevel = employee.points > 800 ? 'high' : 
                           employee.points > 400 ? 'medium' : 'low';
    
    // حساب مستوى المشاركة بناءً على نشاط المهام
    const engagementLevel = recentTasks.length > 5 ? 'high' : 
                           recentTasks.length > 2 ? 'medium' : 'low';
    
    const burnoutScore = Math.min(100, overdueTasks.length * 15 + (employee.points < 200 ? 30 : 0));
    
    return {
      employeeId: employee.id,
      motivation: motivationLevel,
      stress: stressLevel,
      engagement: engagementLevel,
      burnout: burnoutScore,
      recommendations: this.generatePsychologicalRecommendations(stressLevel, motivationLevel, engagementLevel),
      lastUpdated: new Date()
    };
  }

  // توليد توصيات نفسية
  private static generatePsychologicalRecommendations(
    stress: string, 
    motivation: string, 
    engagement: string
  ): string[] {
    const recommendations: string[] = [];
    
    if (stress === 'high') {
      recommendations.push('خذ استراحة قصيرة كل ساعتين');
      recommendations.push('مارس تمارين التنفس العميق');
      recommendations.push('قسم المهام الكبيرة إلى مهام أصغر');
    }
    
    if (motivation === 'low') {
      recommendations.push('راجع أهدافك الشخصية');
      recommendations.push('احتفل بالإنجازات الصغيرة');
      recommendations.push('تواصل مع المشرف للحصول على الدعم');
    }
    
    if (engagement === 'low') {
      recommendations.push('جرب طرق عمل جديدة');
      recommendations.push('شارك في مشاريع جماعية');
      recommendations.push('احضر جلسات التدريب المتاحة');
    }
    
    return recommendations;
  }

  // التنبؤ بالأداء المستقبلي
  static predictFuturePerformance(employee: Employee, tasks: Task[]): {
    expectedPoints: number;
    expectedEarnings: number;
    riskLevel: 'low' | 'medium' | 'high';
    suggestions: string[];
  } {
    const recentPerformance = this.calculateRecentPerformance(employee, tasks);
    const trend = this.calculateTrend(employee, tasks);
    
    const expectedPoints = Math.max(0, employee.points + (trend.pointsTrend * 30));
    const expectedEarnings = Math.max(0, employee.totalEarnings + (trend.earningsTrend * 30));
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (trend.pointsTrend < -10 || trend.earningsTrend < -100) {
      riskLevel = 'high';
    } else if (trend.pointsTrend < 0 || trend.earningsTrend < 0) {
      riskLevel = 'medium';
    }
    
    const suggestions = this.generatePerformanceSuggestions(riskLevel, trend);
    
    return {
      expectedPoints,
      expectedEarnings,
      riskLevel,
      suggestions
    };
  }

  private static calculateRecentPerformance(employee: Employee, tasks: Task[]) {
    const recentTasks = tasks.filter(t => 
      t.assigneeId === employee.id && 
      new Date(t.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    );
    
    return {
      tasksCompleted: recentTasks.filter(t => t.status === 'completed').length,
      totalTasks: recentTasks.length,
      averageCompletionTime: this.calculateAverageCompletionTime(recentTasks)
    };
  }

  private static calculateTrend(employee: Employee, tasks: Task[]): TrendData {
    // حساب الاتجاه بناءً على البيانات التاريخية
    return {
      pointsTrend: Math.random() * 20 - 10, // محاكاة الاتجاه
      earningsTrend: Math.random() * 200 - 100
    };
  }

  private static calculateAverageCompletionTime(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date().getTime(); // محاكاة تاريخ الإكمال
      return sum + (completed - created);
    }, 0);
    
    return totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // بالأيام
  }

  private static generatePerformanceSuggestions(
    riskLevel: 'low' | 'medium' | 'high',
    trend: TrendData
  ): string[] {
    const suggestions: string[] = [];
    
    if (riskLevel === 'high') {
      suggestions.push('جدولة اجتماع عاجل مع المشرف');
      suggestions.push('مراجعة استراتيجية العمل الحالية');
      suggestions.push('تقليل عدد المهام المعينة مؤقتاً');
    } else if (riskLevel === 'medium') {
      suggestions.push('زيادة التواصل مع الفريق');
      suggestions.push('طلب مساعدة إضافية في المهام الصعبة');
      suggestions.push('مراجعة الأهداف الشهرية');
    } else {
      suggestions.push('الاستمرار في الأداء الممتاز');
      suggestions.push('مشاركة الخبرات مع الزملاء');
      suggestions.push('تحدي نفسك بمهام أكثر تعقيداً');
    }
    
    return suggestions;
  }

  // توليد تحديات أسبوعية مخصصة
  static generateWeeklyChallenges(employee: Employee): Array<{
    id: string;
    title: string;
    description: string;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard';
    deadline: Date;
  }> {
    const challenges = [];
    const basePoints = employee.points;
    
    // تحدي سهل
    challenges.push({
      id: `challenge_${Date.now()}_1`,
      title: 'إكمال 5 مهام يومياً',
      description: 'أكمل 5 مهام على الأقل كل يوم هذا الأسبوع',
      points: 50,
      difficulty: 'easy' as const,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    // تحدي متوسط
    challenges.push({
      id: `challenge_${Date.now()}_2`,
      title: 'تحقيق 300 نقطة إضافية',
      description: 'اكسب 300 نقطة إضافية من خلال المهام عالية الأولوية',
      points: 100,
      difficulty: 'medium' as const,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    // تحدي صعب (للموظفين المتقدمين)
    if (basePoints > 500) {
      challenges.push({
        id: `challenge_${Date.now()}_3`,
        title: 'قائد الفريق الأسبوعي',
        description: 'ساعد 3 زملاء في إكمال مهامهم واحصل على تقييم ممتاز',
        points: 200,
        difficulty: 'hard' as const,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    return challenges;
  }
}