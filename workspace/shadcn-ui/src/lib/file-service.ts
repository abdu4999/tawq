import { formatDateDMY } from './date-utils';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  taskId?: string;
  projectId?: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'other';
  url: string;
  thumbnail?: string;
}

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  taskId?: string;
  projectId?: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'other';
  url: string;
  thumbnail?: string;
}

export class FileService {
  private static files: FileMetadata[] = [];
  private static maxFileSize = 10 * 1024 * 1024; // 10MB

  // رفع ملف جديد
  static async uploadFile(
    file: File, 
    uploadedBy: string, 
    taskId?: string, 
    projectId?: string
  ): Promise<FileMetadata> {
    // التحقق من حجم الملف
    if (file.size > this.maxFileSize) {
      throw new Error(`حجم الملف كبير جداً. الحد الأقصى ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('نوع الملف غير مدعوم');
    }

    // إنشاء URL للملف
    const url = URL.createObjectURL(file);
    
    // تحديد فئة الملف
    const category = this.getFileCategory(file.type);
    
    // إنشاء صورة مصغرة للصور
    let thumbnail: string | undefined;
    if (category === 'image') {
      thumbnail = await this.generateThumbnail(file);
    }

    const metadata: FileMetadata = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      uploadedBy,
      taskId,
      projectId,
      category,
      url,
      thumbnail
    };

    this.files.push(metadata);
    
    // حفظ في localStorage
    this.saveToStorage();
    
    return metadata;
  }

  // الحصول على الملفات
  static getFiles(filters?: {
    taskId?: string;
    projectId?: string;
    uploadedBy?: string;
    category?: string;
  }): FileMetadata[] {
    let filteredFiles = [...this.files];

    if (filters) {
      if (filters.taskId) {
        filteredFiles = filteredFiles.filter(f => f.taskId === filters.taskId);
      }
      if (filters.projectId) {
        filteredFiles = filteredFiles.filter(f => f.projectId === filters.projectId);
      }
      if (filters.uploadedBy) {
        filteredFiles = filteredFiles.filter(f => f.uploadedBy === filters.uploadedBy);
      }
      if (filters.category) {
        filteredFiles = filteredFiles.filter(f => f.category === filters.category);
      }
    }

    return filteredFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  // حذف ملف
  static deleteFile(fileId: string, userId: string): boolean {
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      return false;
    }

    const file = this.files[fileIndex];
    
    // التحقق من الصلاحية (المالك فقط أو المدير)
    if (file.uploadedBy !== userId) {
      // يمكن إضافة فحص دور المستخدم هنا
      return false;
    }

    // تحرير URL
    URL.revokeObjectURL(file.url);
    if (file.thumbnail) {
      URL.revokeObjectURL(file.thumbnail);
    }

    this.files.splice(fileIndex, 1);
    this.saveToStorage();
    
    return true;
  }

  // تحديث معلومات الملف
  static updateFileMetadata(
    fileId: string, 
    updates: Partial<Pick<FileMetadata, 'name' | 'taskId' | 'projectId'>>
  ): boolean {
    const file = this.files.find(f => f.id === fileId);
    
    if (!file) {
      return false;
    }

    Object.assign(file, updates);
    this.saveToStorage();
    
    return true;
  }

  // البحث في الملفات
  static searchFiles(query: string): FileMetadata[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.files.filter(file => 
      file.name.toLowerCase().includes(lowercaseQuery) ||
      file.type.toLowerCase().includes(lowercaseQuery)
    );
  }

  // الحصول على إحصائيات الملفات
  static getFileStats(): {
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
  } {
    const stats = {
      totalFiles: this.files.length,
      totalSize: this.files.reduce((sum, file) => sum + file.size, 0),
      byCategory: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    this.files.forEach(file => {
      stats.byCategory[file.category] = (stats.byCategory[file.category] || 0) + 1;
      stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;
    });

    return stats;
  }

  // تنظيف الملفات القديمة
  static cleanupOldFiles(daysOld: number = 30): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const oldFiles = this.files.filter(f => f.uploadedAt < cutoffDate);
    
    oldFiles.forEach(file => {
      URL.revokeObjectURL(file.url);
      if (file.thumbnail) {
        URL.revokeObjectURL(file.thumbnail);
      }
    });

    this.files = this.files.filter(f => f.uploadedAt >= cutoffDate);
    this.saveToStorage();
    
    return oldFiles.length;
  }

  // تصدير قائمة الملفات
  static exportFileList(): string {
    const exportData = this.files.map(file => ({
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
      category: file.category,
      uploadedAt: formatDateDMY(file.uploadedAt),
      uploadedBy: file.uploadedBy,
      taskId: file.taskId,
      projectId: file.projectId
    }));

    return JSON.stringify(exportData, null, 2);
  }

  // مساعدات خاصة
  private static getFileCategory(mimeType: string): FileMetadata['category'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return 'document';
    }
    return 'other';
  }

  private static async generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 150;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve('');
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private static saveToStorage(): void {
    try {
      // حفظ البيانات الوصفية فقط (بدون URLs)
      const dataToSave = this.files.map(file => ({
        ...file,
        url: '', // لا نحفظ URLs في localStorage
        thumbnail: ''
      }));
      
      localStorage.setItem('fileMetadata', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('فشل في حفظ بيانات الملفات:', error);
    }
  }

  private static loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('fileMetadata');
      if (saved) {
        const data: FileData[] = JSON.parse(saved);
        this.files = data.map((file: FileData) => ({
          ...file,
          uploadedAt: new Date(file.uploadedAt)
        }));
      }
    } catch (error) {
      console.warn('فشل في تحميل بيانات الملفات:', error);
    }
  }

  // تهيئة الخدمة
  static initialize(): void {
    this.loadFromStorage();
    
    // تنظيف دوري للملفات القديمة
    setInterval(() => {
      this.cleanupOldFiles();
    }, 24 * 60 * 60 * 1000); // كل 24 ساعة
  }
}

// تهيئة الخدمة
FileService.initialize();