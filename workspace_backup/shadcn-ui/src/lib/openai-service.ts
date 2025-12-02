import OpenAI from 'openai';

// تهيئة OpenAI Client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // للاستخدام في المتصفح فقط للتطوير
});

export interface AIAnalysisRequest {
  tasks: any[];
  employees: any[];
  projects?: any[];
  context?: string;
}

export interface AIRecommendation {
  type: 'performance' | 'task' | 'team' | 'risk';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
  confidence: number; // مستوى الثقة 0-1
  actionRequired?: boolean;
  employeeId?: string;
}

/**
 * تحليل أداء الموظف باستخدام GPT-4
 */
export async function analyzeEmployeePerformance(
  employee: any,
  tasks: any[]
): Promise<AIRecommendation[]> {
  try {
    const prompt = `
أنت مستشار موارد بشرية خبير. قم بتحليل أداء الموظف التالي وقدم توصيات:

معلومات الموظف:
- الاسم: ${employee.name || employee.email}
- عدد المهام المكتملة: ${tasks.filter(t => t.status === 'completed' && t.assigned_to === employee.id).length}
- عدد المهام النشطة: ${tasks.filter(t => t.status !== 'completed' && t.assigned_to === employee.id).length}

قدم 3 توصيات محددة بصيغة JSON بالشكل التالي:
[
  {
    "type": "performance",
    "priority": "high",
    "title": "عنوان التوصية",
    "description": "وصف مفصل",
    "action": "الإجراء المطلوب",
    "impact": "الأثر المتوقع"
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت مستشار موارد بشرية خبير متخصص في تحليل الأداء وتقديم التوصيات بالعربية.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    const recommendations = JSON.parse(response || '[]');
    
    // إضافة confidence و actionRequired للتوصيات
    const processedRecommendations = (Array.isArray(recommendations) ? recommendations : recommendations.recommendations || [])
      .map((rec: any) => ({
        ...rec,
        confidence: 0.85, // OpenAI عادة دقيق بنسبة 85%+
        actionRequired: rec.priority === 'high',
        employeeId: employee.id
      }));
    
    return processedRecommendations;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return generateFallbackRecommendations(employee, tasks);
  }
}

/**
 * تحليل المخاطر في المشروع
 */
export async function analyzeProjectRisks(
  project: any,
  tasks: any[],
  team: any[]
): Promise<{ risks: string[]; suggestions: string[] }> {
  try {
    const projectTasks = tasks.filter(t => t.project_id === project.id);
    const completedTasks = projectTasks.filter(t => t.status === 'completed');
    const progress = (completedTasks.length / projectTasks.length) * 100;

    const prompt = `
قم بتحليل المخاطر للمشروع التالي:

اسم المشروع: ${project.name}
التقدم: ${progress.toFixed(0)}%
عدد المهام: ${projectTasks.length}
عدد الفريق: ${team.length}

قدم تحليل بصيغة JSON:
{
  "risks": ["خطر 1", "خطر 2", "خطر 3"],
  "suggestions": ["اقتراح 1", "اقتراح 2", "اقتراح 3"]
}
`;

    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت خبير إدارة مشاريع متخصص في تحليل المخاطر بالعربية.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{"risks":[],"suggestions":[]}');
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      risks: ['تأخر محتمل في الجدول الزمني', 'نقص في الموارد'],
      suggestions: ['زيادة التواصل مع الفريق', 'مراجعة الأولويات']
    };
  }
}

/**
 * توليد رؤى ذكية شاملة
 */
export async function generateAIInsights(data: AIAnalysisRequest): Promise<any> {
  try {
    const { tasks, employees, projects = [], context = '' } = data;

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const avgCompletionRate = (completedTasks.length / tasks.length) * 100;

    const prompt = `
أنت نظام ذكاء اصطناعي متقدم لتحليل أداء الفرق والمشاريع. قم بتحليل البيانات التالية:

📊 الإحصائيات:
- إجمالي المهام: ${tasks.length}
- المهام المكتملة: ${completedTasks.length}
- معدل الإنجاز: ${avgCompletionRate.toFixed(0)}%
- عدد الموظفين: ${employees.length}
- عدد المشاريع: ${projects.length}

${context}

قدم تحليل شامل بصيغة JSON:
{
  "overall_performance": "ممتاز/جيد/متوسط/ضعيف",
  "performance_score": 85,
  "key_insights": ["رؤية 1", "رؤية 2", "رؤية 3"],
  "recommendations": [
    {
      "category": "أداء/كفاءة/تحفيز",
      "priority": "عالية/متوسطة/منخفضة",
      "title": "عنوان",
      "description": "وصف",
      "expected_impact": "التأثير المتوقع"
    }
  ],
  "predictions": {
    "next_month_completion": 85,
    "risk_level": "منخفض/متوسط/عالي",
    "bottlenecks": ["عنق زجاجة 1", "عنق زجاجة 2"]
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت نظام ذكاء اصطناعي متقدم لتحليل الأعمال والموارد البشرية بالعربية.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return generateFallbackInsights(data);
  }
}

/**
 * الدردشة التفاعلية مع الذكاء الاصطناعي
 */
export async function chatWithAI(
  message: string,
  context: any = {}
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكي متخصص في إدارة المشاريع والموارد البشرية. تجيب بالعربية بشكل احترافي ومفيد.'
        },
        {
          role: 'user',
          content: `السياق: ${JSON.stringify(context)}\n\nالسؤال: ${message}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content || 'عذراً، لم أتمكن من معالجة طلبك.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.';
  }
}

// التوصيات الاحتياطية في حال فشل API
function generateFallbackRecommendations(employee: any, tasks: any[]): AIRecommendation[] {
  const employeeTasks = tasks.filter(t => t.assigned_to === employee.id);
  const completedTasks = employeeTasks.filter(t => t.status === 'completed');
  const completionRate = (completedTasks.length / employeeTasks.length) * 100;

  const recommendations: AIRecommendation[] = [];

  if (completionRate < 50) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'تحسين معدل إنجاز المهام',
      description: `معدل الإنجاز الحالي ${completionRate.toFixed(0)}% يحتاج إلى تحسين`,
      action: 'مراجعة المهام المعلقة وتحديد الأولويات',
      impact: 'زيادة الإنتاجية بنسبة 30%',
      confidence: 0.75,
      actionRequired: true,
      employeeId: employee.id
    });
  }

  if (employeeTasks.length > 10) {
    recommendations.push({
      type: 'task',
      priority: 'medium',
      title: 'إعادة توزيع المهام',
      description: 'عدد المهام المسندة كبير قد يؤثر على الجودة',
      action: 'توزيع بعض المهام على أعضاء آخرين في الفريق',
      impact: 'تحسين التركيز وجودة العمل',
      confidence: 0.80,
      actionRequired: false,
      employeeId: employee.id
    });
  }

  return recommendations;
}

function generateFallbackInsights(data: AIAnalysisRequest): any {
  const { tasks, employees } = data;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completionRate = (completedTasks.length / tasks.length) * 100;

  return {
    overall_performance: completionRate > 75 ? 'ممتاز' : completionRate > 50 ? 'جيد' : 'متوسط',
    performance_score: completionRate,
    key_insights: [
      `معدل إنجاز المهام: ${completionRate.toFixed(0)}%`,
      `عدد الموظفين النشطين: ${employees.length}`,
      'يوصى بتحسين التواصل بين الفريق'
    ],
    recommendations: generateFallbackRecommendations(employees[0], tasks),
    predictions: {
      next_month_completion: Math.min(completionRate + 10, 100),
      risk_level: completionRate < 50 ? 'عالي' : 'منخفض',
      bottlenecks: ['تأخر في بعض المهام', 'نقص في التواصل']
    }
  };
}

export const AIService = {
  analyzeEmployeePerformance,
  analyzeProjectRisks,
  generateAIInsights,
  chatWithAI
};

export default AIService;
