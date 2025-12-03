/**
 * 🔐 DATA PROTECTION & ENCRYPTION
 * نظام حماية البيانات والتشفير
 * 
 * الأهداف:
 * - تشفير البيانات الحساسة
 * - حماية بيانات المتبرعين والمشاهير
 * - تشفير الاتصالات
 * - إدارة النسخ الاحتياطية
 */

// ====================================
// 1️⃣ تشفير البيانات
// ====================================

export class DataEncryption {
  private static instance: DataEncryption;
  private encryptionKey: string;
  
  private constructor() {
    // في الواقع، هذا المفتاح يجب أن يكون من متغيرات البيئة
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }
  
  static getInstance(): DataEncryption {
    if (!this.instance) {
      this.instance = new DataEncryption();
    }
    return this.instance;
  }
  
  /**
   * تشفير نص
   * ملاحظة: هذا تنفيذ مبسط للتوضيح
   * في الإنتاج، استخدم مكتبات مثل crypto-js أو Web Crypto API
   */
  encrypt(plainText: string): string {
    try {
      // محاكاة التشفير - في الواقع استخدم AES-256
      const encrypted = btoa(plainText + '::' + this.encryptionKey);
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('فشل التشفير');
    }
  }
  
  /**
   * فك التشفير
   */
  decrypt(encryptedText: string): string {
    try {
      const decrypted = atob(encryptedText);
      const [plainText] = decrypted.split('::');
      return plainText;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('فشل فك التشفير');
    }
  }
  
  /**
   * تشفير كائن كامل
   */
  encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }
  
  /**
   * فك تشفير كائن
   */
  decryptObject<T>(encryptedString: string): T {
    const jsonString = this.decrypt(encryptedString);
    return JSON.parse(jsonString);
  }
  
  /**
   * تشفير hash لكلمة المرور
   * ملاحظة: استخدم bcrypt أو argon2 في الإنتاج
   */
  async hashPassword(password: string): Promise<string> {
    // محاكاة - في الواقع استخدم bcrypt
    const salt = Math.random().toString(36).substring(2, 15);
    const hash = btoa(password + salt);
    return `${hash}::${salt}`;
  }
  
  /**
   * التحقق من كلمة المرور
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [hash, salt] = hashedPassword.split('::');
      const testHash = btoa(password + salt);
      return hash === testHash;
    } catch (error) {
      return false;
    }
  }
  
  private getOrCreateEncryptionKey(): string {
    let key = localStorage.getItem('system_encryption_key');
    
    if (!key) {
      // توليد مفتاح جديد
      key = this.generateSecureKey();
      localStorage.setItem('system_encryption_key', key);
    }
    
    return key;
  }
  
  private generateSecureKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// ====================================
// 2️⃣ حماية البيانات الحساسة
// ====================================

export enum DataSensitivityLevel {
  PUBLIC = 'public',           // بيانات عامة
  INTERNAL = 'internal',       // بيانات داخلية
  CONFIDENTIAL = 'confidential', // بيانات سرية
  RESTRICTED = 'restricted'    // بيانات محظورة
}

export interface SensitiveField {
  fieldName: string;
  sensitivity: DataSensitivityLevel;
  encrypted: boolean;
  accessLog: boolean;          // تسجيل كل وصول
  maskInUI: boolean;           // إخفاء في الواجهة
}

// تعريف الحقول الحساسة في النظام
export const SENSITIVE_FIELDS: Record<string, SensitiveField[]> = {
  donor: [
    {
      fieldName: 'phone',
      sensitivity: DataSensitivityLevel.CONFIDENTIAL,
      encrypted: true,
      accessLog: true,
      maskInUI: true
    },
    {
      fieldName: 'email',
      sensitivity: DataSensitivityLevel.CONFIDENTIAL,
      encrypted: true,
      accessLog: true,
      maskInUI: true
    },
    {
      fieldName: 'address',
      sensitivity: DataSensitivityLevel.CONFIDENTIAL,
      encrypted: true,
      accessLog: false,
      maskInUI: false
    },
    {
      fieldName: 'medicalCondition',
      sensitivity: DataSensitivityLevel.RESTRICTED,
      encrypted: true,
      accessLog: true,
      maskInUI: true
    }
  ],
  
  influencer: [
    {
      fieldName: 'contractDetails',
      sensitivity: DataSensitivityLevel.RESTRICTED,
      encrypted: true,
      accessLog: true,
      maskInUI: false
    },
    {
      fieldName: 'paymentInfo',
      sensitivity: DataSensitivityLevel.RESTRICTED,
      encrypted: true,
      accessLog: true,
      maskInUI: true
    },
    {
      fieldName: 'commissionRate',
      sensitivity: DataSensitivityLevel.CONFIDENTIAL,
      encrypted: true,
      accessLog: true,
      maskInUI: false
    }
  ],
  
  employee: [
    {
      fieldName: 'salary',
      sensitivity: DataSensitivityLevel.RESTRICTED,
      encrypted: true,
      accessLog: true,
      maskInUI: true
    },
    {
      fieldName: 'nationalId',
      sensitivity: DataSensitivityLevel.RESTRICTED,
      encrypted: true,
      accessLog: true,
      maskInUI: true
    },
    {
      fieldName: 'bankAccount',
      sensitivity: DataSensitivityLevel.RESTRICTED,
      encrypted: true,
      accessLog: true,
      maskInUI: true
    }
  ],
  
  revenue: [
    {
      fieldName: 'amount',
      sensitivity: DataSensitivityLevel.CONFIDENTIAL,
      encrypted: false,
      accessLog: true,
      maskInUI: false
    },
    {
      fieldName: 'paymentMethod',
      sensitivity: DataSensitivityLevel.CONFIDENTIAL,
      encrypted: true,
      accessLog: true,
      maskInUI: false
    }
  ]
};

// ====================================
// 3️⃣ محرك حماية البيانات
// ====================================

export class DataProtection {
  private static instance: DataProtection;
  private encryption: DataEncryption;
  
  private constructor() {
    this.encryption = DataEncryption.getInstance();
  }
  
  static getInstance(): DataProtection {
    if (!this.instance) {
      this.instance = new DataProtection();
    }
    return this.instance;
  }
  
  /**
   * حماية كائن بتشفير الحقول الحساسة
   */
  protectObject<T extends Record<string, any>>(
    obj: T,
    entityType: keyof typeof SENSITIVE_FIELDS
  ): T {
    const sensitiveFields = SENSITIVE_FIELDS[entityType];
    if (!sensitiveFields) return obj;
    
    const protected_obj = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (field.encrypted && protected_obj[field.fieldName]) {
        const value = protected_obj[field.fieldName];
        protected_obj[field.fieldName] = this.encryption.encrypt(String(value));
      }
    });
    
    return protected_obj;
  }
  
  /**
   * فك حماية كائن
   */
  unprotectObject<T extends Record<string, any>>(
    obj: T,
    entityType: keyof typeof SENSITIVE_FIELDS
  ): T {
    const sensitiveFields = SENSITIVE_FIELDS[entityType];
    if (!sensitiveFields) return obj;
    
    const unprotected_obj = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (field.encrypted && unprotected_obj[field.fieldName]) {
        try {
          const value = unprotected_obj[field.fieldName];
          unprotected_obj[field.fieldName] = this.encryption.decrypt(String(value));
        } catch (error) {
          console.error(`Failed to decrypt field ${field.fieldName}:`, error);
        }
      }
    });
    
    return unprotected_obj;
  }
  
  /**
   * إخفاء البيانات الحساسة في الواجهة
   */
  maskSensitiveData<T extends Record<string, any>>(
    obj: T,
    entityType: keyof typeof SENSITIVE_FIELDS
  ): T {
    const sensitiveFields = SENSITIVE_FIELDS[entityType];
    if (!sensitiveFields) return obj;
    
    const masked_obj = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (field.maskInUI && masked_obj[field.fieldName]) {
        const value = String(masked_obj[field.fieldName]);
        
        // إخفاء حسب نوع البيانات
        if (field.fieldName.includes('phone')) {
          masked_obj[field.fieldName] = this.maskPhone(value);
        } else if (field.fieldName.includes('email')) {
          masked_obj[field.fieldName] = this.maskEmail(value);
        } else if (field.fieldName.includes('id') || field.fieldName.includes('account')) {
          masked_obj[field.fieldName] = this.maskId(value);
        } else {
          masked_obj[field.fieldName] = '***';
        }
      }
    });
    
    return masked_obj;
  }
  
  /**
   * التحقق من إمكانية الوصول للبيانات الحساسة
   */
  canAccessSensitiveField(
    fieldName: string,
    entityType: keyof typeof SENSITIVE_FIELDS,
    userRole: string
  ): boolean {
    const sensitiveFields = SENSITIVE_FIELDS[entityType];
    if (!sensitiveFields) return true;
    
    const field = sensitiveFields.find(f => f.fieldName === fieldName);
    if (!field) return true;
    
    // القواعد حسب الحساسية والدور
    switch (field.sensitivity) {
      case DataSensitivityLevel.RESTRICTED:
        return userRole === 'admin';
      
      case DataSensitivityLevel.CONFIDENTIAL:
        return userRole === 'admin' || userRole === 'accountant';
      
      case DataSensitivityLevel.INTERNAL:
        return userRole !== 'employee';
      
      case DataSensitivityLevel.PUBLIC:
      default:
        return true;
    }
  }
  
  // مساعدات الإخفاء
  
  private maskPhone(phone: string): string {
    // مثال: 0501234567 → 050***4567
    if (phone.length < 4) return '***';
    return phone.slice(0, 3) + '***' + phone.slice(-4);
  }
  
  private maskEmail(email: string): string {
    // مثال: user@example.com → u***@example.com
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    return local.charAt(0) + '***@' + domain;
  }
  
  private maskId(id: string): string {
    // مثال: 1234567890 → 123***890
    if (id.length < 6) return '***';
    return id.slice(0, 3) + '***' + id.slice(-3);
  }
}

// ====================================
// 4️⃣ نظام النسخ الاحتياطي
// ====================================

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number;
  encrypted: boolean;
  createdBy: string;
  location: string;
  checksum: string;
  fileName: string;
}

export class BackupManager {
  private static instance: BackupManager;
  private backups: BackupMetadata[] = [];
  private encryption: DataEncryption;
  private backupBasePath: string;
  
  private constructor() {
    this.encryption = DataEncryption.getInstance();
    // استخدام المسار الفعلي للمشروع
    this.backupBasePath = this.getProjectBasePath();
    this.ensureBackupDirectory();
    this.loadBackups();
  }
  
  /**
   * الحصول على المسار الأساسي للمشروع
   */
  private getProjectBasePath(): string {
    // في بيئة المتصفح، نستخدم IndexedDB أو localStorage
    // في بيئة Node.js، نستخدم المسار الفعلي
    if (typeof window !== 'undefined') {
      // بيئة المتصفح - نستخدم IndexedDB
      return 'indexeddb://backups';
    }
    
    // بيئة Node.js - نستخدم المسار الحقيقي
    const currentPath = typeof process !== 'undefined' && process.cwd 
      ? process.cwd() 
      : '';
    
    return `${currentPath}/backups`;
  }
  
  /**
   * التأكد من وجود مجلد النسخ الاحتياطية
   */
  private ensureBackupDirectory(): void {
    try {
      // في بيئة المتصفح، نستخدم localStorage للتخزين
      if (typeof window !== 'undefined') {
        // التأكد من وجود مساحة في localStorage
        const testKey = 'backup_storage_test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      }
    } catch (error) {
      console.error('Error ensuring backup directory:', error);
    }
  }
  
  static getInstance(): BackupManager {
    if (!this.instance) {
      this.instance = new BackupManager();
    }
    return this.instance;
  }
  
  /**
   * إنشاء نسخة احتياطية
   */
  async createBackup(type: 'full' | 'incremental', userId: string): Promise<BackupMetadata> {
    try {
      // جمع البيانات
      const data = this.collectSystemData();
      const jsonData = JSON.stringify(data);
      
      // تشفير البيانات
      const encrypted = this.encryption.encrypt(jsonData);
      
      // توليد اسم الملف
      const timestamp = Date.now();
      const dateStr = new Date(timestamp).toISOString().split('T')[0];
      const fileName = `backup_${type}_${dateStr}_${timestamp}.enc`;
      
      const backup: BackupMetadata = {
        id: `backup_${timestamp}`,
        timestamp: new Date(),
        type,
        size: encrypted.length,
        encrypted: true,
        createdBy: userId,
        location: `${this.backupBasePath}/${type}`,
        fileName: fileName,
        checksum: this.calculateChecksum(encrypted)
      };
      
      // حفظ النسخة
      await this.saveBackupToStorage(backup.id, encrypted, backup.fileName);
      this.backups.push(backup);
      this.saveBackupMetadata();
      
      console.log(`✅ تم إنشاء النسخة الاحتياطية: ${fileName}`);
      console.log(`📁 الموقع: ${backup.location}/${fileName}`);
      console.log(`📊 الحجم: ${Math.round(backup.size / 1024)} KB`);
      
      return backup;
    } catch (error) {
      console.error('❌ فشل إنشاء النسخة الاحتياطية:', error);
      throw error;
    }
  }
  
  /**
   * استرجاع نسخة احتياطية
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      console.error('❌ النسخة الاحتياطية غير موجودة:', backupId);
      throw new Error('النسخة الاحتياطية غير موجودة');
    }
    
    console.log(`🔄 بدء استرجاع النسخة الاحتياطية: ${backup.fileName}`);
    console.log(`📁 من الموقع: ${backup.location}/${backup.fileName}`);
    
    try {
      // تحميل البيانات المشفرة
      const encrypted = this.loadBackupFromStorage(backupId);
      
      console.log('🔐 التحقق من سلامة النسخة...');
      
      // التحقق من السلامة
      const checksum = this.calculateChecksum(encrypted);
      if (checksum !== backup.checksum) {
        console.error('❌ النسخة الاحتياطية تالفة - checksum غير متطابق');
        throw new Error('النسخة الاحتياطية تالفة - فشل التحقق من السلامة');
      }
      
      console.log('✅ النسخة سليمة، جارِ فك التشفير...');
      
      // فك التشفير
      const decrypted = this.encryption.decrypt(encrypted);
      const data = JSON.parse(decrypted);
  /**
   * حذف النسخ القديمة
   */
  cleanOldBackups(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    
    this.backups = this.backups.filter(backup => {
      if (backup.timestamp < cutoffDate) {
        console.log(`🗑️ حذف نسخة قديمة: ${backup.fileName}`);
        this.deleteBackupFromStorage(backup.id);
        deletedCount++;
        return false;
      }
      return true;
    });
    
    this.saveBackupMetadata();
    
    if (deletedCount > 0) {
      console.log(`✅ تم حذف ${deletedCount} نسخة احتياطية قديمة`);
    }
    
    return deletedCount;
  }
  
  /**
   * الحصول على جميع النسخ الاحتياطية
   */
  getBackups(): BackupMetadata[] {
    return [...this.backups].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
  
  /**
   * الحصول على معلومات النسخة الاحتياطية
   */
  getBackupInfo(backupId: string): BackupMetadata | undefined {
    return this.backups.find(b => b.id === backupId);
  }
  
  /**
   * تصدير النسخة الاحتياطية كملف
   */
  async exportBackup(backupId: string): Promise<Blob | null> {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        console.error('النسخة الاحتياطية غير موجودة');
        return null;
  // مساعدات داخلية
  
  private collectSystemData(): any {
    // جمع كل البيانات من localStorage
    const data: Record<string, any> = {
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: typeof window !== 'undefined' ? 'browser' : 'node'
      }
    };
    
    // جمع جميع مفاتيح localStorage
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage);
      console.log(`📦 جمع ${keys.length} عنصر من localStorage...`);
      
      keys.forEach(key => {
        // تجاهل مفاتيح النسخ الاحتياطية نفسها
        if (!key.startsWith('backup_')) {
          try {
            data[key] = localStorage.getItem(key);
          } catch (error) {
            console.warn(`تحذير: فشل جمع ${key}:`, error);
          }
        }
      });
    }
    
    return data;
  }
  
  private restoreSystemData(data: any): number {
    // استرجاع البيانات إلى localStorage
    let restoredCount = 0;
    
    Object.keys(data).forEach(key => {
      if (key !== 'metadata' && data[key] !== null && data[key] !== undefined) {
        try {
          localStorage.setItem(key, data[key]);
          restoredCount++;
        } catch (error) {
          console.warn(`تحذير: فشل استرجاع ${key}:`, error);
        }
      }
    });
    
    // إعادة تحميل الصفحة لتطبيق التغييرات
    if (typeof window !== 'undefined' && restoredCount > 0) {
      console.log('🔄 سيتم إعادة تحميل الصفحة لتطبيق التغييرات...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    return restoredCount;
  }   const encrypted = await file.text();
      
      console.log(`📥 استيراد نسخة احتياطية من: ${file.name}`);
      
      // التحقق من صحة البيانات
      const checksum = this.calculateChecksum(encrypted);
      
      const timestamp = Date.now();
      const backup: BackupMetadata = {
        id: `backup_${timestamp}`,
        timestamp: new Date(),
        type: 'full',
        size: encrypted.length,
        encrypted: true,
        createdBy: userId,
        location: `${this.backupBasePath}/imported`,
        fileName: file.name,
        checksum
      };
      
      // حفظ النسخة
      await this.saveBackupToStorage(backup.id, encrypted, backup.fileName);
      this.backups.push(backup);
      this.saveBackupMetadata();
      
      console.log(`✅ تم استيراد النسخة الاحتياطية بنجاح`);
      
      return backup;
    } catch (error) {
      console.error('فشل استيراد النسخة:', error);
      return null;
    }
  }   return true;
    } catch (error) {
      console.error('❌ فشل استرجاع النسخة الاحتياطية:', error);
      return false;
    }
  }
  
  /**
   * حذف النسخ القديمة
   */
  cleanOldBackups(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.backups = this.backups.filter(backup => {
      if (backup.timestamp < cutoffDate) {
        this.deleteBackupFromStorage(backup.id);
        return false;
      }
      return true;
    });
    
    this.saveBackupMetadata();
  }
  
  getBackups(): BackupMetadata[] {
    return [...this.backups].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
  private async saveBackupToStorage(id: string, data: string, fileName: string): Promise<void> {
    try {
      // حفظ في localStorage مع الـ ID
      localStorage.setItem(`backup_data_${id}`, data);
      console.log(`💾 تم حفظ النسخة في التخزين المحلي: ${fileName}`);
    } catch (error) {
      console.error('فشل حفظ النسخة:', error);
      throw new Error('فشل حفظ النسخة الاحتياطية - مساحة التخزين ممتلئة');
    }
  }
  
  private loadBackupFromStorage(id: string): string {
    const data = localStorage.getItem(`backup_data_${id}`);
    if (!data) {
      console.error(`النسخة الاحتياطية غير موجودة في التخزين: ${id}`);
      throw new Error('Backup data not found in storage');
  private loadBackups(): void {
    try {
      const data = localStorage.getItem('backup_metadata');
      if (data) {
        const parsedBackups = JSON.parse(data);
        // تحويل timestamps من string إلى Date
        this.backups = parsedBackups.map((b: any) => ({
          ...b,
          timestamp: new Date(b.timestamp)
        }));
        console.log(`📋 تم تحميل ${this.backups.length} نسخة احتياطية`);
      } else {
        console.log('📋 لا توجد نسخ احتياطية محفوظة');
      }
    } catch (error) {
      console.error('خطأ في تحميل النسخ الاحتياطية:', error);
      this.backups = [];
    }
  }
  
  private saveBackupMetadata(): void {
    try {
      localStorage.setItem('backup_metadata', JSON.stringify(this.backups));
      console.log(`💾 تم حفظ معلومات ${this.backups.length} نسخة احتياطية`);
    } catch (error) {
      console.error('خطأ في حفظ معلومات النسخ:', error);
    }
  }
  
  /**
   * الحصول على إحصائيات النسخ الاحتياطية
   */
  getBackupStats(): {
    total: number;
    totalSize: number;
    byType: { full: number; incremental: number };
    oldest?: Date;
    newest?: Date;
  } {
    const stats = {
      total: this.backups.length,
      totalSize: this.backups.reduce((sum, b) => sum + b.size, 0),
      byType: {
        full: this.backups.filter(b => b.type === 'full').length,
        incremental: this.backups.filter(b => b.type === 'incremental').length
      },
      oldest: this.backups.length > 0 
        ? new Date(Math.min(...this.backups.map(b => b.timestamp.getTime())))
        : undefined,
      newest: this.backups.length > 0
        ? new Date(Math.max(...this.backups.map(b => b.timestamp.getTime())))
        : undefined
    };
    
    return stats;
  }
}   });
  }
  
  private calculateChecksum(data: string): string {
    // محاكاة - في الواقع استخدم SHA-256
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
  
  private saveBackupToStorage(id: string, data: string): void {
    localStorage.setItem(`backup_${id}`, data);
  }
  
  private loadBackupFromStorage(id: string): string {
    const data = localStorage.getItem(`backup_${id}`);
    if (!data) {
      throw new Error('Backup data not found');
    }
    return data;
  }
  
  private deleteBackupFromStorage(id: string): void {
    localStorage.removeItem(`backup_${id}`);
  }
  
  private loadBackups(): void {
    try {
      const data = localStorage.getItem('backup_metadata');
      if (data) {
        this.backups = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  }
  
  private saveBackupMetadata(): void {
    localStorage.setItem('backup_metadata', JSON.stringify(this.backups));
  }
}

// ====================================
// 5️⃣ تنظيف البيانات (Sanitization)
// ====================================

export class DataSanitization {
  /**
   * تنظيف المدخلات من أكواد ضارة
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    // إزالة HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // إزالة JavaScript
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // إزالة SQL injection patterns
    sanitized = sanitized.replace(/(\bOR\b|\bAND\b).*?=/gi, '');
    sanitized = sanitized.replace(/[';]--/g, '');
    
    return sanitized.trim();
  }
  
  /**
   * تنظيف كائن كامل
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };
    
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      }
    });
    
    return sanitized;
  }
  
  /**
   * التحقق من صحة البريد الإلكتروني
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * التحقق من صحة رقم الجوال
   */
  static isValidPhone(phone: string): boolean {
    // رقم سعودي
    const phoneRegex = /^(05|5)\d{8}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }
  
  /**
   * التحقق من قوة كلمة المرور
   */
  static validatePasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // الطول
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('يجب أن تكون 8 أحرف على الأقل');
    }
    
    // أحرف كبيرة
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على حرف كبير');
    }
    
    // أحرف صغيرة
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على حرف صغير');
    }
    
    // أرقام
    if (/[0-9]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على رقم');
    }
    
    // رموز خاصة
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على رمز خاص');
    }
    
    return {
      isStrong: score >= 80,
      score,
      feedback
    };
  }
}

// تصدير instances
export const dataEncryption = DataEncryption.getInstance();
export const dataProtection = DataProtection.getInstance();
export const backupManager = BackupManager.getInstance();
