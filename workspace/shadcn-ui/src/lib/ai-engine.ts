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

interface TrendData {
  pointsTrend: number;
  earningsTrend: number;
}

// Employee Intelligence Map Interface
export interface EmployeeIntelligenceMap {
  employeeId: string;
  employeeName: string;
  skillMatrix: SkillScore[];
  performanceScore: number;
  collaborationScore: number;
  innovationScore: number;
  leadershipPotential: number;
  learningAgility: number;
  adaptabilityScore: number;
  overallRating: number;
}

export interface SkillScore {
  skillName: string;
  currentLevel: number; // 0-100
  targetLevel: number;
  growthRate: number; // percentage
  category: 'technical' | 'soft' | 'leadership' | 'domain';
}

// Turnover Risk Score Interface
export interface TurnoverRiskAssessment {
  employeeId: string;
  employeeName: string;
  riskScore: number; // 0-100 (higher = more likely to leave)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: TurnoverFactor[];
  retentionStrategies: string[];
  predictedTimeToLeave?: number; // days
  lastAssessmentDate: Date;
}

export interface TurnoverFactor {
  name: string;
  impact: number; // 0-100
  category: 'engagement' | 'compensation' | 'growth' | 'workload' | 'culture' | 'management';
  description: string;
}

// Intelligent Task Assignment Interface
export interface IntelligentTaskAssignment {
  taskId: string;
  taskTitle: string;
  recommendedEmployees: EmployeeMatch[];
  assignmentReason: string;
  predictedCompletionTime: number; // hours
  predictedSuccessRate: number; // percentage
  urgencyScore: number; // 0-100
}

export interface EmployeeMatch {
  employeeId: string;
  employeeName: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  currentWorkload: number; // percentage
  skillAlignment: number;
  availability: boolean;
}

// System Usage Tracking Interface
export interface SystemUsageMetrics {
  employeeId: string;
  employeeName: string;
  activeHoursPerDay: number;
  featuresUsed: FeatureUsage[];
  loginFrequency: number; // times per day
  productiveTime: number; // hours
  idleTime: number; // hours
  lastActive: Date;
  weeklyTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface FeatureUsage {
  featureName: string;
  usageCount: number;
  timeSpent: number; // minutes
  efficiency: number; // percentage
}

// Burnout Monitoring Interface
export interface BurnoutIndicator {
  employeeId: string;
  employeeName: string;
  burnoutScore: number; // 0-100
  burnoutLevel: 'healthy' | 'mild' | 'moderate' | 'severe';
  indicators: BurnoutFactor[];
  recommendations: string[];
  workloadBalance: number; // -100 to 100 (negative = overworked)
  recoveryActions: string[];
  lastCheckDate: Date;
}

export interface BurnoutFactor {
  name: string;
  severity: number; // 0-100
  trend: 'improving' | 'stable' | 'worsening';
  description: string;
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

  // ============ AI Center Features ============

  // Employee Intelligence Map - خريطة ذكاء الموظفين
  static generateEmployeeIntelligenceMap(employee: Employee, tasks: Task[]): EmployeeIntelligenceMap {
    const completedTasks = tasks.filter(t => t.assignedTo?.includes(employee.id) && t.status === 'completed');
    const totalTasks = tasks.filter(t => t.assignedTo?.includes(employee.id));
    const completionRate = totalTasks.length > 0 ? completedTasks.length / totalTasks.length : 0;

    // Calculate skill matrix based on task categories and performance
    const skillMatrix: SkillScore[] = [
      {
        skillName: 'إدارة الوقت',
        currentLevel: Math.min(100, completionRate * 100 + Math.random() * 20),
        targetLevel: 90,
        growthRate: Math.random() * 15 + 5,
        category: 'soft'
      },
      {
        skillName: 'التخطيط الاستراتيجي',
        currentLevel: Math.min(100, employee.points / 10 + Math.random() * 20),
        targetLevel: 85,
        growthRate: Math.random() * 12 + 3,
        category: 'leadership'
      },
      {
        skillName: 'التواصل الفعال',
        currentLevel: Math.min(100, 60 + Math.random() * 30),
        targetLevel: 95,
        growthRate: Math.random() * 10 + 5,
        category: 'soft'
      },
      {
        skillName: 'حل المشكلات',
        currentLevel: Math.min(100, completionRate * 80 + Math.random() * 25),
        targetLevel: 90,
        growthRate: Math.random() * 18 + 2,
        category: 'technical'
      },
      {
        skillName: 'العمل الجماعي',
        currentLevel: Math.min(100, 55 + Math.random() * 35),
        targetLevel: 85,
        growthRate: Math.random() * 8 + 4,
        category: 'soft'
      },
      {
        skillName: 'الإبداع والابتكار',
        currentLevel: Math.min(100, 45 + Math.random() * 40),
        targetLevel: 80,
        growthRate: Math.random() * 20 + 5,
        category: 'technical'
      }
    ];

    const performanceScore = Math.min(100, completionRate * 100);
    const collaborationScore = Math.min(100, 50 + Math.random() * 40);
    const innovationScore = Math.min(100, 40 + Math.random() * 50);
    const leadershipPotential = Math.min(100, employee.points / 15 + Math.random() * 30);
    const learningAgility = Math.min(100, 60 + Math.random() * 35);
    const adaptabilityScore = Math.min(100, 55 + Math.random() * 40);

    const overallRating = (
      performanceScore * 0.25 +
      collaborationScore * 0.15 +
      innovationScore * 0.15 +
      leadershipPotential * 0.15 +
      learningAgility * 0.15 +
      adaptabilityScore * 0.15
    );

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      skillMatrix,
      performanceScore,
      collaborationScore,
      innovationScore,
      leadershipPotential,
      learningAgility,
      adaptabilityScore,
      overallRating: Math.round(overallRating)
    };
  }

  // Turnover Risk Assessment - تقييم مخاطر دوران الموظفين
  static assessTurnoverRisk(employee: Employee, tasks: Task[]): TurnoverRiskAssessment {
    const psychProfile = this.analyzePsychologicalState(employee, tasks);
    const completedTasks = tasks.filter(t => t.assignedTo?.includes(employee.id) && t.status === 'completed');
    const totalTasks = tasks.filter(t => t.assignedTo?.includes(employee.id));
    
    const factors: TurnoverFactor[] = [];
    let totalRisk = 0;

    // Engagement Factor
    const engagementImpact = psychProfile.engagement === 'low' ? 30 : psychProfile.engagement === 'medium' ? 15 : 5;
    factors.push({
      name: 'مستوى المشاركة',
      impact: engagementImpact,
      category: 'engagement',
      description: psychProfile.engagement === 'low' 
        ? 'مستوى مشاركة منخفض - يحتاج اهتمام فوري'
        : psychProfile.engagement === 'medium'
        ? 'مستوى مشاركة متوسط - يمكن تحسينه'
        : 'مستوى مشاركة ممتاز'
    });
    totalRisk += engagementImpact;

    // Workload Factor
    const workloadImpact = psychProfile.stress === 'high' ? 25 : psychProfile.stress === 'medium' ? 12 : 3;
    factors.push({
      name: 'ضغط العمل',
      impact: workloadImpact,
      category: 'workload',
      description: psychProfile.stress === 'high'
        ? 'ضغط عمل مرتفع جداً - خطر الإرهاق'
        : psychProfile.stress === 'medium'
        ? 'ضغط عمل معتدل'
        : 'توازن جيد في العمل'
    });
    totalRisk += workloadImpact;

    // Growth Factor
    const growthImpact = employee.points < 300 ? 20 : employee.points < 600 ? 10 : 2;
    factors.push({
      name: 'فرص النمو',
      impact: growthImpact,
      category: 'growth',
      description: employee.points < 300
        ? 'فرص نمو محدودة - يحتاج مسار وظيفي واضح'
        : employee.points < 600
        ? 'فرص نمو متوسطة'
        : 'مسار وظيفي واضح وفرص ممتازة'
    });
    totalRisk += growthImpact;

    // Burnout Factor
    const burnoutImpact = psychProfile.burnout > 60 ? 25 : psychProfile.burnout > 30 ? 12 : 3;
    factors.push({
      name: 'الإرهاق الوظيفي',
      impact: burnoutImpact,
      category: 'workload',
      description: psychProfile.burnout > 60
        ? 'مستوى إرهاق خطير - تدخل عاجل مطلوب'
        : psychProfile.burnout > 30
        ? 'علامات إرهاق ناشئة'
        : 'مستوى طاقة صحي'
    });
    totalRisk += burnoutImpact;

    const riskScore = Math.min(100, totalRisk);
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    const retentionStrategies = this.generateRetentionStrategies(riskLevel, factors);

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      riskScore,
      riskLevel,
      factors,
      retentionStrategies,
      predictedTimeToLeave: riskLevel === 'critical' ? 30 : riskLevel === 'high' ? 90 : riskLevel === 'medium' ? 180 : undefined,
      lastAssessmentDate: new Date()
    };
  }

  private static generateRetentionStrategies(riskLevel: string, factors: TurnoverFactor[]): string[] {
    const strategies: string[] = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      strategies.push('عقد اجتماع فوري مع الموظف لمناقشة مخاوفه');
      strategies.push('مراجعة الحوافز والمكافآت المادية');
      strategies.push('تقديم فرص تطوير مهني مخصصة');
    }

    factors.forEach(factor => {
      if (factor.impact > 15) {
        switch (factor.category) {
          case 'engagement':
            strategies.push('تنظيم أنشطة بناء الفريق');
            strategies.push('إشراكه في مشاريع مهمة ومحفزة');
            break;
          case 'workload':
            strategies.push('إعادة توزيع المهام لتخفيف الضغط');
            strategies.push('توفير دعم إضافي من الفريق');
            break;
          case 'growth':
            strategies.push('وضع خطة تطوير وظيفي واضحة');
            strategies.push('توفير برامج تدريب وشهادات');
            break;
        }
      }
    });

    return [...new Set(strategies)]; // Remove duplicates
  }

  // Intelligent Task Assignment - التوزيع الذكي للمهام
  static generateIntelligentTaskAssignment(task: Task, employees: Employee[], allTasks: Task[]): IntelligentTaskAssignment {
    const recommendedEmployees: EmployeeMatch[] = employees.map(employee => {
      const employeeTasks = allTasks.filter(t => t.assignedTo?.includes(employee.id));
      const pendingTasks = employeeTasks.filter(t => t.status !== 'completed');
      const completedTasks = employeeTasks.filter(t => t.status === 'completed');
      
      const workload = Math.min(100, pendingTasks.length * 15);
      const completionRate = employeeTasks.length > 0 ? completedTasks.length / employeeTasks.length : 0.5;
      const skillAlignment = Math.min(100, 40 + Math.random() * 50 + employee.points / 20);
      
      const matchScore = (
        (100 - workload) * 0.3 +
        completionRate * 100 * 0.35 +
        skillAlignment * 0.35
      );

      const matchReasons: string[] = [];
      if (workload < 50) matchReasons.push('عبء عمل خفيف حالياً');
      if (completionRate > 0.7) matchReasons.push('معدل إنجاز ممتاز');
      if (skillAlignment > 70) matchReasons.push('مهارات متوافقة مع المهمة');
      if (employee.points > 500) matchReasons.push('خبرة عالية');

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        matchScore: Math.round(matchScore),
        matchReasons,
        currentWorkload: workload,
        skillAlignment: Math.round(skillAlignment),
        availability: workload < 70
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const topEmployee = recommendedEmployees[0];
    const urgencyScore = task.priority ? task.priority * 20 : 50;

    return {
      taskId: task.id,
      taskTitle: task.title,
      recommendedEmployees: recommendedEmployees.slice(0, 5),
      assignmentReason: topEmployee 
        ? `${topEmployee.employeeName} هو الأنسب بناءً على ${topEmployee.matchReasons.join(' و ')}`
        : 'لا يوجد موظف متاح حالياً',
      predictedCompletionTime: Math.round(8 + Math.random() * 40),
      predictedSuccessRate: topEmployee ? Math.round(60 + topEmployee.matchScore * 0.35) : 50,
      urgencyScore
    };
  }

  // System Usage Tracking - تتبع استخدام النظام
  static analyzeSystemUsage(employee: Employee, _tasks: Task[]): SystemUsageMetrics {
    const baseActivity = employee.points / 100;
    
    const featuresUsed: FeatureUsage[] = [
      {
        featureName: 'إدارة المهام',
        usageCount: Math.round(15 + Math.random() * 30),
        timeSpent: Math.round(60 + Math.random() * 120),
        efficiency: Math.round(65 + Math.random() * 30)
      },
      {
        featureName: 'لوحة التحكم',
        usageCount: Math.round(20 + Math.random() * 25),
        timeSpent: Math.round(30 + Math.random() * 60),
        efficiency: Math.round(70 + Math.random() * 25)
      },
      {
        featureName: 'التقارير والتحليلات',
        usageCount: Math.round(5 + Math.random() * 15),
        timeSpent: Math.round(20 + Math.random() * 40),
        efficiency: Math.round(60 + Math.random() * 35)
      },
      {
        featureName: 'إدارة المشاريع',
        usageCount: Math.round(8 + Math.random() * 20),
        timeSpent: Math.round(45 + Math.random() * 90),
        efficiency: Math.round(55 + Math.random() * 40)
      },
      {
        featureName: 'التواصل والإشعارات',
        usageCount: Math.round(25 + Math.random() * 40),
        timeSpent: Math.round(15 + Math.random() * 30),
        efficiency: Math.round(75 + Math.random() * 20)
      }
    ];

    const activeHoursPerDay = Math.min(10, 4 + baseActivity + Math.random() * 4);
    const productiveTime = activeHoursPerDay * 0.7;
    const idleTime = activeHoursPerDay * 0.3;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      activeHoursPerDay: Math.round(activeHoursPerDay * 10) / 10,
      featuresUsed,
      loginFrequency: Math.round(2 + Math.random() * 4),
      productiveTime: Math.round(productiveTime * 10) / 10,
      idleTime: Math.round(idleTime * 10) / 10,
      lastActive: new Date(),
      weeklyTrend: Math.random() > 0.6 ? 'increasing' : Math.random() > 0.4 ? 'stable' : 'decreasing'
    };
  }

  // Burnout Monitoring - مراقبة الإرهاق
  static analyzeBurnoutIndicators(employee: Employee, tasks: Task[]): BurnoutIndicator {
    const psychProfile = this.analyzePsychologicalState(employee, tasks);
    const employeeTasks = tasks.filter(t => t.assignedTo?.includes(employee.id));
    const pendingTasks = employeeTasks.filter(t => t.status !== 'completed');
    const overdueTasks = pendingTasks.filter(t => new Date(t.dueDate) < new Date());

    const indicators: BurnoutFactor[] = [];
    
    // Workload indicator
    const workloadSeverity = Math.min(100, pendingTasks.length * 12);
    indicators.push({
      name: 'عبء العمل',
      severity: workloadSeverity,
      trend: workloadSeverity > 60 ? 'worsening' : workloadSeverity > 30 ? 'stable' : 'improving',
      description: `${pendingTasks.length} مهمة معلقة حالياً`
    });

    // Overdue tasks indicator
    const overdueSeverity = Math.min(100, overdueTasks.length * 20);
    indicators.push({
      name: 'المهام المتأخرة',
      severity: overdueSeverity,
      trend: overdueSeverity > 40 ? 'worsening' : 'stable',
      description: `${overdueTasks.length} مهمة متأخرة عن موعدها`
    });

    // Stress level indicator
    const stressSeverity = psychProfile.stress === 'high' ? 80 : psychProfile.stress === 'medium' ? 50 : 20;
    indicators.push({
      name: 'مستوى التوتر',
      severity: stressSeverity,
      trend: stressSeverity > 60 ? 'worsening' : stressSeverity > 40 ? 'stable' : 'improving',
      description: `مستوى توتر ${psychProfile.stress === 'high' ? 'مرتفع' : psychProfile.stress === 'medium' ? 'متوسط' : 'منخفض'}`
    });

    // Motivation indicator
    const motivationSeverity = psychProfile.motivation === 'low' ? 70 : psychProfile.motivation === 'medium' ? 40 : 15;
    indicators.push({
      name: 'الدافعية',
      severity: motivationSeverity,
      trend: motivationSeverity > 50 ? 'worsening' : 'stable',
      description: `مستوى دافعية ${psychProfile.motivation === 'low' ? 'منخفض' : psychProfile.motivation === 'medium' ? 'متوسط' : 'مرتفع'}`
    });

    const burnoutScore = Math.min(100, psychProfile.burnout + (overdueSeverity * 0.3));
    let burnoutLevel: 'healthy' | 'mild' | 'moderate' | 'severe';
    if (burnoutScore >= 70) burnoutLevel = 'severe';
    else if (burnoutScore >= 50) burnoutLevel = 'moderate';
    else if (burnoutScore >= 30) burnoutLevel = 'mild';
    else burnoutLevel = 'healthy';

    const workloadBalance = 50 - pendingTasks.length * 8 - overdueTasks.length * 15;

    const recommendations = this.generateBurnoutRecommendations(burnoutLevel, indicators);
    const recoveryActions = this.generateRecoveryActions(burnoutLevel);

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      burnoutScore: Math.round(burnoutScore),
      burnoutLevel,
      indicators,
      recommendations,
      workloadBalance: Math.max(-100, Math.min(100, workloadBalance)),
      recoveryActions,
      lastCheckDate: new Date()
    };
  }

  private static generateBurnoutRecommendations(burnoutLevel: string, indicators: BurnoutFactor[]): string[] {
    const recommendations: string[] = [];

    if (burnoutLevel === 'severe') {
      recommendations.push('إجازة قصيرة للتعافي مطلوبة');
      recommendations.push('تقليل المهام المسندة فوراً');
      recommendations.push('جلسة دعم نفسي موصى بها');
    } else if (burnoutLevel === 'moderate') {
      recommendations.push('مراجعة توزيع المهام');
      recommendations.push('تشجيع فترات راحة منتظمة');
      recommendations.push('مراجعة الأهداف المرحلية');
    } else if (burnoutLevel === 'mild') {
      recommendations.push('مراقبة مستمرة للحالة');
      recommendations.push('تنويع المهام لتجنب الملل');
    }

    indicators.forEach(indicator => {
      if (indicator.severity > 60) {
        if (indicator.name === 'عبء العمل') {
          recommendations.push('إعادة توزيع بعض المهام على الفريق');
        }
        if (indicator.name === 'المهام المتأخرة') {
          recommendations.push('مراجعة المواعيد النهائية وتمديدها إذا لزم');
        }
      }
    });

    return [...new Set(recommendations)];
  }

  private static generateRecoveryActions(burnoutLevel: string): string[] {
    const actions: string[] = [];

    if (burnoutLevel === 'severe' || burnoutLevel === 'moderate') {
      actions.push('جدولة استراحات قصيرة كل ساعتين');
      actions.push('تحديد أوقات عمل مرنة');
      actions.push('تقليل الاجتماعات غير الضرورية');
      actions.push('تفويض بعض المهام للزملاء');
    }

    if (burnoutLevel === 'severe') {
      actions.push('النظر في إجازة مدفوعة');
      actions.push('توفير دعم نفسي متخصص');
    }

    actions.push('تشجيع النشاط البدني');
    actions.push('ضمان التوازن بين العمل والحياة');

    return actions;
  }
}