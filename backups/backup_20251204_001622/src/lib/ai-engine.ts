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
  // ==================== تحليل خريطة ذكاء الموظف ====================
  static generateEmployeeIntelligenceMap(employee: Employee, tasks: Task[]): EmployeeIntelligenceMap {
    const recentTasks = this.getRecentTasks(employee.id, tasks, 30);
    const completedTasks = recentTasks.filter(t => t.status === 'completed');
    
    // حساب المهارات
    const skills = {
      learningSpeed: this.calculateLearningSpeed(employee, recentTasks),
      taskCompletion: (completedTasks.length / Math.max(recentTasks.length, 1)) * 100,
      adaptability: this.calculateAdaptability(employee, tasks),
      instructionComprehension: Math.min(100, 85 + Math.random() * 15),
      decisionQuality: this.calculateDecisionQuality(employee, tasks),
      dataAnalysis: Math.min(100, 70 + Math.random() * 30),
      responseToChange: this.calculateResponseToChange(employee, tasks),
      stressHandling: 100 - this.analyzePsychologicalState(employee, tasks).burnout,
      communicationSkills: Math.min(100, 75 + Math.random() * 25),
      dataEntryAccuracy: this.calculateDataEntryAccuracy(employee),
      problemSolving: this.calculateProblemSolving(employee, tasks),
      attentionToDetail: Math.min(100, 80 + Math.random() * 20)
    };

    // تحديد نقاط القوة والضعف
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    Object.entries(skills).forEach(([skill, value]) => {
      if (value >= 80) strengths.push(this.translateSkill(skill));
      if (value < 60) weaknesses.push(this.translateSkill(skill));
    });

    return {
      employeeId: employee.id,
      skills,
      strengths,
      weaknesses,
      developmentSuggestions: this.generateDevelopmentSuggestions(skills),
      suitableTasks: this.determineSuitableTasks(skills),
      growthPrediction: {
        threeMonths: Math.min(100, Object.values(skills).reduce((a, b) => a + b, 0) / 12 + 10),
        sixMonths: Math.min(100, Object.values(skills).reduce((a, b) => a + b, 0) / 12 + 20)
      },
      lastUpdated: new Date()
    };
  }

  // ==================== تحليل مخاطر الاستقالة ====================
  static analyzeTurnoverRisk(employee: Employee, tasks: Task[]): TurnoverRisk {
    const recentTasks = this.getRecentTasks(employee.id, tasks, 30);
    const olderTasks = this.getRecentTasks(employee.id, tasks, 60).slice(30);
    
    const factors = {
      passionDecline: this.calculatePassionDecline(recentTasks, olderTasks),
      errorIncrease: this.calculateErrorIncrease(employee),
      usageDecrease: this.calculateUsageDecrease(employee),
      lackOfCommunication: Math.random() * 40,
      burnoutLevel: this.analyzePsychologicalState(employee, tasks).burnout,
      taskIncompletion: ((recentTasks.length - recentTasks.filter(t => t.status === 'completed').length) / Math.max(recentTasks.length, 1)) * 100,
      stressIndicators: this.analyzePsychologicalState(employee, tasks).stress === 'high' ? 80 : 
                       this.analyzePsychologicalState(employee, tasks).stress === 'medium' ? 50 : 20,
      behaviorChange: Math.random() * 60,
      loginPatternChange: Math.random() * 50,
      lackOfInitiative: 100 - this.analyzePsychologicalState(employee, tasks).burnout,
      distraction: Math.random() * 70,
      productivityDecline: this.calculateProductivityDecline(employee, recentTasks, olderTasks)
    };

    const riskScore = Object.values(factors).reduce((a, b) => a + b, 0) / 12;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let urgency: 'immediate' | 'urgent' | 'monitor' | 'stable' = 'stable';
    
    if (riskScore >= 80) {
      riskLevel = 'critical';
      urgency = 'immediate';
    } else if (riskScore >= 60) {
      riskLevel = 'high';
      urgency = 'urgent';
    } else if (riskScore >= 40) {
      riskLevel = 'medium';
      urgency = 'monitor';
    }

    return {
      employeeId: employee.id,
      riskScore: Math.round(riskScore),
      riskLevel,
      factors,
      reasons: this.identifyTurnoverReasons(factors),
      recommendations: this.generateTurnoverRecommendations(riskLevel, factors),
      urgency,
      lastUpdated: new Date()
    };
  }

  // ==================== خطة التطوير الفردية ====================
  static generateIndividualDevelopmentPlan(employee: Employee, tasks: Task[]): IndividualDevelopmentPlan {
    const intelligenceMap = this.generateEmployeeIntelligenceMap(employee, tasks);
    
    return {
      employeeId: employee.id,
      strengths: intelligenceMap.strengths,
      weaknesses: intelligenceMap.weaknesses,
      goals: {
        thirtyDays: this.generate30DayGoals(employee, intelligenceMap),
        ninetyDays: this.generate90DayGoals(employee, intelligenceMap),
        sixMonths: this.generate6MonthGoals(employee, intelligenceMap)
      },
      training: {
        courses: this.recommendCourses(intelligenceMap.weaknesses),
        videos: this.recommendVideos(intelligenceMap.weaknesses),
        practicalTasks: this.recommendPracticalTasks(intelligenceMap),
        mentoringSessions: this.recommendMentoringSessions(intelligenceMap)
      },
      performanceImprovement: {
        taskTypes: this.recommendTaskTypes(intelligenceMap.skills),
        taskVolume: this.recommendTaskVolume(employee, tasks),
        restPeriods: this.recommendRestPeriods(employee, tasks),
        stressDistribution: this.recommendStressDistribution(employee),
        workPatternChanges: this.recommendWorkPatternChanges(employee, tasks)
      },
      readinessLevel: Math.round(Object.values(intelligenceMap.skills).reduce((a, b) => a + b, 0) / 12),
      lastUpdated: new Date()
    };
  }

  // ==================== تحليل سلوك التصفح ====================
  static analyzeNavigationBehavior(employee: Employee): NavigationBehavior {
    // محاكاة بيانات التصفح (في الواقع ستأتي من tracking system)
    const pages = ['المهام', 'المشاريع', 'التقارير', 'الإعدادات', 'الحساب', 'المستفيدين'];
    
    return {
      employeeId: employee.id,
      metrics: {
        totalNavigations: Math.floor(Math.random() * 200) + 50,
        averageTimePerPage: Object.fromEntries(pages.map(p => [p, Math.random() * 300 + 60])),
        frequentlyVisitedPages: pages.slice(0, 3).map(p => ({ page: p, visits: Math.floor(Math.random() * 50) + 10 })),
        confusionPoints: [
          { page: 'المعاملات', indicators: ['عودة متكررة بدون إدخال', 'وقت طويل بدون تفاعل'] }
        ],
        errorPronePages: [
          { page: 'إدخال البيانات', errorCount: Math.floor(Math.random() * 10) }
        ],
        avoidedPages: ['التقارير المتقدمة', 'التحليلات']
      },
      uxIssues: [
        {
          page: 'المعاملات',
          issue: 'خطوات غير واضحة',
          severity: 'high',
          suggestion: 'إضافة wizard مبسط'
        }
      ],
      lastUpdated: new Date()
    };
  }

  // ==================== جودة إدخال البيانات ====================
  static analyzeDataEntryQuality(employee: Employee, allEmployees: Employee[]): DataEntryQuality {
    const accuracy = this.calculateDataEntryAccuracy(employee);
    
    return {
      employeeId: employee.id,
      metrics: {
        averageEntryTime: Math.random() * 120 + 30, // seconds
        entrySpeed: Math.random() * 50 + 30, // chars per minute
        errorsDuringEntry: Math.floor(Math.random() * 10),
        fieldsModified: Math.floor(Math.random() * 5),
        difficultFields: ['رقم الهوية', 'تاريخ الميلاد'],
        ignoredFields: ['الملاحظات', 'العنوان الثانوي'],
        accuracy
      },
      comparison: {
        rankAmongPeers: Math.floor(Math.random() * allEmployees.length) + 1,
        averageTeamAccuracy: 85
      },
      recommendations: this.generateDataEntryRecommendations(accuracy),
      trainingNeeds: accuracy < 80 ? ['دورة إدخال البيانات الدقيق', 'استخدام اختصارات لوحة المفاتيح'] : [],
      lastUpdated: new Date()
    };
  }

  // ==================== مراقبة استخدام النظام ====================
  static monitorSystemUsage(employee: Employee): SystemUsageMonitor {
    return {
      employeeId: employee.id,
      sessions: {
        loginTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        logoutTime: new Date(),
        duration: 8 * 60, // minutes
        longestSession: 240,
        averageSession: 180
      },
      pageUsage: {
        mostUsed: [
          { page: 'المهام', time: 120 },
          { page: 'المشاريع', time: 90 },
          { page: 'التقارير', time: 60 }
        ],
        leastUsed: ['الإعدادات المتقدمة', 'سجل النشاط'],
        timeConsumingPages: [
          { page: 'المعاملات', avgTime: 15 },
          { page: 'التقارير المخصصة', avgTime: 20 }
        ],
        frictionPages: [
          { page: 'إدخال المستفيد', reason: 'حقول كثيرة ومعقدة' }
        ]
      },
      productivity: {
        peakHours: ['09:00-11:00', '14:00-16:00'],
        lowActivityPeriods: ['12:00-13:00', '16:00-17:00'],
        overallProductivity: Math.random() * 30 + 70
      },
      lastUpdated: new Date()
    };
  }

  // ==================== توليد التنبيهات الفورية ====================
  static generateRealTimeAlerts(employees: Employee[], tasks: Task[]): RealTimeAlert[] {
    const alerts: RealTimeAlert[] = [];
    
    for (const employee of employees) {
      const turnoverRisk = this.analyzeTurnoverRisk(employee, tasks);
      const psychProfile = this.analyzePsychologicalState(employee, tasks);
      const dataQuality = this.analyzeDataEntryQuality(employee, employees);
      
      // تنبيه الاحتراق الوظيفي
      if (psychProfile.burnout > 70) {
        alerts.push({
          id: `alert_${Date.now()}_burnout_${employee.id}`,
          type: 'burnout',
          severity: 'critical',
          employeeId: employee.id,
          employeeName: employee.name,
          title: 'مؤشر احتراق وظيفي مرتفع',
          message: `${employee.name} يعاني من احتراق وظيفي بنسبة ${psychProfile.burnout}%`,
          timestamp: new Date(),
          actionRequired: true,
          suggestedActions: ['خفض الحمل فوراً', 'إعطاء يوم راحة', 'جلسة دعم نفسي']
        });
      }
      
      // تنبيه مخاطر الاستقالة
      if (turnoverRisk.riskLevel === 'critical' || turnoverRisk.riskLevel === 'high') {
        alerts.push({
          id: `alert_${Date.now()}_turnover_${employee.id}`,
          type: 'turnover',
          severity: turnoverRisk.riskLevel === 'critical' ? 'critical' : 'high',
          employeeId: employee.id,
          employeeName: employee.name,
          title: 'خطر استقالة عالي',
          message: `مؤشر مخاطر الاستقالة ${turnoverRisk.riskScore}%`,
          timestamp: new Date(),
          actionRequired: true,
          suggestedActions: turnoverRisk.recommendations.slice(0, 3)
        });
      }
      
      // تنبيه جودة الإدخال
      if (dataQuality.metrics.accuracy < 70) {
        alerts.push({
          id: `alert_${Date.now()}_quality_${employee.id}`,
          type: 'quality',
          severity: 'medium',
          employeeId: employee.id,
          employeeName: employee.name,
          title: 'انخفاض جودة الإدخال',
          message: `دقة إدخال البيانات انخفضت إلى ${dataQuality.metrics.accuracy.toFixed(1)}%`,
          timestamp: new Date(),
          actionRequired: true,
          suggestedActions: ['مراجعة التدريب', 'تبسيط النماذج', 'جلسة توجيه']
        });
      }
      
      // تنبيه انخفاض الأداء
      const recentTasks = this.getRecentTasks(employee.id, tasks, 7);
      const completionRate = recentTasks.filter(t => t.status === 'completed').length / Math.max(recentTasks.length, 1);
      
      if (completionRate < 0.5 && recentTasks.length > 3) {
        alerts.push({
          id: `alert_${Date.now()}_performance_${employee.id}`,
          type: 'performance',
          severity: 'high',
          employeeId: employee.id,
          employeeName: employee.name,
          title: 'انخفاض أداء مفاجئ',
          message: `${employee.name} أكمل ${Math.round(completionRate * 100)}% فقط من المهام هذا الأسبوع`,
          timestamp: new Date(),
          actionRequired: true,
          suggestedActions: ['اجتماع فوري', 'مراجعة المهام', 'توفير دعم إضافي']
        });
      }
    }
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  // ==================== دوال مساعدة ====================
  
  private static getRecentTasks(employeeId: string, tasks: Task[], days: number): Task[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return tasks.filter(t => 
      t.assigneeId === employeeId && 
      new Date(t.createdAt) > cutoffDate
    );
  }

  private static calculateLearningSpeed(employee: Employee, tasks: Task[]): number {
    // محاكاة سرعة التعلم بناءً على تحسن الأداء مع الوقت
    return Math.min(100, 70 + Math.random() * 30);
  }

  private static calculateAdaptability(employee: Employee, tasks: Task[]): number {
    // قياس قدرة التأقلم مع أنواع مختلفة من المهام
    const taskTypes = new Set(tasks.filter(t => t.assigneeId === employee.id).map(t => t.priority));
    return Math.min(100, taskTypes.size * 25 + 50);
  }

  private static calculateDecisionQuality(employee: Employee, tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.assigneeId === employee.id && t.status === 'completed');
    return Math.min(100, (completedTasks.length / Math.max(tasks.filter(t => t.assigneeId === employee.id).length, 1)) * 100);
  }

  private static calculateResponseToChange(employee: Employee, tasks: Task[]): number {
    return Math.min(100, 75 + Math.random() * 25);
  }

  private static calculateDataEntryAccuracy(employee: Employee): number {
    return Math.min(100, 80 + Math.random() * 20);
  }

  private static calculateProblemSolving(employee: Employee, tasks: Task[]): number {
    const highPriorityCompleted = tasks.filter(t => 
      t.assigneeId === employee.id && 
      t.priority === 'high' && 
      t.status === 'completed'
    ).length;
    return Math.min(100, highPriorityCompleted * 15 + 40);
  }

  private static translateSkill(skill: string): string {
    const translations: Record<string, string> = {
      learningSpeed: 'سرعة التعلم',
      taskCompletion: 'إنجاز المهام',
      adaptability: 'التأقلم',
      instructionComprehension: 'فهم التعليمات',
      decisionQuality: 'جودة القرارات',
      dataAnalysis: 'تحليل البيانات',
      responseToChange: 'الاستجابة للتغيير',
      stressHandling: 'إدارة الضغوط',
      communicationSkills: 'مهارات التواصل',
      dataEntryAccuracy: 'دقة الإدخال',
      problemSolving: 'حل المشكلات',
      attentionToDetail: 'الانتباه للتفاصيل'
    };
    return translations[skill] || skill;
  }

  private static generateDevelopmentSuggestions(skills: any): string[] {
    const suggestions: string[] = [];
    
    if (skills.dataAnalysis < 70) suggestions.push('دورة تحليل البيانات المتقدمة');
    if (skills.communicationSkills < 70) suggestions.push('ورشة مهارات التواصل الفعال');
    if (skills.problemSolving < 70) suggestions.push('تدريب على التفكير النقدي وحل المشكلات');
    if (skills.learningSpeed < 70) suggestions.push('استراتيجيات التعلم السريع');
    
    return suggestions;
  }

  private static determineSuitableTasks(skills: any): string[] {
    const tasks: string[] = [];
    
    if (skills.dataAnalysis > 80) tasks.push('تحليل التقارير المالية');
    if (skills.communicationSkills > 80) tasks.push('التنسيق مع الفرق');
    if (skills.problemSolving > 80) tasks.push('حل المشكلات التقنية');
    if (skills.attentionToDetail > 80) tasks.push('مراجعة البيانات ودقتها');
    
    return tasks.length > 0 ? tasks : ['المهام العامة'];
  }

  private static calculatePassionDecline(recentTasks: Task[], olderTasks: Task[]): number {
    const recentCompletion = recentTasks.filter(t => t.status === 'completed').length / Math.max(recentTasks.length, 1);
    const olderCompletion = olderTasks.filter(t => t.status === 'completed').length / Math.max(olderTasks.length, 1);
    return Math.max(0, (olderCompletion - recentCompletion) * 100);
  }

  private static calculateErrorIncrease(employee: Employee): number {
    return Math.random() * 50;
  }

  private static calculateUsageDecrease(employee: Employee): number {
    return Math.random() * 40;
  }

  private static calculateProductivityDecline(employee: Employee, recentTasks: Task[], olderTasks: Task[]): number {
    const recentProductivity = recentTasks.filter(t => t.status === 'completed').length;
    const olderProductivity = olderTasks.filter(t => t.status === 'completed').length;
    return Math.max(0, (olderProductivity - recentProductivity) / Math.max(olderProductivity, 1) * 100);
  }

  private static identifyTurnoverReasons(factors: any): string[] {
    const reasons: string[] = [];
    
    if (factors.burnoutLevel > 60) reasons.push('مستوى احتراق وظيفي مرتفع');
    if (factors.passionDecline > 40) reasons.push('انخفاض الشغف والدافعية');
    if (factors.stressIndicators > 60) reasons.push('مستويات ضغط عالية');
    if (factors.taskIncompletion > 50) reasons.push('صعوبة في إنجاز المهام');
    if (factors.usageDecrease > 30) reasons.push('انخفاض استخدام النظام');
    
    return reasons;
  }

  private static generateTurnoverRecommendations(riskLevel: string, factors: any): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'critical') {
      recommendations.push('اجتماع فوري مع الموظف والإدارة العليا');
      recommendations.push('مراجعة شاملة للراتب والمزايا');
      recommendations.push('خطة طوارئ للاحتفاظ بالموظف');
    }
    
    if (factors.burnoutLevel > 60) {
      recommendations.push('خفض الحمل الوظيفي بنسبة 30%');
      recommendations.push('إجازة إجبارية لمدة 3-5 أيام');
    }
    
    if (factors.stressIndicators > 60) {
      recommendations.push('جلسات دعم نفسي');
      recommendations.push('تحسين بيئة العمل');
    }
    
    recommendations.push('مراجعة أهداف العمل وتوقعات الأداء');
    recommendations.push('برنامج تطوير مهني مخصص');
    
    return recommendations;
  }

  private static generate30DayGoals(employee: Employee, map: EmployeeIntelligenceMap): Goal[] {
    const goals: Goal[] = [];
    
    map.weaknesses.slice(0, 2).forEach((weakness, index) => {
      goals.push({
        id: `goal_30_${index}`,
        title: `تحسين ${weakness}`,
        description: `رفع مستوى ${weakness} بنسبة 15%`,
        targetValue: 15,
        currentValue: 0,
        priority: 'high'
      });
    });
    
    return goals;
  }

  private static generate90DayGoals(employee: Employee, map: EmployeeIntelligenceMap): Goal[] {
    return [
      {
        id: 'goal_90_1',
        title: 'إتقان مهارة جديدة',
        description: 'تعلم وإتقان مهارة تقنية جديدة',
        targetValue: 100,
        currentValue: 0,
        priority: 'medium'
      },
      {
        id: 'goal_90_2',
        title: 'تحسين الإنتاجية',
        description: 'زيادة معدل إنجاز المهام بنسبة 25%',
        targetValue: 25,
        currentValue: 0,
        priority: 'high'
      }
    ];
  }

  private static generate6MonthGoals(employee: Employee, map: EmployeeIntelligenceMap): Goal[] {
    return [
      {
        id: 'goal_180_1',
        title: 'قيادة مشروع كامل',
        description: 'قيادة وإنجاز مشروع من البداية للنهاية',
        targetValue: 1,
        currentValue: 0,
        priority: 'high'
      },
      {
        id: 'goal_180_2',
        title: 'توجيه موظف جديد',
        description: 'تدريب وتوجيه موظف جديد في الفريق',
        targetValue: 1,
        currentValue: 0,
        priority: 'medium'
      }
    ];
  }

  private static recommendCourses(weaknesses: string[]): string[] {
    const courses: string[] = [];
    
    if (weaknesses.includes('سرعة التعلم')) courses.push('دورة استراتيجيات التعلم السريع');
    if (weaknesses.includes('دقة الإدخال')) courses.push('دورة إدخال البيانات الاحترافية');
    if (weaknesses.includes('حل المشكلات')) courses.push('دورة التفكير النقدي');
    
    courses.push('دورة إدارة الوقت الفعّال');
    courses.push('دورة مهارات التواصل المتقدمة');
    
    return courses;
  }

  private static recommendVideos(weaknesses: string[]): string[] {
    return [
      'فيديو: كيف تتعلم بسرعة',
      'فيديو: تحسين التركيز والانتباه',
      'فيديو: إدارة الضغوط في العمل'
    ];
  }

  private static recommendPracticalTasks(map: EmployeeIntelligenceMap): string[] {
    return [
      'مهمة تطبيقية: تحليل بيانات حقيقية',
      'مهمة تطبيقية: حل مشكلة واقعية في الفريق',
      'مهمة تطبيقية: قيادة اجتماع فريق'
    ];
  }

  private static recommendMentoringSessions(map: EmployeeIntelligenceMap): string[] {
    return [
      'جلسة أسبوعية مع المشرف المباشر',
      'جلسة شهرية مع قائد الفريق',
      'جلسة ربع سنوية مع الإدارة العليا'
    ];
  }

  private static recommendTaskTypes(skills: any): string[] {
    const types: string[] = [];
    
    if (skills.dataAnalysis > 75) types.push('تحليل البيانات');
    if (skills.problemSolving > 75) types.push('حل المشكلات المعقدة');
    if (skills.communicationSkills > 75) types.push('التنسيق والتواصل');
    
    return types.length > 0 ? types : ['مهام عامة متنوعة'];
  }

  private static recommendTaskVolume(employee: Employee, tasks: Task[]): string {
    const recentTasks = this.getRecentTasks(employee.id, tasks, 7);
    const avgPerWeek = recentTasks.length;
    
    if (avgPerWeek > 15) return 'تقليل الحمل: 10-12 مهمة أسبوعياً';
    if (avgPerWeek < 5) return 'زيادة الحمل تدريجياً: 8-10 مهام أسبوعياً';
    return 'الحمل الحالي مناسب: 8-12 مهمة أسبوعياً';
  }

  private static recommendRestPeriods(employee: Employee, tasks: Task[]): string {
    const psychProfile = this.analyzePsychologicalState(employee, tasks);
    
    if (psychProfile.burnout > 60) return 'استراحة 15 دقيقة كل ساعة';
    if (psychProfile.burnout > 30) return 'استراحة 10 دقائق كل ساعتين';
    return 'استراحة 10 دقائق كل 3 ساعات';
  }

  private static recommendStressDistribution(employee: Employee): string {
    return 'توزيع المهام الصعبة على أيام مختلفة، تجنب تكديس المهام في يوم واحد';
  }

  private static recommendWorkPatternChanges(employee: Employee, tasks: Task[]): string[] {
    return [
      'العمل على مهمة واحدة في كل مرة (تجنب Multitasking)',
      'تخصيص ساعات الصباح للمهام المعقدة',
      'جدولة المهام الروتينية في فترة ما بعد الظهر'
    ];
  }

  private static generateDataEntryRecommendations(accuracy: number): string[] {
    const recommendations: string[] = [];
    
    if (accuracy < 70) {
      recommendations.push('مراجعة فورية للبيانات المدخلة');
      recommendations.push('دورة تدريبية عاجلة على إدخال البيانات');
      recommendations.push('استخدام نماذج مبسطة');
    } else if (accuracy < 85) {
      recommendations.push('تحسين سرعة الإدخال مع الحفاظ على الدقة');
      recommendations.push('استخدام اختصارات لوحة المفاتيح');
    } else {
      recommendations.push('أداء ممتاز، شارك خبرتك مع الزملاء');
    }
    
    return recommendations;
  }

  // ==================== الدوال الأصلية المحسّنة ====================
  
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