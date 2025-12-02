export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'accountant' | 'employee';
  avatar?: string;
  teamId?: string;
}

export interface Employee extends User {
  points: number;
  monthlyTarget: number;
  yearlyTarget: number;
  currentRevenue: number;
  tasksCompleted: number;
  rank: number;
  strengths: string[];
  weaknesses: string[];
  supervisorId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  projectId: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  revenue?: number;
  points: number;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  targetRevenue: number;
  currentRevenue: number;
  assignedEmployees: string[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused';
  storeLink?: string;
  influencerName?: string;
}

export interface Achievement {
  id: string;
  employeeId: string;
  type: 'task_completion' | 'revenue_target' | 'innovation' | 'teamwork';
  points: number;
  description: string;
  date: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'achievement' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
}