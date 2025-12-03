/**
 * 🛡️ CYBER SECURITY FRAMEWORK
 * نظام الأمن السيبراني الكامل للمنصة
 * 
 * الأهداف:
 * - حماية البيانات والأموال والسمعة
 * - منع التلاعب بالنقاط والإيرادات
 * - تتبع كل عملية حساسة
 * - اكتشاف الأنشطة المشبوهة
 */

// ====================================
// 1️⃣ نظام الهوية والأدوار
// ====================================

export enum UserRole {
  ADMIN = 'admin',           // المدير - صلاحيات كاملة
  SUPERVISOR = 'supervisor', // المشرف - فريقه فقط
  ACCOUNTANT = 'accountant', // المحاسب - المال فقط
  EMPLOYEE = 'employee',     // الموظف - بياناته فقط
  AI_SYSTEM = 'ai_system'    // نظام AI - الخلفية فقط
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  teamId?: string;              // للمشرفين والموظفين
  isActive: boolean;
  isTwoFactorEnabled: boolean;  // التحقق الثنائي
  lastLogin?: Date;
  createdAt: Date;
  createdBy: string;            // من أنشأ الحساب
  deactivatedAt?: Date;
  deactivatedBy?: string;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

// ====================================
// 2️⃣ نظام الصلاحيات (RBAC)
// ====================================

export enum Permission {
  // إدارة المستخدمين
  VIEW_ALL_USERS = 'view_all_users',
  CREATE_USER = 'create_user',
  EDIT_USER = 'edit_user',
  DELETE_USER = 'delete_user',
  MANAGE_ROLES = 'manage_roles',
  
  // إدارة الفريق
  VIEW_OWN_TEAM = 'view_own_team',
  VIEW_ALL_TEAMS = 'view_all_teams',
  EDIT_OWN_TEAM = 'edit_own_team',
  
  // البيانات المالية
  VIEW_OWN_REVENUE = 'view_own_revenue',
  VIEW_TEAM_REVENUE = 'view_team_revenue',
  VIEW_ALL_REVENUE = 'view_all_revenue',
  EDIT_OWN_REVENUE = 'edit_own_revenue',
  APPROVE_REVENUE = 'approve_revenue',
  DELETE_REVENUE = 'delete_revenue',
  
  // النقاط والمكافآت
  VIEW_OWN_POINTS = 'view_own_points',
  VIEW_TEAM_POINTS = 'view_team_points',
  VIEW_ALL_POINTS = 'view_all_points',
  ADJUST_POINTS = 'adjust_points',        // للمدير فقط
  MODIFY_POINT_RULES = 'modify_point_rules',
  
  // المشاريع والمهام
  VIEW_OWN_TASKS = 'view_own_tasks',
  VIEW_TEAM_TASKS = 'view_team_tasks',
  VIEW_ALL_TASKS = 'view_all_tasks',
  CREATE_TASK = 'create_task',
  ASSIGN_TASK = 'assign_task',
  DELETE_TASK = 'delete_task',
  
  // المتبرعين والمشاهير
  VIEW_OWN_DONORS = 'view_own_donors',
  VIEW_ALL_DONORS = 'view_all_donors',
  EDIT_DONOR = 'edit_donor',
  DELETE_DONOR = 'delete_donor',
  VIEW_SENSITIVE_DONOR_DATA = 'view_sensitive_donor_data',
  
  // التقارير والتحليلات
  VIEW_OWN_REPORTS = 'view_own_reports',
  VIEW_TEAM_REPORTS = 'view_team_reports',
  VIEW_ALL_REPORTS = 'view_all_reports',
  EXPORT_DATA = 'export_data',
  
  // إعدادات النظام
  VIEW_SYSTEM_SETTINGS = 'view_system_settings',
  EDIT_SYSTEM_SETTINGS = 'edit_system_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_BACKUPS = 'manage_backups'
}

// تعريف صلاحيات كل دور
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // المدير: كل الصلاحيات
    ...Object.values(Permission)
  ],
  
  [UserRole.SUPERVISOR]: [
    Permission.VIEW_OWN_TEAM,
    Permission.EDIT_OWN_TEAM,
    Permission.VIEW_TEAM_REVENUE,
    Permission.VIEW_TEAM_POINTS,
    Permission.VIEW_TEAM_TASKS,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.VIEW_TEAM_REPORTS,
    Permission.VIEW_OWN_REPORTS
  ],
  
  [UserRole.ACCOUNTANT]: [
    Permission.VIEW_ALL_REVENUE,
    Permission.APPROVE_REVENUE,
    Permission.VIEW_ALL_POINTS,
    Permission.VIEW_ALL_REPORTS,
    Permission.VIEW_ALL_DONORS,
    Permission.EXPORT_DATA
  ],
  
  [UserRole.EMPLOYEE]: [
    Permission.VIEW_OWN_REVENUE,
    Permission.EDIT_OWN_REVENUE,
    Permission.VIEW_OWN_POINTS,
    Permission.VIEW_OWN_TASKS,
    Permission.VIEW_OWN_DONORS,
    Permission.EDIT_DONOR,
    Permission.VIEW_OWN_REPORTS
  ],
  
  [UserRole.AI_SYSTEM]: [
    Permission.VIEW_ALL_TASKS,
    Permission.VIEW_ALL_REVENUE,
    Permission.VIEW_ALL_POINTS
  ]
};

// ====================================
// 3️⃣ نظام التدقيق (Audit Log)
// ====================================

export enum AuditAction {
  // المستخدمين
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_DEACTIVATED = 'user_deactivated',
  ROLE_CHANGED = 'role_changed',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  
  // الإيرادات
  REVENUE_CREATED = 'revenue_created',
  REVENUE_UPDATED = 'revenue_updated',
  REVENUE_DELETED = 'revenue_deleted',
  REVENUE_APPROVED = 'revenue_approved',
  
  // النقاط
  POINTS_CALCULATED = 'points_calculated',
  POINTS_ADJUSTED = 'points_adjusted',
  POINT_RULES_MODIFIED = 'point_rules_modified',
  
  // المهام والمشاريع
  TASK_CREATED = 'task_created',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  TASK_DELETED = 'task_deleted',
  PROJECT_CREATED = 'project_created',
  PROJECT_DELETED = 'project_deleted',
  
  // الإعدادات
  SETTINGS_CHANGED = 'settings_changed',
  GOAL_MODIFIED = 'goal_modified',
  ROI_MODIFIED = 'roi_modified',
  
  // أمنية
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  SUSPICIOUS_ACTIVITY_DETECTED = 'suspicious_activity_detected',
  DATA_EXPORT = 'data_export',
  BACKUP_CREATED = 'backup_created'
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userRole: UserRole;
  targetId?: string;              // ID العنصر المتأثر
  targetType?: string;            // نوع العنصر (user, revenue, task, etc.)
  changes?: {                     // التغييرات (قبل/بعد)
    before: any;
    after: any;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    [key: string]: any;
  };
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// ====================================
// 4️⃣ حماية منطق العمل
// ====================================

export interface BusinessLogicSecurity {
  // حدود النقاط
  maxDailyPoints: number;
  maxWeeklyPoints: number;
  maxMonthlyPoints: number;
  
  // حدود الإيرادات
  maxDailyRevenue: number;
  requireApprovalAbove: number;     // يتطلب موافقة المشرف فوق هذا المبلغ
  
  // قيود التعديل
  revenueEditWindowHours: number;   // فترة التعديل المسموحة
  requireSupervisorApprovalForEdit: boolean;
  
  // كشف التكرار
  duplicateDetectionEnabled: boolean;
  duplicateThresholdMinutes: number;
  
  // كشف الأنماط غير الطبيعية
  anomalyDetectionEnabled: boolean;
  anomalyThresholdMultiplier: number; // مثال: 3x المتوسط
}

export const DEFAULT_BUSINESS_SECURITY: BusinessLogicSecurity = {
  maxDailyPoints: 500,
  maxWeeklyPoints: 2000,
  maxMonthlyPoints: 8000,
  maxDailyRevenue: 50000,
  requireApprovalAbove: 10000,
  revenueEditWindowHours: 24,
  requireSupervisorApprovalForEdit: true,
  duplicateDetectionEnabled: true,
  duplicateThresholdMinutes: 5,
  anomalyDetectionEnabled: true,
  anomalyThresholdMultiplier: 3
};

// ====================================
// 5️⃣ كشف التهديدات
// ====================================

export enum ThreatType {
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_MANIPULATION = 'data_manipulation',
  UNUSUAL_ACTIVITY_PATTERN = 'unusual_activity_pattern',
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  SUSPICIOUS_DATA_ACCESS = 'suspicious_data_access',
  POINTS_MANIPULATION = 'points_manipulation',
  REVENUE_MANIPULATION = 'revenue_manipulation',
  UNAUTHORIZED_API_ACCESS = 'unauthorized_api_access'
}

export interface ThreatDetection {
  id: string;
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  description: string;
  indicators: string[];           // مؤشرات التهديد
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  actions: string[];              // الإجراءات المتخذة
}

// ====================================
// 6️⃣ محرك الأمن الرئيسي
// ====================================

export class SecurityFramework {
  private static instance: SecurityFramework;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private auditLogs: AuditLog[] = [];
  private threatDetections: ThreatDetection[] = [];
  private failedLoginAttempts: Map<string, number> = new Map();
  
  private constructor() {
    this.loadFromStorage();
  }
  
  static getInstance(): SecurityFramework {
    if (!this.instance) {
      this.instance = new SecurityFramework();
    }
    return this.instance;
  }
  
  // ============ إدارة الجلسة ============
  
  authenticate(user: User, password: string): { success: boolean; token?: string; error?: string } {
    // التحقق من محاولات الدخول الفاشلة
    const attempts = this.failedLoginAttempts.get(user.email) || 0;
    if (attempts >= 5) {
      this.logAudit({
        action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
        severity: AuditSeverity.CRITICAL,
        userId: user.id,
        userRole: user.role,
        timestamp: new Date(),
        success: false,
        errorMessage: 'Account locked due to multiple failed attempts'
      });
      
      return {
        success: false,
        error: 'الحساب مقفل بسبب محاولات دخول فاشلة متعددة. اتصل بالمدير.'
      };
    }
    
    // هنا يتم التحقق الفعلي من كلمة المرور (محاكاة)
    const isValid = this.verifyPassword(password, user.id);
    
    if (!isValid) {
      this.failedLoginAttempts.set(user.email, attempts + 1);
      this.logAudit({
        action: AuditAction.USER_LOGIN,
        severity: AuditSeverity.WARNING,
        userId: user.id,
        userRole: user.role,
        timestamp: new Date(),
        success: false,
        errorMessage: 'Invalid password'
      });
      
      return {
        success: false,
        error: 'كلمة المرور غير صحيحة'
      };
    }
    
    // نجاح الدخول
    this.failedLoginAttempts.delete(user.email);
    const token = this.generateToken();
    const session: Session = {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 ساعات
      lastActivity: new Date()
    };
    
    this.currentUser = user;
    this.currentSession = session;
    this.saveToStorage();
    
    this.logAudit({
      action: AuditAction.USER_LOGIN,
      severity: AuditSeverity.INFO,
      userId: user.id,
      userRole: user.role,
      timestamp: new Date(),
      success: true
    });
    
    return { success: true, token };
  }
  
  logout(): void {
    if (this.currentUser) {
      this.logAudit({
        action: AuditAction.USER_LOGOUT,
        severity: AuditSeverity.INFO,
        userId: this.currentUser.id,
        userRole: this.currentUser.role,
        timestamp: new Date(),
        success: true
      });
    }
    
    this.currentUser = null;
    this.currentSession = null;
    this.saveToStorage();
  }
  
  validateSession(): boolean {
    if (!this.currentSession || !this.currentUser) {
      return false;
    }
    
    // التحقق من انتهاء الصلاحية
    if (new Date() > this.currentSession.expiresAt) {
      this.logout();
      return false;
    }
    
    // التحقق من الخمول (15 دقيقة)
    const idleTime = Date.now() - this.currentSession.lastActivity.getTime();
    if (idleTime > 15 * 60 * 1000) {
      this.logout();
      return false;
    }
    
    // تحديث آخر نشاط
    this.currentSession.lastActivity = new Date();
    this.saveToStorage();
    
    return true;
  }
  
  // ============ الصلاحيات ============
  
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser || !this.validateSession()) {
      return false;
    }
    
    const permissions = ROLE_PERMISSIONS[this.currentUser.role];
    return permissions.includes(permission);
  }
  
  canAccessResource(resourceId: string, resourceType: 'user' | 'team' | 'revenue' | 'task'): boolean {
    if (!this.currentUser) return false;
    
    // المدير يصل لكل شيء
    if (this.currentUser.role === UserRole.ADMIN) return true;
    
    // المحاسب يصل لكل البيانات المالية
    if (this.currentUser.role === UserRole.ACCOUNTANT && 
        (resourceType === 'revenue' || resourceType === 'task')) {
      return true;
    }
    
    // المشرف يصل لفريقه فقط
    if (this.currentUser.role === UserRole.SUPERVISOR) {
      // هنا تحقق إذا كان الـ resource ينتمي لفريقه
      return this.isResourceInTeam(resourceId, resourceType, this.currentUser.teamId!);
    }
    
    // الموظف يصل لبياناته فقط
    if (this.currentUser.role === UserRole.EMPLOYEE) {
      return this.isResourceOwnedByUser(resourceId, resourceType, this.currentUser.id);
    }
    
    return false;
  }
  
  // ============ التدقيق ============
  
  logAudit(log: Omit<AuditLog, 'id'>): void {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...log
    };
    
    this.auditLogs.push(auditLog);
    
    // حفظ في localStorage
    const logs = this.auditLogs.slice(-1000); // آخر 1000 سجل فقط
    localStorage.setItem('security_audit_logs', JSON.stringify(logs));
    
    // إذا كانت العملية حرجة، تنبيه فوري
    if (log.severity === AuditSeverity.CRITICAL) {
      this.alertAdmins(auditLog);
    }
  }
  
  getAuditLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
  }): AuditLog[] {
    // التحقق من الصلاحية
    if (!this.hasPermission(Permission.VIEW_AUDIT_LOGS)) {
      this.logAudit({
        action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
        severity: AuditSeverity.WARNING,
        userId: this.currentUser?.id || 'unknown',
        userRole: this.currentUser?.role || UserRole.EMPLOYEE,
        timestamp: new Date(),
        success: false,
        errorMessage: 'Attempted to access audit logs without permission'
      });
      return [];
    }
    
    let logs = [...this.auditLogs];
    
    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.severity) {
        logs = logs.filter(log => log.severity === filters.severity);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // ============ كشف التهديدات ============
  
  detectThreats(): void {
    // كشف محاولات تسجيل الدخول المتعددة الفاشلة
    this.failedLoginAttempts.forEach((attempts, email) => {
      if (attempts >= 3) {
        this.recordThreat({
          type: ThreatType.MULTIPLE_FAILED_LOGINS,
          severity: attempts >= 5 ? 'critical' : 'high',
          description: `${attempts} محاولات دخول فاشلة للحساب: ${email}`,
          indicators: [`Email: ${email}`, `Attempts: ${attempts}`],
          timestamp: new Date(),
          resolved: false,
          actions: attempts >= 5 ? ['Account locked'] : ['Monitoring']
        });
      }
    });
    
    // كشف الأنماط غير الطبيعية في النقاط/الإيرادات
    this.detectAnomalies();
  }
  
  private detectAnomalies(): void {
    // محاكاة كشف الأنماط غير الطبيعية
    // في الواقع، هذا سيحلل البيانات الفعلية
    
    const recentAudits = this.auditLogs.filter(log => 
      log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
    );
    
    // كشف كثرة تعديل الإيرادات
    const revenueEdits = recentAudits.filter(log => 
      log.action === AuditAction.REVENUE_UPDATED
    );
    
    const editsByUser = new Map<string, number>();
    revenueEdits.forEach(log => {
      const count = editsByUser.get(log.userId) || 0;
      editsByUser.set(log.userId, count + 1);
    });
    
    editsByUser.forEach((count, userId) => {
      if (count > 10) { // أكثر من 10 تعديلات في 24 ساعة
        this.recordThreat({
          type: ThreatType.DATA_MANIPULATION,
          severity: 'high',
          userId,
          description: `نشاط غير طبيعي: ${count} تعديل إيراد في 24 ساعة`,
          indicators: [`User ID: ${userId}`, `Edit count: ${count}`],
          timestamp: new Date(),
          resolved: false,
          actions: ['Manual review required']
        });
      }
    });
  }
  
  private recordThreat(threat: Omit<ThreatDetection, 'id'>): void {
    const detection: ThreatDetection = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...threat
    };
    
    this.threatDetections.push(detection);
    localStorage.setItem('security_threats', JSON.stringify(this.threatDetections));
    
    // تسجيل في Audit Log
    this.logAudit({
      action: AuditAction.SUSPICIOUS_ACTIVITY_DETECTED,
      severity: AuditSeverity.CRITICAL,
      userId: threat.userId || 'system',
      userRole: UserRole.AI_SYSTEM,
      timestamp: new Date(),
      success: true,
      metadata: {
        threatType: threat.type,
        threatId: detection.id
      }
    });
  }
  
  getThreatDetections(resolved?: boolean): ThreatDetection[] {
    if (!this.hasPermission(Permission.VIEW_AUDIT_LOGS)) {
      return [];
    }
    
    if (resolved === undefined) {
      return [...this.threatDetections];
    }
    
    return this.threatDetections.filter(t => t.resolved === resolved);
  }
  
  // ============ حماية منطق العمل ============
  
  validateRevenueOperation(
    userId: string,
    amount: number,
    operation: 'create' | 'update' | 'delete'
  ): { valid: boolean; reason?: string; requiresApproval?: boolean } {
    const config = DEFAULT_BUSINESS_SECURITY;
    
    // التحقق من الحد اليومي
    const todayRevenue = this.getTodayRevenueForUser(userId);
    if (operation === 'create' && (todayRevenue + amount) > config.maxDailyRevenue) {
      return {
        valid: false,
        reason: `تجاوز الحد اليومي المسموح (${config.maxDailyRevenue} ريال)`
      };
    }
    
    // التحقق من الحاجة للموافقة
    if (amount > config.requireApprovalAbove) {
      return {
        valid: true,
        requiresApproval: true
      };
    }
    
    return { valid: true };
  }
  
  validatePointsOperation(
    userId: string,
    points: number,
    period: 'daily' | 'weekly' | 'monthly'
  ): { valid: boolean; reason?: string } {
    const config = DEFAULT_BUSINESS_SECURITY;
    const currentPoints = this.getPointsForUser(userId, period);
    
    let maxPoints: number;
    switch (period) {
      case 'daily':
        maxPoints = config.maxDailyPoints;
        break;
      case 'weekly':
        maxPoints = config.maxWeeklyPoints;
        break;
      case 'monthly':
        maxPoints = config.maxMonthlyPoints;
        break;
    }
    
    if (currentPoints + points > maxPoints) {
      return {
        valid: false,
        reason: `تجاوز حد النقاط ${period === 'daily' ? 'اليومي' : period === 'weekly' ? 'الأسبوعي' : 'الشهري'} (${maxPoints} نقطة)`
      };
    }
    
    return { valid: true };
  }
  
  // ============ مساعدات داخلية ============
  
  private verifyPassword(password: string, userId: string): boolean {
    // محاكاة - في الواقع يتحقق من hash
    return password.length >= 8;
  }
  
  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
  }
  
  private isResourceInTeam(resourceId: string, resourceType: string, teamId: string): boolean {
    // محاكاة - في الواقع يستعلم من قاعدة البيانات
    return true;
  }
  
  private isResourceOwnedByUser(resourceId: string, resourceType: string, userId: string): boolean {
    // محاكاة - في الواقع يستعلم من قاعدة البيانات
    return true;
  }
  
  private getTodayRevenueForUser(userId: string): number {
    // محاكاة - في الواقع يحسب من قاعدة البيانات
    return 0;
  }
  
  private getPointsForUser(userId: string, period: string): number {
    // محاكاة - في الواقع يحسب من قاعدة البيانات
    return 0;
  }
  
  private alertAdmins(log: AuditLog): void {
    // محاكاة - في الواقع يرسل إشعارات
    console.warn('🚨 CRITICAL SECURITY EVENT:', log);
  }
  
  private loadFromStorage(): void {
    try {
      const logsData = localStorage.getItem('security_audit_logs');
      if (logsData) {
        this.auditLogs = JSON.parse(logsData);
      }
      
      const threatsData = localStorage.getItem('security_threats');
      if (threatsData) {
        this.threatDetections = JSON.parse(threatsData);
      }
      
      const sessionData = localStorage.getItem('security_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        this.currentSession = {
          ...session,
          expiresAt: new Date(session.expiresAt),
          lastActivity: new Date(session.lastActivity)
        };
      }
      
      const userData = localStorage.getItem('security_current_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  }
  
  private saveToStorage(): void {
    try {
      if (this.currentSession) {
        localStorage.setItem('security_session', JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem('security_session');
      }
      
      if (this.currentUser) {
        localStorage.setItem('security_current_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('security_current_user');
      }
    } catch (error) {
      console.error('Error saving security data:', error);
    }
  }
  
  // ============ API عامة ============
  
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  isAuthenticated(): boolean {
    return this.validateSession();
  }
  
  getCurrentRole(): UserRole | null {
    return this.currentUser?.role || null;
  }
}

// تصدير instance واحد
export const securityFramework = SecurityFramework.getInstance();
