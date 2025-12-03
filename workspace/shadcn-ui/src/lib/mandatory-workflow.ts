/**
 * MANDATORY WORKFLOW ENGINE
 * نظام الخطوات الإلزامية للمشاريع
 */

export interface ProjectStep {
  id: string;
  projectId: string;
  stepNumber: number;
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  assignedTo?: string;
  files: StepFile[];
  dependencies: string[]; // معرفات الخطوات التي يجب إكمالها أولاً
  deadline?: Date;
  completedAt?: Date;
  completedBy?: string;
  estimatedHours: number;
  actualHours?: number;
  notes?: string;
}

export interface StepFile {
  id: string;
  stepId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
  required: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'development' | 'design' | 'event' | 'campaign' | 'general';
  steps: Omit<ProjectStep, 'id' | 'projectId' | 'status' | 'completedAt' | 'completedBy'>[];
  estimatedTotalHours: number;
  requiredRoles: string[];
}

export interface WorkflowProgress {
  projectId: string;
  totalSteps: number;
  completedSteps: number;
  pendingSteps: number;
  inProgressSteps: number;
  skippedSteps: number;
  progressPercentage: number;
  isBlocked: boolean;
  blockedReason?: string;
  currentStep?: ProjectStep;
  nextStep?: ProjectStep;
  estimatedCompletion?: Date;
}

class MandatoryWorkflowEngine {
  /**
   * إنشاء مشروع من قالب
   */
  createProjectFromTemplate(
    projectId: string,
    templateId: string,
    templates: WorkflowTemplate[]
  ): ProjectStep[] {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    return template.steps.map((step, index) => ({
      id: `step_${projectId}_${index + 1}`,
      projectId,
      stepNumber: index + 1,
      title: step.title,
      description: step.description,
      required: step.required,
      status: 'pending' as const,
      assignedTo: step.assignedTo,
      files: [],
      dependencies: step.dependencies,
      deadline: step.deadline,
      estimatedHours: step.estimatedHours,
      notes: step.notes
    }));
  }

  /**
   * حساب تقدم المشروع
   */
  calculateProgress(steps: ProjectStep[]): WorkflowProgress {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const pendingSteps = steps.filter(s => s.status === 'pending').length;
    const inProgressSteps = steps.filter(s => s.status === 'in-progress').length;
    const skippedSteps = steps.filter(s => s.status === 'skipped').length;

    const progressPercentage = totalSteps > 0 
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

    // البحث عن الخطوة الحالية
    const currentStep = steps.find(s => s.status === 'in-progress');

    // البحث عن الخطوة التالية
    const nextStep = steps
      .filter(s => s.status === 'pending')
      .sort((a, b) => a.stepNumber - b.stepNumber)[0];

    // فحص الحظر
    const { isBlocked, reason } = this.checkIfBlocked(steps);

    // تقدير موعد الإكمال
    const estimatedCompletion = this.estimateCompletionDate(steps);

    return {
      projectId: steps[0]?.projectId || '',
      totalSteps,
      completedSteps,
      pendingSteps,
      inProgressSteps,
      skippedSteps,
      progressPercentage,
      isBlocked,
      blockedReason: reason,
      currentStep,
      nextStep,
      estimatedCompletion
    };
  }

  /**
   * فحص إذا كان المشروع محظور
   */
  private checkIfBlocked(steps: ProjectStep[]): { isBlocked: boolean; reason?: string } {
    // فحص الخطوات المتأخرة
    const now = new Date();
    const overdueSteps = steps.filter(s => 
      s.status !== 'completed' && 
      s.deadline && 
      new Date(s.deadline) < now
    );

    if (overdueSteps.length > 0) {
      return {
        isBlocked: true,
        reason: `${overdueSteps.length} خطوة متأخرة عن الموعد المحدد`
      };
    }

    // فحص الخطوات المعتمدة على خطوات غير مكتملة
    for (const step of steps) {
      if (step.status === 'in-progress' || step.status === 'pending') {
        const unmetDependencies = step.dependencies.filter(depId => {
          const depStep = steps.find(s => s.id === depId);
          return depStep && depStep.status !== 'completed';
        });

        if (unmetDependencies.length > 0) {
          return {
            isBlocked: true,
            reason: `الخطوة "${step.title}" معتمدة على خطوات غير مكتملة`
          };
        }
      }
    }

    // فحص الخطوات الإلزامية المتوقفة
    const requiredPendingSteps = steps.filter(s => 
      s.required && 
      s.status === 'pending' &&
      s.stepNumber < Math.max(...steps.filter(st => st.status === 'in-progress').map(st => st.stepNumber))
    );

    if (requiredPendingSteps.length > 0) {
      return {
        isBlocked: true,
        reason: 'يجب إكمال الخطوات الإلزامية السابقة أولاً'
      };
    }

    return { isBlocked: false };
  }

  /**
   * تقدير موعد الإكمال
   */
  private estimateCompletionDate(steps: ProjectStep[]): Date | undefined {
    const remainingSteps = steps.filter(s => 
      s.status === 'pending' || s.status === 'in-progress'
    );

    if (remainingSteps.length === 0) return undefined;

    const totalRemainingHours = remainingSteps.reduce((sum, step) => {
      const hours = step.status === 'in-progress' && step.actualHours
        ? step.estimatedHours - step.actualHours
        : step.estimatedHours;
      return sum + Math.max(hours, 0);
    }, 0);

    // افتراض 8 ساعات عمل يومياً
    const remainingDays = Math.ceil(totalRemainingHours / 8);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + remainingDays);

    return estimatedDate;
  }

  /**
   * بدء خطوة
   */
  startStep(step: ProjectStep, userId: string): ProjectStep {
    return {
      ...step,
      status: 'in-progress',
      assignedTo: step.assignedTo || userId
    };
  }

  /**
   * إكمال خطوة
   */
  completeStep(step: ProjectStep, userId: string): ProjectStep {
    return {
      ...step,
      status: 'completed',
      completedAt: new Date(),
      completedBy: userId
    };
  }

  /**
   * رفع ملف لخطوة
   */
  uploadFile(
    stepId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    url: string,
    userId: string,
    required: boolean = false
  ): StepFile {
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stepId,
      fileName,
      fileType,
      fileSize,
      uploadedAt: new Date(),
      uploadedBy: userId,
      url,
      required
    };
  }

  /**
   * فحص إذا كانت الخطوة قابلة للبدء
   */
  canStartStep(step: ProjectStep, allSteps: ProjectStep[]): { canStart: boolean; reason?: string } {
    // فحص الاعتماديات
    if (step.dependencies.length > 0) {
      const unmetDeps = step.dependencies.filter(depId => {
        const depStep = allSteps.find(s => s.id === depId);
        return depStep && depStep.status !== 'completed';
      });

      if (unmetDeps.length > 0) {
        return {
          canStart: false,
          reason: 'يجب إكمال الخطوات المعتمدة عليها أولاً'
        };
      }
    }

    // فحص إذا كانت خطوة إلزامية سابقة غير مكتملة
    const previousRequiredSteps = allSteps.filter(s => 
      s.required && 
      s.stepNumber < step.stepNumber &&
      s.status !== 'completed'
    );

    if (previousRequiredSteps.length > 0) {
      return {
        canStart: false,
        reason: 'يجب إكمال جميع الخطوات الإلزامية السابقة'
      };
    }

    return { canStart: true };
  }

  /**
   * فحص إذا كانت الخطوة قابلة للإكمال
   */
  canCompleteStep(step: ProjectStep): { canComplete: boolean; reason?: string } {
    // فحص الملفات المطلوبة
    const requiredFiles = step.files.filter(f => f.required);
    const hasAllRequiredFiles = requiredFiles.length > 0 
      ? step.files.some(f => f.required)
      : true;

    if (!hasAllRequiredFiles) {
      return {
        canComplete: false,
        reason: 'يجب رفع جميع الملفات المطلوبة'
      };
    }

    return { canComplete: true };
  }

  /**
   * قوالب جاهزة
   */
  getDefaultTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'marketing_campaign',
        name: 'حملة تسويقية',
        description: 'خطوات إطلاق حملة تسويقية شاملة',
        category: 'marketing',
        estimatedTotalHours: 120,
        requiredRoles: ['مدير تسويق', 'مصمم', 'كاتب محتوى'],
        steps: [
          {
            stepNumber: 1,
            title: 'تحديد الأهداف والجمهور المستهدف',
            description: 'وضع أهداف واضحة وقابلة للقياس وتحديد الجمهور المستهدف',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 8
          },
          {
            stepNumber: 2,
            title: 'دراسة المنافسين والسوق',
            description: 'تحليل المنافسين واتجاهات السوق',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 16
          },
          {
            stepNumber: 3,
            title: 'تطوير الرسالة التسويقية',
            description: 'صياغة رسالة تسويقية مؤثرة ومتسقة مع الهوية',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 12
          },
          {
            stepNumber: 4,
            title: 'تصميم المواد الإبداعية',
            description: 'تصميم الصور والفيديوهات والإعلانات',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 24
          },
          {
            stepNumber: 5,
            title: 'اختيار القنوات التسويقية',
            description: 'تحديد المنصات والقنوات المناسبة',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 8
          },
          {
            stepNumber: 6,
            title: 'إعداد الميزانية والجدول الزمني',
            description: 'تخصيص الميزانية ووضع جدول زمني للحملة',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 8
          },
          {
            stepNumber: 7,
            title: 'الموافقة النهائية',
            description: 'مراجعة واعتماد جميع المواد',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 4
          },
          {
            stepNumber: 8,
            title: 'إطلاق الحملة',
            description: 'نشر المحتوى على جميع القنوات المختارة',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 16
          },
          {
            stepNumber: 9,
            title: 'المراقبة والتحسين',
            description: 'متابعة الأداء وإجراء التحسينات',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 24
          }
        ]
      },
      {
        id: 'event_planning',
        name: 'تنظيم فعالية',
        description: 'خطوات تنظيم فعالية أو حدث',
        category: 'event',
        estimatedTotalHours: 80,
        requiredRoles: ['منظم فعاليات', 'منسق', 'مصمم'],
        steps: [
          {
            stepNumber: 1,
            title: 'تحديد نوع وأهداف الفعالية',
            description: 'تحديد طبيعة الفعالية والأهداف المرجوة',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 4
          },
          {
            stepNumber: 2,
            title: 'اختيار التاريخ والمكان',
            description: 'حجز المكان وتحديد الموعد المناسب',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 8
          },
          {
            stepNumber: 3,
            title: 'إعداد قائمة المدعوين',
            description: 'تحديد وإعداد قائمة الضيوف والمتحدثين',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 8
          },
          {
            stepNumber: 4,
            title: 'التصميم والهوية البصرية',
            description: 'تصميم الدعوات واللافتات والمواد الترويجية',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 16
          },
          {
            stepNumber: 5,
            title: 'الترتيبات اللوجستية',
            description: 'ترتيب الطعام والمواصلات والمعدات',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 16
          },
          {
            stepNumber: 6,
            title: 'التسويق والترويج',
            description: 'الترويج للفعالية عبر القنوات المختلفة',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 12
          },
          {
            stepNumber: 7,
            title: 'التنفيذ يوم الفعالية',
            description: 'إدارة الفعالية وضمان سير الأمور بسلاسة',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 8
          },
          {
            stepNumber: 8,
            title: 'التقييم والتقرير النهائي',
            description: 'تقييم النجاح وإعداد تقرير شامل',
            required: true,
            files: [],
            dependencies: [],
            estimatedHours: 8
          }
        ]
      }
    ];
  }
}

export const mandatoryWorkflow = new MandatoryWorkflowEngine();
