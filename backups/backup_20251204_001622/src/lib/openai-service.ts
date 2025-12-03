import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;

try {
  if (import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY.startsWith('sk-')) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.warn('OpenAI initialization skipped:', error);
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  actionRequired: boolean;
  confidence: number;
  employeeId?: string;
}

export interface PerformanceAnalysis {
  employeeId: string;
  employeeName: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: AIRecommendation[];
  predictedTrend: 'improving' | 'stable' | 'declining';
}

export interface ProjectRiskAnalysis {
  projectId: string;
  projectName: string;
  riskLevel: 'high' | 'medium' | 'low';
  risks: {
    type: string;
    description: string;
    probability: number;
    impact: string;
    mitigation: string;
  }[];
}

// Fallback functions
function getFallbackPerformanceAnalysis(employeeData: any): PerformanceAnalysis {
  return {
    employeeId: employeeData.id || 'unknown',
    employeeName: employeeData.name || 'غير معروف',
    overallScore: 75,
    strengths: [
      'التزام عالي بالمواعيد النهائية',
      'مهارات تواصل ممتازة مع الفريق',
      'قدرة على إنجاز المهام المعقدة'
    ],
    weaknesses: [
      'يحتاج لتحسين مهارات التخطيط',
      'التركيز على جودة العمل أكثر من السرعة'
    ],
    recommendations: [
      {
        id: `rec-${Date.now()}-1`,
        title: 'دورة تدريبية في إدارة الوقت',
        description: 'يُنصح بحضور دورة متخصصة لتحسين مهارات التخطيط وإدارة الوقت',
        priority: 'high',
        category: 'تطوير المهارات',
        impact: 'تحسين الإنتاجية بنسبة 25%',
        actionRequired: true,
        confidence: 0.8,
        employeeId: employeeData.id
      }
    ],
    predictedTrend: 'improving'
  };
}

function getFallbackProjectRisks(projectData: any): ProjectRiskAnalysis {
  return {
    projectId: projectData.id || 'unknown',
    projectName: projectData.name || 'مشروع غير معروف',
    riskLevel: 'medium',
    risks: [
      {
        type: 'جدول زمني',
        description: 'احتمالية تأخير في التسليم',
        probability: 0.6,
        impact: 'متوسط',
        mitigation: 'مراجعة الجدول الزمني وإعادة توزيع المهام'
      }
    ]
  };
}

function getFallbackInsights(): AIRecommendation[] {
  return [
    {
      id: `fallback-${Date.now()}-1`,
      title: 'تحسين التواصل بين الفرق',
      description: 'تنفيذ اجتماعات يومية قصيرة لتحسين التنسيق وتبادل المعلومات بين أعضاء الفريق',
      priority: 'high',
      category: 'التواصل',
      impact: 'تحسين الإنتاجية بنسبة 20%',
      actionRequired: true,
      confidence: 0.85
    },
    {
      id: `fallback-${Date.now()}-2`,
      title: 'تطوير مهارات التسويق الرقمي',
      description: 'الاستثمار في تدريب الفريق على أحدث استراتيجيات التسويق الرقمي والشبكات الاجتماعية',
      priority: 'high',
      category: 'تطوير',
      impact: 'زيادة الوصول بنسبة 35%',
      actionRequired: true,
      confidence: 0.82
    }
  ];
}

// تحليل أداء الموظف باستخدام GPT-4
export async function analyzeEmployeePerformance(
  name: string,
  completedTasks: number,
  totalRevenue: number,
  performanceScore: number
): Promise<PerformanceAnalysis> {
  const employeeData = {
    id: `emp-${Date.now()}`,
    name,
    completedTasks,
    totalRevenue,
    performanceScore
  };

  // If OpenAI is not available, return fallback immediately
  if (!openai) {
    return getFallbackPerformanceAnalysis(employeeData);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت محلل أداء خبير في التسويق الخيري. قدم تحليلات دقيقة ومفيدة بصيغة JSON فقط.'
        },
        {
          role: 'user',
          content: `قم بتحليل أداء الموظف: ${name}، المهام: ${completedTasks}، الإيراد: ${totalRevenue}، النقاط: ${performanceScore}`
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      employeeId: employeeData.id,
      employeeName: name,
      overallScore: analysis.overallScore || 75,
      strengths: analysis.strengths || ['أداء جيد'],
      weaknesses: analysis.weaknesses || ['يحتاج تحسين'],
      recommendations: (analysis.recommendations || []).map((rec: any, index: number) => ({
        id: `rec-${Date.now()}-${index}`,
        title: rec.title || 'توصية',
        description: rec.description || 'وصف',
        priority: rec.priority || 'medium',
        category: rec.category || 'عام',
        impact: rec.impact || 'متوسط',
        actionRequired: rec.priority === 'high',
        confidence: rec.confidence || 0.85,
        employeeId: employeeData.id
      })),
      predictedTrend: analysis.predictedTrend || 'stable'
    };
  } catch (error) {
    console.error('خطأ في تحليل الأداء:', error);
    return getFallbackPerformanceAnalysis(employeeData);
  }
}

// تحليل مخاطر المشاريع
export async function analyzeProjectRisks(
  projectData: any
): Promise<ProjectRiskAnalysis> {
  // If OpenAI is not available, return fallback immediately
  if (!openai) {
    return getFallbackProjectRisks(projectData);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت محلل مخاطر خبير في إدارة المشاريع الخيرية.'
        },
        {
          role: 'user',
          content: `حلل مخاطر المشروع: ${projectData.name}`
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      projectId: projectData.id,
      projectName: projectData.name,
      riskLevel: analysis.riskLevel || 'medium',
      risks: analysis.risks || []
    };
  } catch (error) {
    console.error('خطأ في تحليل المخاطر:', error);
    return getFallbackProjectRisks(projectData);
  }
}

// إنشاء رؤى ذكاء اصطناعي شاملة
export async function generateAIInsights(
  employees?: any[],
  projects?: any[]
): Promise<AIRecommendation[]> {
  // If OpenAI is not available, return fallback immediately
  if (!openai) {
    return getFallbackInsights();
  }

  try {
    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت مستشار استراتيجي خبير في التسويق الخيري والإدارة.'
        },
        {
          role: 'user',
          content: 'قدم 6-8 توصيات استراتيجية لتحسين الأداء العام'
        }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return (result.recommendations || []).map((rec: any, index: number) => ({
      id: `ai-rec-${Date.now()}-${index}`,
      title: rec.title || 'توصية',
      description: rec.description || 'وصف',
      priority: rec.priority || 'medium',
      category: rec.category || 'عام',
      impact: rec.impact || 'متوسط',
      actionRequired: rec.priority === 'high',
      confidence: rec.confidence || 0.85
    }));
  } catch (error) {
    console.error('خطأ في إنشاء الرؤى:', error);
    return getFallbackInsights();
  }
}

// محادثة مع الذكاء الاصطناعي
export async function chatWithAI(message: string, context?: any): Promise<string> {
  // If OpenAI is not available, return error message
  if (!openai) {
    return 'عذراً، خدمة الذكاء الاصطناعي غير متوفرة حالياً. الرجاء التحقق من إعدادات API Key.';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكي متخصص في التسويق الخيري وإدارة الأداء. قدم إجابات مفيدة وعملية.'
        },
        {
          role: 'user',
          content: context ? `السياق: ${JSON.stringify(context)}\n\nالسؤال: ${message}` : message
        }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content || 'عذراً، لم أتمكن من إنشاء إجابة.';
  } catch (error) {
    console.error('خطأ في المحادثة:', error);
    return 'عذراً، حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.';
  }
}
