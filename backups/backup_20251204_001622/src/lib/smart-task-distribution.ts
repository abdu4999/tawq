/**
 * SMART TASK DISTRIBUTION ENGINE
 * توزيع المهام الذكي بناءً على حالة الموظف وقدراته
 */

export interface TaskToDistribute {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requiredSkills: string[];
  deadline: Date;
  tags: string[];
}

export interface EmployeeProfile {
  id: string;
  name: string;
  position: string;
  skills: SkillLevel[];
  currentWorkload: number; // 0-100
  availability: number; // 0-100
  performanceScore: number; // 0-100
  burnoutScore: number; // 0-100
  stressLevel: number; // 0-100
  recentSuccess: number; // عدد المهام الناجحة مؤخراً
  recentFailures: number; // عدد المهام الفاشلة مؤخراً
  preferredTaskTypes: string[];
  workingHours: {
    start: number; // hour 0-23
    end: number; // hour 0-23
  };
  timezone: string;
}

export interface SkillLevel {
  skill: string;
  level: number; // 0-100
  lastUsed: Date;
  certifications: string[];
}

export interface DistributionResult {
  taskId: string;
  taskTitle: string;
  selectedEmployee: EmployeeProfile;
  score: number; // 0-100 مدى مناسبة الموظف
  reasoning: string[];
  alternatives: AlternativeAssignment[];
  estimatedCompletionDate: Date;
  successProbability: number; // 0-100
  riskFactors: string[];
  recommendations: string[];
}

export interface AlternativeAssignment {
  employee: EmployeeProfile;
  score: number;
  reason: string;
}

export interface RAGScore {
  employeeId: string;
  employeeName: string;
  readiness: number; // 0-100 جاهزية
  availability: number; // 0-100 توفر
  growth: number; // 0-100 فرصة للنمو
  overall: number; // المجموع الموزون
  color: 'red' | 'amber' | 'green';
}

class SmartTaskDistributionEngine {
  /**
   * توزيع مهمة على أفضل موظف
   */
  distributeTask(
    task: TaskToDistribute,
    employees: EmployeeProfile[]
  ): DistributionResult {
    // حساب RAG Score لكل موظف
    const ragScores = employees.map(emp => this.calculateRAGScore(emp, task));
    
    // تصفية الموظفين غير المؤهلين
    const qualified = ragScores.filter(score => score.readiness >= 40);
    
    if (qualified.length === 0) {
      throw new Error('لا يوجد موظفين مؤهلين لهذه المهمة حالياً');
    }
    
    // ترتيب حسب النقاط
    qualified.sort((a, b) => b.overall - a.overall);
    
    // اختيار الأفضل
    const selected = qualified[0];
    const employee = employees.find(e => e.id === selected.employeeId)!;
    
    // توليد المبررات
    const reasoning = this.generateReasoning(employee, task, selected);
    
    // الخيارات البديلة
    const alternatives = qualified.slice(1, 4).map(score => ({
      employee: employees.find(e => e.id === score.employeeId)!,
      score: score.overall,
      reason: this.getAlternativeReason(score)
    }));
    
    // تقدير موعد الإنجاز
    const estimatedCompletionDate = this.estimateCompletionDate(employee, task);
    
    // احتمالية النجاح
    const successProbability = this.calculateSuccessProbability(employee, task, selected);
    
    // عوامل الخطر
    const riskFactors = this.identifyRiskFactors(employee, task);
    
    // التوصيات
    const recommendations = this.generateRecommendations(employee, task, riskFactors);

    return {
      taskId: task.id,
      taskTitle: task.title,
      selectedEmployee: employee,
      score: Math.round(selected.overall),
      reasoning,
      alternatives,
      estimatedCompletionDate,
      successProbability: Math.round(successProbability),
      riskFactors,
      recommendations
    };
  }

  /**
   * حساب RAG Score
   */
  calculateRAGScore(employee: EmployeeProfile, task: TaskToDistribute): RAGScore {
    // 1. Readiness - الجاهزية (المهارات والخبرة)
    const readiness = this.calculateReadiness(employee, task);
    
    // 2. Availability - التوفر (العبء والوقت)
    const availability = this.calculateAvailability(employee, task);
    
    // 3. Growth - فرصة النمو
    const growth = this.calculateGrowthOpportunity(employee, task);
    
    // الدرجة الإجمالية (موزونة)
    const overall = (readiness * 0.5) + (availability * 0.3) + (growth * 0.2);
    
    // تحديد اللون
    let color: 'red' | 'amber' | 'green';
    if (overall >= 70) color = 'green';
    else if (overall >= 40) color = 'amber';
    else color = 'red';

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      readiness: Math.round(readiness),
      availability: Math.round(availability),
      growth: Math.round(growth),
      overall: Math.round(overall),
      color
    };
  }

  /**
   * حساب الجاهزية
   */
  private calculateReadiness(employee: EmployeeProfile, task: TaskToDistribute): number {
    let score = 0;
    
    // مطابقة المهارات
    const requiredSkills = task.requiredSkills;
    const employeeSkills = employee.skills;
    
    if (requiredSkills.length === 0) {
      score += 50; // لا توجد متطلبات محددة
    } else {
      const matchedSkills = requiredSkills.filter(reqSkill =>
        employeeSkills.some(empSkill => 
          empSkill.skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(empSkill.skill.toLowerCase())
        )
      );
      
      const skillMatchRate = matchedSkills.length / requiredSkills.length;
      score += skillMatchRate * 60;
      
      // مستوى المهارات المتطابقة
      matchedSkills.forEach(skill => {
        const empSkill = employeeSkills.find(s => 
          s.skill.toLowerCase().includes(skill.toLowerCase())
        );
        if (empSkill) {
          score += (empSkill.level / 100) * (40 / requiredSkills.length);
        }
      });
    }
    
    // الأداء العام
    score *= (employee.performanceScore / 100);
    
    // تعديل حسب صعوبة المهمة
    const difficultyFactors = {
      'easy': 1.2,
      'medium': 1.0,
      'hard': 0.8,
      'expert': 0.6
    };
    score *= difficultyFactors[task.difficulty];
    
    return Math.min(score, 100);
  }

  /**
   * حساب التوفر
   */
  private calculateAvailability(employee: EmployeeProfile, task: TaskToDistribute): number {
    let score = 100;
    
    // عبء العمل الحالي
    score -= employee.currentWorkload * 0.6;
    
    // مستوى الإجهاد
    score -= (employee.burnoutScore / 100) * 20;
    
    // مستوى التوتر
    score -= (employee.stressLevel / 100) * 15;
    
    // التوفر الفعلي
    score *= (employee.availability / 100);
    
    // الوقت المتاح حتى الموعد النهائي
    const daysUntilDeadline = (new Date(task.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    const requiredDays = task.estimatedHours / 8; // افتراض 8 ساعات عمل يومياً
    
    if (daysUntilDeadline < requiredDays) {
      score *= 0.5; // ضيق الوقت
    } else if (daysUntilDeadline > requiredDays * 2) {
      score *= 1.1; // وقت كافٍ
    }
    
    return Math.max(0, Math.min(score, 100));
  }

  /**
   * حساب فرصة النمو
   */
  private calculateGrowthOpportunity(employee: EmployeeProfile, task: TaskToDistribute): number {
    let score = 50; // نقطة بداية متوسطة
    
    // المهمة تحتوي على مهارات جديدة = فرصة للتعلم
    const newSkills = task.requiredSkills.filter(reqSkill =>
      !employee.skills.some(empSkill => 
        empSkill.skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );
    
    if (newSkills.length > 0) {
      score += 30; // فرصة تعلم جيدة
    }
    
    // المهمة تطابق اهتمامات الموظف
    const matchesPreferences = task.tags.some(tag =>
      employee.preferredTaskTypes.includes(tag)
    );
    
    if (matchesPreferences) {
      score += 20;
    }
    
    // تحدي مناسب (ليس سهل جداً ولا صعب جداً)
    if (task.difficulty === 'medium') {
      score += 10;
    } else if (task.difficulty === 'hard' && employee.performanceScore > 70) {
      score += 15; // تحدي جيد لموظف متميز
    }
    
    // النجاحات الأخيرة تزيد الثقة
    if (employee.recentSuccess > employee.recentFailures) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * توليد المبررات
   */
  private generateReasoning(
    employee: EmployeeProfile,
    task: TaskToDistribute,
    ragScore: RAGScore
  ): string[] {
    const reasons: string[] = [];
    
    reasons.push(`🎯 تم اختيار ${employee.name} للمهمة`);
    reasons.push(`📊 النقاط الإجمالية: ${ragScore.overall}/100`);
    
    // الجاهزية
    if (ragScore.readiness >= 80) {
      reasons.push(`✅ جاهزية ممتازة (${ragScore.readiness}%) - يمتلك المهارات المطلوبة`);
    } else if (ragScore.readiness >= 60) {
      reasons.push(`✓ جاهزية جيدة (${ragScore.readiness}%) - مؤهل للمهمة`);
    } else {
      reasons.push(`⚠️ جاهزية متوسطة (${ragScore.readiness}%) - قد يحتاج دعم`);
    }
    
    // التوفر
    if (ragScore.availability >= 70) {
      reasons.push(`✅ متاح ولديه وقت كافٍ (${ragScore.availability}%)`);
    } else if (ragScore.availability >= 40) {
      reasons.push(`⚠️ متاح جزئياً (${ragScore.availability}%) - قد يحتاج تعديل أولويات`);
    } else {
      reasons.push(`⚠️ عبء عمل مرتفع (${ragScore.availability}%) - يحتاج متابعة`);
    }
    
    // فرصة النمو
    if (ragScore.growth >= 70) {
      reasons.push(`🌟 فرصة ممتازة للنمو والتطور (${ragScore.growth}%)`);
    } else if (ragScore.growth >= 50) {
      reasons.push(`📈 فرصة جيدة للتعلم (${ragScore.growth}%)`);
    }
    
    // الحالة النفسية
    if (employee.burnoutScore > 70) {
      reasons.push(`⚠️ تنبيه: مؤشرات احتراق وظيفي مرتفعة`);
    }
    
    if (employee.stressLevel > 70) {
      reasons.push(`⚠️ تنبيه: مستوى توتر عالي`);
    }
    
    // الأداء السابق
    if (employee.recentSuccess > 5) {
      reasons.push(`🏆 سجل حافل: ${employee.recentSuccess} نجاح مؤخراً`);
    }
    
    return reasons;
  }

  /**
   * تقدير موعد الإنجاز
   */
  private estimateCompletionDate(employee: EmployeeProfile, task: TaskToDistribute): Date {
    // حساب الساعات الفعلية المتوقعة
    let effectiveHours = task.estimatedHours;
    
    // تعديل حسب الأداء
    const performanceFactor = employee.performanceScore / 100;
    effectiveHours /= performanceFactor;
    
    // تعديل حسب عبء العمل
    const workloadFactor = 1 + (employee.currentWorkload / 100);
    effectiveHours *= workloadFactor;
    
    // حساب الأيام (افتراض 6 ساعات عمل فعلية يومياً)
    const days = Math.ceil(effectiveHours / 6);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + days);
    
    return completionDate;
  }

  /**
   * حساب احتمالية النجاح
   */
  private calculateSuccessProbability(
    employee: EmployeeProfile,
    task: TaskToDistribute,
    ragScore: RAGScore
  ): number {
    let probability = ragScore.overall;
    
    // النجاحات السابقة تزيد الاحتمالية
    if (employee.recentSuccess > employee.recentFailures) {
      probability += 10;
    }
    
    // الإجهاد يقلل الاحتمالية
    if (employee.burnoutScore > 70) {
      probability -= 15;
    }
    
    // الأولوية العاجلة قد تؤثر
    if (task.priority === 'urgent' && employee.currentWorkload > 70) {
      probability -= 10;
    }
    
    return Math.max(0, Math.min(probability, 100));
  }

  /**
   * تحديد عوامل الخطر
   */
  private identifyRiskFactors(employee: EmployeeProfile, task: TaskToDistribute): string[] {
    const risks: string[] = [];
    
    if (employee.burnoutScore > 70) {
      risks.push('احتمالية احتراق وظيفي - يحتاج متابعة دقيقة');
    }
    
    if (employee.currentWorkload > 80) {
      risks.push('عبء عمل مرتفع جداً - قد يتأخر الإنجاز');
    }
    
    const daysUntilDeadline = (new Date(task.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    const requiredDays = task.estimatedHours / 6;
    
    if (daysUntilDeadline < requiredDays * 1.2) {
      risks.push('ضيق الوقت - الموعد النهائي قريب');
    }
    
    if (task.difficulty === 'expert' && employee.performanceScore < 80) {
      risks.push('مهمة معقدة - قد يحتاج دعم إضافي');
    }
    
    if (employee.recentFailures > 2) {
      risks.push('إخفاقات حديثة - يحتاج دعم ومتابعة');
    }
    
    return risks;
  }

  /**
   * توليد التوصيات
   */
  private generateRecommendations(
    employee: EmployeeProfile,
    task: TaskToDistribute,
    risks: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (risks.length > 0) {
      recommendations.push('📋 متابعة يومية للتقدم');
    }
    
    if (employee.burnoutScore > 60) {
      recommendations.push('💆 توفير استراحات إضافية');
      recommendations.push('🗣️ جلسة دعم مع المشرف');
    }
    
    if (task.difficulty === 'hard' || task.difficulty === 'expert') {
      recommendations.push('👥 توفير موجه (Mentor) للمساعدة');
      recommendations.push('📚 توفير موارد تعليمية إضافية');
    }
    
    if (employee.currentWorkload > 70) {
      recommendations.push('🔄 إعادة ترتيب الأولويات الحالية');
    }
    
    if (task.priority === 'urgent') {
      recommendations.push('⚡ تخصيص وقت مركز بدون مقاطعات');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ المهمة مناسبة - لا توصيات إضافية');
    }
    
    return recommendations;
  }

  /**
   * سبب الخيار البديل
   */
  private getAlternativeReason(score: RAGScore): string {
    if (score.overall >= 70) {
      return `خيار ممتاز أيضاً (${score.overall} نقطة)`;
    } else if (score.overall >= 50) {
      return `خيار جيد بديل (${score.overall} نقطة)`;
    } else {
      return `خيار احتياطي (${score.overall} نقطة)`;
    }
  }

  /**
   * توزيع متعدد
   */
  distributeMultipleTasks(
    tasks: TaskToDistribute[],
    employees: EmployeeProfile[]
  ): DistributionResult[] {
    const results: DistributionResult[] = [];
    const employeeCopies = JSON.parse(JSON.stringify(employees)); // نسخة للتعديل
    
    // ترتيب المهام حسب الأولوية
    const sortedTasks = tasks.sort((a, b) => {
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    sortedTasks.forEach(task => {
      const result = this.distributeTask(task, employeeCopies);
      results.push(result);
      
      // تحديث عبء العمل
      const empIndex = employeeCopies.findIndex(e => e.id === result.selectedEmployee.id);
      if (empIndex !== -1) {
        employeeCopies[empIndex].currentWorkload += (task.estimatedHours / 40) * 100; // افتراض 40 ساعة أسبوعياً
        employeeCopies[empIndex].currentWorkload = Math.min(employeeCopies[empIndex].currentWorkload, 100);
      }
    });
    
    return results;
  }
}

export const smartTaskDistribution = new SmartTaskDistributionEngine();
