export interface ErrorLog {
  id?: string;
  error_code: string;
  error_message: string;
  error_details: string;
  context?: string;
  user_id?: string;
  timestamp: string;
  resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  url?: string;
  payload?: string;
}

export class ErrorStorage {
  private static instance: ErrorStorage;
  private errors: Map<string, ErrorLog> = new Map();
  private readonly STORAGE_KEY = 'system_errors';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ErrorStorage {
    if (!ErrorStorage.instance) {
      ErrorStorage.instance = new ErrorStorage();
    }
    return ErrorStorage.instance;
  }

  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.errors = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load errors from localStorage:', error);
    }
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const obj = Object.fromEntries(this.errors);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.warn('Failed to save errors to localStorage:', error);
    }
  }

  async logError(error: Omit<ErrorLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const errorLog: ErrorLog = {
        ...error,
        id: errorId,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      // Store in memory and localStorage
      this.errors.set(errorId, errorLog);
      this.saveToStorage();

      console.log('✅ Error logged successfully:', {
        id: errorId,
        code: error.error_code,
        message: error.error_message,
        timestamp: errorLog.timestamp
      });

      // Also log to console for debugging
      console.error('📝 Error Details:', {
        code: error.error_code,
        message: error.error_message,
        context: error.context
      });

      return errorId;
    } catch (error) {
      console.error('❌ Error logging failed:', error);
      return 'unknown';
    }
  }

  // Quick log method for common errors
  async quickLog(message: string, context?: string): Promise<string> {
    const errorCode = `ERR_${context?.toUpperCase().replace(/\s+/g, '_') || 'SYSTEM'}`;
    return this.logError({
      error_code: errorCode,
      error_message: message,
      error_details: new Error(message).stack || message,
      context: context || 'System Error'
    });
  }

  async getErrorById(id: string): Promise<ErrorLog | null> {
    try {
      return this.errors.get(id) || null;
    } catch (error) {
      console.error('Error fetching error details:', error);
      return null;
    }
  }

  async searchErrors(query: string): Promise<ErrorLog[]> {
    try {
      const searchTerm = query.toLowerCase();
      const results: ErrorLog[] = [];
      
      this.errors.forEach(error => {
        if (
          error.error_code.toLowerCase().includes(searchTerm) ||
          error.error_message.toLowerCase().includes(searchTerm) ||
          (error.context && error.context.toLowerCase().includes(searchTerm)) ||
          error.id?.toLowerCase().includes(searchTerm)
        ) {
          results.push(error);
        }
      });

      return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error searching errors:', error);
      return [];
    }
  }

  async getAllErrors(limit: number = 100): Promise<ErrorLog[]> {
    try {
      return Array.from(this.errors.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching all errors:', error);
      return [];
    }
  }

  async markAsResolved(id: string, resolvedBy: string, notes?: string): Promise<boolean> {
    try {
      const errorLog = this.errors.get(id);
      if (errorLog) {
        const resolvedAt = new Date().toISOString();
        this.errors.set(id, {
          ...errorLog,
          resolved: true,
          resolved_by: resolvedBy,
          resolved_at: resolvedAt,
          resolution_notes: notes
        });
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking as resolved:', error);
      return false;
    }
  }

  async getErrorStats(): Promise<{
    total: number;
    resolved: number;
    unresolved: number;
    byType: Record<string, number>;
  }> {
    try {
      const errors = await this.getAllErrors(1000);
      
      const stats = {
        total: errors.length,
        resolved: errors.filter(e => e.resolved).length,
        unresolved: errors.filter(e => !e.resolved).length,
        byType: {} as Record<string, number>
      };

      errors.forEach(error => {
        const errorType = error.error_code.split('_')[0] || 'unknown';
        stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return { total: 0, resolved: 0, unresolved: 0, byType: {} };
    }
  }

  // Clear all errors (for testing)
  async clearAllErrors(): Promise<void> {
    this.errors.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const errorStorage = ErrorStorage.getInstance();