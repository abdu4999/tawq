/**
 * IDP SYSTEM - خطة التطوير الفردية
 * Individual Development Plan لكل موظف
 */

export interface IDPPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  createdAt: Date;
  lastUpdated: Date;
  currentLevel: number; // 1-5
  targetLevel: number; // 1-5
  strengths: Strength[];
  weaknesses: Weakness[];
  goals30Days: Goal[];
  goals90Days: Goal[];
  skills: SkillAssessment[];
  developmentActivities: DevelopmentActivity[];
  progress: IDPProgress;
}

export interface Strength {
  id: string;
  category: 'technical' | 'soft' | 'leadership' | 'communication' | 'creative';
  title: string;
  description: string;
  score: number; // 0-100
  evidences: string[]; // أمثلة من العمل
}

export interface Weakness {
  id: string;
  category: 'technical' | 'soft' | 'leadership' | 'communication' | 'creative';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  improvementPlan: string;
  resources: string[]; // مصادر التعلم
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'project' | 'behavior' | 'leadership' | 'performance';
  targetDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number; // 0-100
  milestones: Milestone[];
  successCriteria: string[];
  supportNeeded: string[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface SkillAssessment {
  skillName: string;
  category: 'technical' | 'soft' | 'leadership' | 'communication' | 'creative';
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gap: number; // الفرق
  priority: 'low' | 'medium' | 'high';
  learningPath: string[];
}

export interface DevelopmentActivity {
  id: string;
  type: 'training' | 'mentoring' | 'project' | 'reading' | 'certification' | 'workshop';
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  cost: number;
  provider?: string;
  relatedSkills: string[];
  outcome?: string;
}

export interface IDPProgress {
  overallProgress: number; // 0-100
  goals30DaysProgress: number;
  goals90DaysProgress: number;
  skillsImprovement: number; // متوسط التحسن
  activitiesCompleted: number;
  activitiesTotal: number;
  onTrack: boolean;
  nextReviewDate: Date;
}

export interface WeeklyRecommendation {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  focusAreas: string[];
  suggestedActivities: string[];
  motivationalMessage: string;
  tips: string[];
}

class IDPSystemEngine {
  /**
   * إنشاء خطة IDP جديدة
   */
  createIDPPlan(
    employeeId: string,
    employeeName: string,
    position: string,
    department: string,
    currentLevel: number
  ): IDPPlan {
    return {
      id: `idp_${employeeId}_${Date.now()}`,
      employeeId,
      employeeName,
      position,
      department,
      createdAt: new Date(),
      lastUpdated: new Date(),
      currentLevel,
      targetLevel: Math.min(currentLevel + 1, 5),
      strengths: [],
      weaknesses: [],
      goals30Days: [],
      goals90Days: [],
      skills: [],
      developmentActivities: [],
      progress: {
        overallProgress: 0,
        goals30DaysProgress: 0,
        goals90DaysProgress: 0,
        skillsImprovement: 0,
        activitiesCompleted: 0,
        activitiesTotal: 0,
        onTrack: true,
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    };
  }

  /**
   * تحليل نقاط القوة من الأداء
   */
  analyzeStrengths(
    behaviorScores: any,
    taskHistory: any[]
  ): Strength[] {
    const strengths: Strength[] = [];

    // تحليل الإنتاجية
    if (behaviorScores?.productivityScore > 80) {
      strengths.push({
        id: 'strength_productivity',
        category: 'technical',
        title: 'إنتاجية عالية',
        description: 'يحافظ على مستوى إنتاجية مرتفع بشكل مستمر',
        score: behaviorScores.productivityScore,
        evidences: [`${behaviorScores.productivityScore}% معدل إنتاجية`]
      });
    }

    // تحليل التركيز
    if (behaviorScores?.focusScore > 75) {
      strengths.push({
        id: 'strength_focus',
        category: 'soft',
        title: 'تركيز عالي',
        description: 'قدرة ممتازة على التركيز والانتباه للتفاصيل',
        score: behaviorScores.focusScore,
        evidences: [`${behaviorScores.focusScore}% معدل تركيز`]
      });
    }

    // تحليل الجودة
    if (behaviorScores?.qualityScore > 85) {
      strengths.push({
        id: 'strength_quality',
        category: 'technical',
        title: 'جودة عمل ممتازة',
        description: 'يقدم عمل بجودة عالية ومعدل أخطاء منخفض',
        score: behaviorScores.qualityScore,
        evidences: [`${behaviorScores.qualityScore}% معدل جودة`]
      });
    }

    // تحليل المهام
    const completedOnTime = taskHistory.filter(t => t.status === 'completed' && !t.isOverdue).length;
    const total = taskHistory.length;
    const onTimeRate = total > 0 ? (completedOnTime / total) * 100 : 0;

    if (onTimeRate > 80) {
      strengths.push({
        id: 'strength_reliability',
        category: 'soft',
        title: 'الالتزام بالمواعيد',
        description: 'موثوق في إنجاز المهام في الوقت المحدد',
        score: Math.round(onTimeRate),
        evidences: [`${completedOnTime} من ${total} مهمة أنجزت في الوقت`]
      });
    }

    return strengths;
  }

  /**
   * تحليل نقاط الضعف
   */
  analyzeWeaknesses(
    behaviorScores: any,
    distractionAnalysis: any
  ): Weakness[] {
    const weaknesses: Weakness[] = [];

    // التشتت
    if (distractionAnalysis?.distractionIndex > 60) {
      weaknesses.push({
        id: 'weakness_distraction',
        category: 'soft',
        title: 'التشتت وصعوبة التركيز',
        description: 'يعاني من مستوى تشتت مرتفع يؤثر على الإنتاجية',
        impact: distractionAnalysis.distractionIndex > 80 ? 'high' : 'medium',
        improvementPlan: 'تطبيق تقنيات Pomodoro وتقليل المقاطعات',
        resources: [
          'دورة إدارة الوقت والتركيز',
          'تطبيقات منع المشتتات',
          'تمارين اليقظة الذهنية'
        ]
      });
    }

    // الحيرة
    if (distractionAnalysis?.confusionScore > 50) {
      weaknesses.push({
        id: 'weakness_confusion',
        category: 'technical',
        title: 'الحاجة لمزيد من التدريب',
        description: 'يظهر حيرة في بعض المهام والوظائف',
        impact: 'medium',
        improvementPlan: 'توفير تدريب إضافي وأدلة استخدام',
        resources: [
          'جلسات تدريبية فردية',
          'أدلة مرجعية مبسطة',
          'برنامج توجيه (Mentoring)'
        ]
      });
    }

    // التوتر
    if (distractionAnalysis?.stressIndicator > 70) {
      weaknesses.push({
        id: 'weakness_stress',
        category: 'soft',
        title: 'إدارة التوتر والضغط',
        description: 'مستويات توتر عالية تحتاج إدارة أفضل',
        impact: 'high',
        improvementPlan: 'تعلم تقنيات إدارة الضغط وتحسين التوازن',
        resources: [
          'ورشة إدارة الضغوط',
          'جلسات استشارية',
          'تمارين الاسترخاء'
        ]
      });
    }

    return weaknesses;
  }

  /**
   * توليد أهداف 30 يوم
   */
  generate30DaysGoals(
    weaknesses: Weakness[],
    skills: SkillAssessment[]
  ): Goal[] {
    const goals: Goal[] = [];
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // هدف لكل نقطة ضعف ذات تأثير عالي
    weaknesses.filter(w => w.impact === 'high').forEach((weakness, i) => {
      goals.push({
        id: `goal_30d_${i}`,
        title: `تحسين: ${weakness.title}`,
        description: weakness.improvementPlan,
        category: 'behavior',
        targetDate: in30Days,
        status: 'not-started',
        progress: 0,
        milestones: [
          {
            id: `milestone_${i}_1`,
            title: 'بدء البرنامج التدريبي',
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            completed: false
          },
          {
            id: `milestone_${i}_2`,
            title: 'تطبيق التحسينات',
            dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
            completed: false
          }
        ],
        successCriteria: [
          'تحسن بنسبة 20% على الأقل',
          'تطبيق التقنيات المكتسبة بشكل يومي'
        ],
        supportNeeded: weakness.resources
      });
    });

    // أهداف المهارات ذات الأولوية العالية
    skills.filter(s => s.priority === 'high').slice(0, 2).forEach((skill, i) => {
      goals.push({
        id: `goal_30d_skill_${i}`,
        title: `تطوير مهارة: ${skill.skillName}`,
        description: `رفع المستوى من ${skill.currentLevel}% إلى ${Math.min(skill.currentLevel + 15, 100)}%`,
        category: 'skill',
        targetDate: in30Days,
        status: 'not-started',
        progress: 0,
        milestones: skill.learningPath.slice(0, 2).map((path, idx) => ({
          id: `milestone_skill_${i}_${idx}`,
          title: path,
          dueDate: new Date(now.getTime() + (idx + 1) * 15 * 24 * 60 * 60 * 1000),
          completed: false
        })),
        successCriteria: [
          `رفع المستوى بمقدار 15 نقطة`,
          'إكمال التدريبات العملية'
        ],
        supportNeeded: ['وقت مخصص للتعلم', 'موارد تعليمية']
      });
    });

    return goals;
  }

  /**
   * توليد أهداف 90 يوم
   */
  generate90DaysGoals(
    currentLevel: number,
    targetLevel: number,
    skills: SkillAssessment[]
  ): Goal[] {
    const goals: Goal[] = [];
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // هدف رئيسي: الارتقاء بالمستوى
    if (targetLevel > currentLevel) {
      goals.push({
        id: 'goal_90d_level',
        title: `الارتقاء من المستوى ${currentLevel} إلى المستوى ${targetLevel}`,
        description: 'تطوير شامل للمهارات والكفاءات المطلوبة للمستوى التالي',
        category: 'performance',
        targetDate: in90Days,
        status: 'not-started',
        progress: 0,
        milestones: [
          {
            id: 'milestone_level_1',
            title: 'إكمال التدريبات الأساسية',
            dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            completed: false
          },
          {
            id: 'milestone_level_2',
            title: 'تطبيق المهارات في مشاريع حقيقية',
            dueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
            completed: false
          },
          {
            id: 'milestone_level_3',
            title: 'التقييم النهائي والترقية',
            dueDate: in90Days,
            completed: false
          }
        ],
        successCriteria: [
          'استيفاء جميع متطلبات المستوى التالي',
          'تقييم إيجابي من المدير المباشر',
          'إتمام 3 مشاريع ناجحة على الأقل'
        ],
        supportNeeded: [
          'موافقة الإدارة',
          'ميزانية تدريب',
          'توجيه من أصحاب الخبرة'
        ]
      });
    }

    // أهداف المهارات المتوسطة الأولوية
    skills.filter(s => s.priority === 'medium').slice(0, 3).forEach((skill, i) => {
      goals.push({
        id: `goal_90d_skill_${i}`,
        title: `إتقان: ${skill.skillName}`,
        description: `رفع المستوى من ${skill.currentLevel}% إلى ${skill.targetLevel}%`,
        category: 'skill',
        targetDate: in90Days,
        status: 'not-started',
        progress: 0,
        milestones: skill.learningPath.map((path, idx) => ({
          id: `milestone_90d_${i}_${idx}`,
          title: path,
          dueDate: new Date(now.getTime() + (idx + 1) * 30 * 24 * 60 * 60 * 1000),
          completed: false
        })),
        successCriteria: [
          `الوصول للمستوى ${skill.targetLevel}%`,
          'تطبيق المهارة في 2 مشروع على الأقل'
        ],
        supportNeeded: ['دورات تدريبية', 'مشاريع عملية']
      });
    });

    // هدف قيادي
    goals.push({
      id: 'goal_90d_leadership',
      title: 'تطوير المهارات القيادية',
      description: 'تولي مسؤوليات قيادية وتوجيه أعضاء الفريق',
      category: 'leadership',
      targetDate: in90Days,
      status: 'not-started',
      progress: 0,
      milestones: [
        {
          id: 'milestone_lead_1',
          title: 'قيادة اجتماع فريق',
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          completed: false
        },
        {
          id: 'milestone_lead_2',
          title: 'توجيه موظف جديد',
          dueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          completed: false
        }
      ],
      successCriteria: [
        'تقييم إيجابي من أعضاء الفريق',
        'إكمال دورة القيادة الأساسية'
      ],
      supportNeeded: ['فرص قيادة مشاريع صغيرة', 'توجيه من القيادات']
    });

    return goals;
  }

  /**
   * حساب التقدم الإجمالي
   */
  calculateProgress(plan: IDPPlan): IDPProgress {
    // تقدم أهداف 30 يوم
    const goals30Progress = plan.goals30Days.length > 0
      ? plan.goals30Days.reduce((sum, g) => sum + g.progress, 0) / plan.goals30Days.length
      : 0;

    // تقدم أهداف 90 يوم
    const goals90Progress = plan.goals90Days.length > 0
      ? plan.goals90Days.reduce((sum, g) => sum + g.progress, 0) / plan.goals90Days.length
      : 0;

    // تحسن المهارات
    const skillsImprovement = plan.skills.length > 0
      ? plan.skills.reduce((sum, s) => {
          const improvement = s.currentLevel - (s.targetLevel - s.gap);
          return sum + Math.max(improvement, 0);
        }, 0) / plan.skills.length
      : 0;

    // الأنشطة المكتملة
    const activitiesCompleted = plan.developmentActivities.filter(a => a.status === 'completed').length;
    const activitiesTotal = plan.developmentActivities.length;

    // التقدم الإجمالي
    const overallProgress = Math.round(
      (goals30Progress * 0.3) +
      (goals90Progress * 0.4) +
      (skillsImprovement * 0.2) +
      ((activitiesCompleted / Math.max(activitiesTotal, 1)) * 100 * 0.1)
    );

    // فحص المسار
    const now = new Date();
    const daysSinceCreation = (now.getTime() - plan.createdAt.getTime()) / (24 * 60 * 60 * 1000);
    const expectedProgress = (daysSinceCreation / 90) * 100;
    const onTrack = overallProgress >= expectedProgress - 10;

    return {
      overallProgress,
      goals30DaysProgress: Math.round(goals30Progress),
      goals90DaysProgress: Math.round(goals90Progress),
      skillsImprovement: Math.round(skillsImprovement),
      activitiesCompleted,
      activitiesTotal,
      onTrack,
      nextReviewDate: new Date(plan.lastUpdated.getTime() + 30 * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * توصيات أسبوعية
   */
  generateWeeklyRecommendation(plan: IDPPlan): WeeklyRecommendation {
    const now = new Date();
    const weeksSinceCreation = Math.floor(
      (now.getTime() - plan.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // تحديد مجالات التركيز
    const focusAreas: string[] = [];
    const suggestedActivities: string[] = [];

    // أهداف متأخرة
    const delayedGoals = [...plan.goals30Days, ...plan.goals90Days]
      .filter(g => g.status === 'delayed' || 
        (g.status !== 'completed' && new Date(g.targetDate) < now));

    if (delayedGoals.length > 0) {
      focusAreas.push('تسريع الأهداف المتأخرة');
      suggestedActivities.push(`التركيز على: ${delayedGoals[0].title}`);
    }

    // نقاط ضعف ذات تأثير عالي
    const highImpactWeaknesses = plan.weaknesses.filter(w => w.impact === 'high');
    if (highImpactWeaknesses.length > 0) {
      focusAreas.push(highImpactWeaknesses[0].title);
      suggestedActivities.push(highImpactWeaknesses[0].improvementPlan);
    }

    // مهارات عالية الأولوية
    const highPrioritySkills = plan.skills.filter(s => s.priority === 'high');
    if (highPrioritySkills.length > 0) {
      focusAreas.push(`تطوير: ${highPrioritySkills[0].skillName}`);
      suggestedActivities.push(...highPrioritySkills[0].learningPath.slice(0, 1));
    }

    // رسالة تحفيزية
    let motivationalMessage = '';
    if (plan.progress.overallProgress > 70) {
      motivationalMessage = '🎉 أداء رائع! أنت على المسار الصحيح للوصول لأهدافك!';
    } else if (plan.progress.overallProgress > 40) {
      motivationalMessage = '💪 استمر في التقدم! أنت في منتصف الطريق!';
    } else {
      motivationalMessage = '🚀 حان وقت التسريع! ركز على أهدافك الأساسية!';
    }

    return {
      weekNumber: weeksSinceCreation + 1,
      startDate: startOfWeek,
      endDate: endOfWeek,
      focusAreas: focusAreas.slice(0, 3),
      suggestedActivities: suggestedActivities.slice(0, 5),
      motivationalMessage,
      tips: [
        'خصص ساعة يومياً للتطوير الذاتي',
        'راجع تقدمك في نهاية كل أسبوع',
        'لا تتردد في طلب المساعدة من المشرف'
      ]
    };
  }
}

export const idpSystem = new IDPSystemEngine();
