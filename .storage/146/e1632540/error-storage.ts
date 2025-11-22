import { supabase } from './supabaseClient';

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
}

export class ErrorStorage {
  private static instance: ErrorStorage;
  private errors: Map<string, ErrorLog> = new Map();

  private constructor() {}

  static getInstance(): ErrorStorage {
    if (!ErrorStorage.instance) {
      ErrorStorage.instance = new ErrorStorage();
    }
    return ErrorStorage.instance;
  }

  async logError(error: Omit<ErrorLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const errorLog: Omit<ErrorLog, 'id'> = {
        ...error,
        timestamp: new Date().toISOString()
      };

      // Store in memory
      const memoryId = Math.random().toString(36).substr(2, 9);
      this.errors.set(memoryId, { ...errorLog, id: memoryId });

      // Store in Supabase if available
      try {
        const { data, error: supabaseError } = await supabase
          .from('error_logs')
          .insert([errorLog])
          .select()
          .single();

        if (!supabaseError && data) {
          return data.id;
        }
      } catch (dbError) {
        console.warn('Failed to store error in database, using memory storage:', dbError);
      }

      return memoryId;
    } catch (error) {
      console.error('Error logging failed:',
      console.error('Error logging failed:', error);
      return 'unknown';
    }
  }

  async getErrorById(id: string): Promise<ErrorLog | null> {
    try {
      // Try to get from database first
      try {
        const { data, error } = await supabase
          .from('error_logs')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return data;
        }
      } catch (dbError) {
        console.warn('Database fetch failed, checking memory:', dbError);
      }

      // Fallback to memory storage
      return this.errors.get(id) || null;
    } catch (error) {
      console.error('Error fetching error details:', error);
      return null;
    }
  }

  async searchErrors(query: string): Promise<
  async searchErrors(query: string): Promise<ErrorLog[]> {
    try {
      // Try database search first
      try {
        const { data, error } = await supabase
          .from('error_logs')
          .select('*')
          .or(`error_code.ilike.%${query}%,error_message.ilike.%${query}%,context.ilike.%${query}%`)
          .order('timestamp', { ascending: false });

        if (!error && data) {
          return data;
        }
      }
      } catch (dbError) {
        console.warn('Database search failed, using memory:', dbError);
      }

      // Fallback to memory search
      const results: ErrorLog[] = [];
      const searchTerm = query.toLowerCase();
      
      this.errors.forEach(error => {
        if (
          error.error_code.toLowerCase().includes(searchTerm) ||
          error.error_message.toLowerCase().includes(searchTerm) ||
          (error.context && error.context.toLowerCase().includes(searchTerm))
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
      // Try database first
      try {
        const { data, error } = await supabase
          .from('error_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data;
        }
      } catch (dbError) {
        console.warn('Database fetch failed, using memory:', dbError);
      }

      // Fallback to memory
      return Array.from(this.errors.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching all errors:', error);
      return [];
    }
  }

  async markAsResolved(id: string, resolvedBy: string, notes?: string): Promise<boolean> {
    try {
      const resolvedAt = new Date().toISOString();
      
      // Update in database if available
      try {
        const { error } = await supabase
          .from('error_logs')
          .update({
            resolved: true,
            resolved_by: resolvedBy,
            resolved_at: resolvedAt,
            resolution_notes: notes
          })
          .eq('id', id);

        if (!error) {
          // Also update in memory
          const errorLog = this.errors.get(id);
          if (error
          if (errorLog) {
            this.errors.set(id, {
              ...errorLog,
              resolved: true,
              resolved_by: resolvedBy,
              resolved_at: resolvedAt,
              resolution_notes: notes
            });
          }
          return true;
        }
      } catch (dbError) {
        console.warn('Database update failed, updating memory only:', dbError);
      }

      // Update in memory only
      const errorLog = this.errors.get(id);
      if (errorLog) {
        this.errors.set(id, {
          ...errorLog,
          resolved: true,
          resolved_by: resolvedBy,
          resolved_at: resolvedAt,
          resolution_notes: notes
        });
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
        by
        byType: {} as Record<string, number>
      };

      errors.forEach(error => {
        const errorType = error.error_code.split('_')[1] || 'unknown';
        stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return { total: 0, resolved: 0, unresolved: 0, byType: {} };
    }
  }
}

export const errorStorage = ErrorStorage.getInstance();