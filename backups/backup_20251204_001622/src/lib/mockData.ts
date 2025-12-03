import { Employee, Task, Project, Celebrity, Reward, Challenge, Transaction, TrainingProgram, Team } from './types';

// Mock employees data
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'أحمد محمد الأحمد',
    email: 'ahmed@company.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    department: 'الإدارة العامة',
    phone: '+966501234567',
    hire_date: '2023-01-15',
    salary: 15000,
    performance_score: 92,
    points: 1250,
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'فاطمة سالم العتيبي',
    email: 'fatima@company.com',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    department: 'التسويق',
    phone: '+966507654321',
    hire_date: '2023-02-01',
    salary: 8000,
    performance_score: 88,
    points: 950,
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'محمد خالد الغامدي',
    email: 'mohammed@company.com',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'المشاهير',
    phone: '+966509876543',
    hire_date: '2023-03-01',
    salary: 9000,
    performance_score: 85,
    points: 780,
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'نورا علي الشهري',
    email: 'nora@company.com',
    role: 'hr',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    department: 'الموارد البشرية',
    phone: '+966502468135',
    hire_date: '2023-04-01',
    salary: 10000,
    performance_score: 90,
    points: 1100,
    created_at: '2023-04-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Mock projects data
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'حملة رمضان الخيرية',
    description: 'حملة شاملة لجمع التبرعات خلال شهر رمضان المبارك',
    status: 'active',
    progress: 75,
    budget: 500000,
    deadline: new Date('2024-04-10'),
    managerId: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'مشروع كسوة الشتاء',
    description: 'توزيع الملابس الشتوية للمحتاجين',
    status: 'active',
    progress: 45,
    budget: 200000,
    deadline: new Date('2024-03-01'),
    managerId: '2',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Mock tasks data
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'إعداد خطة التسويق الرقمي',
    description: 'وضع استراتيجية شاملة للتسويق عبر وسائل التواصل الاجتماعي',
    status: 'in_progress',
    priority: 'high',
    assigneeId: '2',
    projectId: '1',
    deadline: new Date('2024-02-15'),
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'التواصل مع المؤثرين',
    description: 'البحث عن مؤثرين مناسبين للحملة والتواصل معهم',
    status: 'pending',
    priority: 'medium',
    assigneeId: '3',
    projectId: '1',
    deadline: new Date('2024-02-20'),
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    title: 'تحضير المواد الإعلامية',
    description: 'إنشاء الفيديوهات والصور للحملة',
    status: 'completed',
    priority: 'high',
    assigneeId: '2',
    projectId: '2',
    deadline: new Date('2024-01-30'),
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Mock transactions data
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 50000,
    category: 'تبرعات',
    description: 'تبرع من أحد المحسنين للحملة الخيرية',
    date: new Date('2024-01-10'),
    status: 'approved',
    projectId: '1',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    type: 'expense',
    amount: 15000,
    category: 'تسويق',
    description: 'تكاليف الإعلانات على وسائل التواصل الاجتماعي',
    date: new Date('2024-01-12'),
    status: 'approved',
    projectId: '1',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    type: 'income',
    amount: 25000,
    category: 'شراكات',
    description: 'دعم من إحدى الشركات الراعية',
    date: new Date('2024-01-14'),
    status: 'pending',
    created_at: '2024-01-14T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Mock celebrities data
export const mockCelebrities: Celebrity[] = [
  {
    id: '1',
    name: 'عبدالله الشهري',
    category: 'sports',
    followers_count: 2500000,
    engagement_rate: 8.5,
    contact_info: 'abdullah@management.com',
    status: 'active',
    collaboration_history: ['حملة رمضان 2023', 'مشروع الإفطار الجماعي'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'سارة أحمد',
    category: 'entertainment',
    followers_count: 1800000,
    engagement_rate: 12.3,
    contact_info: 'sara@agency.com',
    status: 'potential',
    collaboration_history: [],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Mock rewards data
export const mockRewards: Reward[] = [];

// Mock challenges data
export const mockChallenges: Challenge[] = [];

// Mock training programs data
export const mockTrainingPrograms: TrainingProgram[] = [];

// Mock teams data
export const mockTeams: Team[] = [];