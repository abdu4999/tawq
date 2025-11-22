export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  teamMembers: string[]; // User IDs
  supervisorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string; // Added missing field
  title: string;
  description: string;
  assignedTo: string; // User ID
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  revenue?: number;
  expenses?: number;
  files?: string[];
  notes?: string;
  challenges?: string[];
  createdAt: string;
  updatedAt: string;
}

export class ProjectStorage {
  private static readonly PROJECTS_KEY = 'charity_projects';
  private static readonly TASKS_KEY = 'charity_tasks';

  static getProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getTasks(): Task[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveProjects(projects: Project[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
  }

  static saveTasks(tasks: Task[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  static createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: `project_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveProjects(projects);
    return projects[index];
  }

  static createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveTasks(tasks);
    return tasks[index];
  }

  static updateTaskStatus(id: string, status: Task['status']): Task | null {
    return this.updateTask(id, { status });
  }

  static deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    tasks.splice(index, 1);
    this.saveTasks(tasks);
    return true;
  }

  static getProjectTasks(projectId: string): Task[] {
    const tasks = this.getTasks();
    return tasks.filter(task => task.projectId === projectId);
  }

  static getUserTasks(userId: string): Task[] {
    const tasks = this.getTasks();
    return tasks.filter(task => task.assignedTo === userId);
  }

  static getSupervisorProjects(supervisorId: string): Project[] {
    const projects = this.getProjects();
    return projects.filter(project => project.supervisorId === supervisorId);
  }

  // Initialize with sample data
  static initializeSampleData(): void {
    const existingProjects = this.getProjects();
    if (existingProjects.length === 0) {
      const sampleProjects: Project[] = [
        {
          id: 'project_1',
          name: 'حملة تبرعات رمضان',
          description: 'حملة لجمع التبرعات خلال شهر رمضان المبارك',
          startDate: '2024-03-01',
          endDate: '2024-04-30',
          budget: 50000,
          status: 'active',
          teamMembers: ['4'],
          supervisorId: '3',
          createdAt: '2024-02-15',
          updatedAt: '2024-02-15'
        },
        {
          id: 'project_2',
          name: 'برنامج كفالة الأيتام',
          description: 'برنامج كفالة الأيتام وتوفير الرعاية الشاملة',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          budget: 200000,
          status: 'active',
          teamMembers: ['4'],
          supervisorId: '3',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
      this.saveProjects(sampleProjects);
    }

    const existingTasks = this.getTasks();
    if (existingTasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: 'task_1',
          projectId: 'project_1',
          projectName: 'حملة تبرعات رمضان',
          title: 'التواصل مع 150 متبرع محتمل',
          description: 'الاتصال والتراسل مع المتبرعين المحتملين لحملة رمضان',
          assignedTo: '4',
          priority: 'high',
          status: 'in-progress',
          dueDate: '2024-03-15',
          estimatedHours: 40,
          revenue: 25000,
          expenses: 500,
          createdAt: '2024-02-15',
          updatedAt: '2024-02-15'
        },
        {
          id: 'task_2',
          projectId: 'project_1',
          projectName: 'حملة تبرعات رمضان',
          title: 'إعداد نشرات إعلانية',
          description: 'تصميم وإعداد النشرات الإعلانية للحملة',
          assignedTo: '4',
          priority: 'medium',
          status: 'pending',
          dueDate: '2024-03-10',
          estimatedHours: 20,
          createdAt: '2024-02-15',
          updatedAt: '2024-02-15'
        },
        {
          id: 'task_3',
          projectId: 'project_2',
          projectName: 'برنامج كفالة الأيتام',
          title: 'متابعة كفالات الأيتام',
          description: 'متابعة حالات الأيتام وتقديم التقارير الدورية',
          assignedTo: '4',
          priority: 'high',
          status: 'completed',
          dueDate: '2024-02-28',
          estimatedHours: 30,
          actualHours: 35,
          revenue: 15000,
          expenses: 200,
          createdAt: '2024-01-15',
          updatedAt: '2024-02-28'
        }
      ];
      this.saveTasks(sampleTasks);
    }
  }
}