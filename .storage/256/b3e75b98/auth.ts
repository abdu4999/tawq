export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'accountant' | 'supervisor' | 'employee';
  phone: string;
  createdAt: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  phone: string;
  otp?: string;
}

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@charity.org',
    name: 'المدير العام',
    role: 'admin',
    phone: '+966500000001',
    createdAt: '2024-01-01',
    isActive: true
  },
  {
    id: '2',
    email: 'accountant@charity.org',
    name: 'المحاسب أحمد',
    role: 'accountant',
    phone: '+966500000002',
    createdAt: '2024-01-01',
    isActive: true
  },
  {
    id: '3',
    email: 'supervisor@charity.org',
    name: 'المشرف محمد',
    role: 'supervisor',
    phone: '+966500000003',
    createdAt: '2024-01-01',
    isActive: true
  },
  {
    id: '4',
    email: 'employee@charity.org',
    name: 'الموظف خالد',
    role: 'employee',
    phone: '+966500000004',
    createdAt: '2024-01-01',
    isActive: true
  }
];

export class AuthService {
  private static currentUser: User | null = null;
  private static isAuthenticated = false;

  static async login(credentials: LoginCredentials): Promise<User | null> {
    // Simulate OTP verification
    if (!credentials.otp) {
      // In real implementation, send OTP to phone/email
      return null;
    }

    // Mock authentication - in real app, verify with backend
    const user = mockUsers.find(u => 
      u.email === credentials.email && 
      u.phone === credentials.phone
    );

    if (user && credentials.otp === '123456') { // Mock OTP
      this.currentUser = user;
      this.isAuthenticated = true;
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      return user;
    }

    return null;
  }

  static async logout(): Promise<void> {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  }

  static getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.isAuthenticated = true;
      }
    }
    return this.currentUser;
  }

  static isLoggedIn(): boolean {
    if (!this.isAuthenticated) {
      this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    }
    return this.isAuthenticated;
  }

  static hasPermission(requiredRole: User['role']): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      admin: 4,
      accountant: 3,
      supervisor: 2,
      employee: 1
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  static canAccess(module: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissions = {
      admin: ['dashboard', 'projects', 'tasks', 'finance', 'leaderboard', 'reports', 'admin'],
      accountant: ['dashboard', 'finance', 'reports'],
      supervisor: ['dashboard', 'projects', 'tasks', 'reports'],
      employee: ['dashboard', 'tasks', 'leaderboard']
    };

    return permissions[user.role].includes(module);
  }
}