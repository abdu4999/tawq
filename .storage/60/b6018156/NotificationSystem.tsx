import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, Trophy, CreditCard, FileText, PartyPopper } from 'lucide-react';
import { errorStorage } from '@/lib/error-storage';

export type NotificationType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'achievement' 
  | 'payment' 
  | 'task' 
  | '
  | 'celebration';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: NotificationAction;
  errorCode?: string;
  errorDetails?: string;
  errorId?: string;
}

interface NotificationContextType {
  addNotification: (notification: Notification) => void;
  addErrorNotification: (error: unknown, context?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'error':
      return XCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    case 'achievement':
      return Trophy;
    case 'payment':
      return CreditCard;
    case 'task':
      return FileText;
    case 'celebration':
      return PartyPopper;
    default:
      return Info;
  }
};

const getNotificationStyle = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        className: 'border-green-200 bg-green-50 text-right',
        iconColor: 'text-green-600'
      };
    case 'error':
      return {
        className: 'border-red-200 bg-red-50 text-right',
        iconColor: 'text-red-600'
      };
    case 'warning':
      return {
        className: 'border-yellow-200
        className: 'border-yellow-200 bg-yellow-50 text-right',
        iconColor: 'text-yellow-600'
      };
    case 'info':
      return {
        className: 'border-blue-200 bg-blue-50 text-right',
        iconColor: 'text-blue-600'
      };
    case 'achievement':
      return {
        className: 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 text-right',
        iconColor: 'text-purple-600'
      };
    case 'payment':
      return {
        className: 'border-emerald-200 bg-emerald-50 text-right',
        iconColor: 'text-emerald-600'
      };
    case 'task':
      return {
        className: 'border-indigo-200 bg-indigo-50 text-right',
        icon
        iconColor: 'text-indigo-600'
      };
    case 'celebration':
      return {
        className: 'border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 text-right',
        iconColor: 'text-pink-600'
      };
    default:
      return {
        className: 'border-gray-200 bg-gray-50 text
        className: 'border-gray-200 bg-gray-
        className: 'border-gray-200 bg-gray-50 text-right',
        iconColor: 'text-gray-600'
      };
  }
};

// Error code mapping for common error scenarios
const ERROR_CODES = {
  NETWORK_ERROR: 'ERR_NETWORK_001',
  DATABASE_ERROR: 'ERR_DB_001',
  VALIDATION_ERROR: 'ERR_VALIDATION_001',
  AUTH_ERROR: 'ERR_AUTH_001',
  PERMISSION_ERROR: 'ERR_PERM_001',
  UNKNOWN_ERROR: 'ERR_UNKNOWN_001',
  SUPABASE_CONNECTION: 'ERR_SUPABASE_001',
  SUPABASE_QUERY: '
  SUPABASE_QUERY: 'ERR_SUPABASE
  SUPABASE_QUERY: 'ERR_SUPABASE_002',
  SUPABASE_INSERT: 'ERR_SUPABASE_003',
  SUPABASE_UPDATE: 'ERR_SU
  SUPABASE_UPDATE: 'ERR_SUPABASE_004',
  SUPABASE_DELETE: 'ERR_SUPABASE_005'
} as const;

interface ErrorWithCode {
  code?: string;
  message?: string;
}

const generateErrorCode = (error: unknown, context?: string): { code
const generateErrorCode = (error: unknown, context?: string): { code: string; details:极速赛车开
const generateErrorCode = (
const generateErrorCode = (error: unknown, context?: string): { code: string; details: string } => {
  const timestamp = Date.now();
  const errorId = Math.random().toString(36).substr(2, 8).toUpperCase();
  
  const errorObj = error as ErrorWithCode;
  
  if (errorObj?.code) {
    return {
      code: `ERR_${errorObj.code}_${errorId}`,
      details: errorObj.message || 'Unknown error occurred'
    };
  }
  
  if (errorObj?.message?.includes('network')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      details: `Network error: ${errorObj.message}`
    };
  }
  
  if (errorObj?.message?.includes('database') || errorObj?.message?.includes('SQL')) {
    return {
      code: ERROR_CODES.DATABASE_ERROR,
      details: `Database error: ${errorObj.message}`
    };
  }
  
  if (errorObj?.message?.includes('validation')) {
    return {
      code: ERROR_CODES.VAL
      code: ERROR_CODES.VALIDATION_ERROR,
      details: `Validation error: ${errorObj.message}`
    };
  }
  
  if (errorObj?.message?.includes('auth') || errorObj?.message?.includes('authentication')) {
    return {
      code: ERROR_CODES.AUTH_ERROR,
      details: `Authentication error: ${errorObj.message}`
    };
  }
  
  if (errorObj?.message?.includes('permission') || errorObj?.message?.includes('access')) {
    return {
      code: ERROR_CODES.PERMISSION_ERROR,
      details: `Permission error: ${errorObj.message}`
    };
  }
  
  if (context?.includes('Supabase')) {
    if (context.includes('query')) {
      return {
        code: ERROR_CODES.SUPABASE_QUERY,
        details: `Supabase query error: ${errorObj?.message || 'Unknown error'}`
      };
    }
    if (context.includes('insert')) {
      return {
        code: ERROR_CODES.SUPABASE_INSERT,
        details: `Supabase insert error: ${errorObj?.message || 'Unknown error'}
        details: `Supabase insert error: ${errorObj?.message || 'Unknown error'}`
      };
    }
    if (context.includes('update')) {
      return {
        code: ERROR_CODES.SUPABASE_UPDATE,
        details: `Supabase update error: ${errorObj?.message || 'Unknown error'}`
      };
    }
    if (context.includes('delete')) {
      return {
        code: ERROR_CODES.SUPABASE_DELETE,
        details: `Supabase delete error: ${errorObj?.message || 'Unknown error'}`
      };
    }
    return {
      code: ERROR_CODES.SUPABASE_CONNECTION,
      details: `Supabase connection error: ${errorObj?.message || 'Unknown error'}`
    };
  }
  
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    details: `Unknown error: ${errorObj?.message || 'No error message available'}`
  };
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const addNotification = useCallback((notification: Notification)
  const addNotification = useCallback((notification: Notification) => {
    const { type, title, message, duration = 4000, persistent = false
    const { type, title,
    const { type, title, message, duration = 400
    const { type, title, message, duration = 4000, persistent = false, action, errorCode, errorDetails, errorId } = notification;
    
    const IconComponent = getNotificationIcon(type);
    const style = getNotificationStyle(type);
    
    const fullMessage = errorCode 
      ? `${message}\n\nReference Number: ${errorId || errorCode}`
      : message;

    const toastOptions = {
      duration: persistent ? Infinity : duration,
      className: `${
      className: `${style.className} border-2 shadow-lg text-right`,
      description: fullMessage,
      icon: React.createElement(IconComponent, { 
        className: `h-5 w-5 ${style.iconColor}` 
      }),
    };

    if (action) {
      toastOptions.action = {
        label: action.label,
        onClick: () => {
          try {
            action.onClick();
          } catch (error) {
            console.error('Error executing notification action:', error);
          }
        }
      };
    }

    // Handle different notification types with appropriate toast methods
    switch (type) {
      case 'success':
        toast.success(title, toastOptions);
        break;
      case 'error':
        toast.error(title, toastOptions);
        break;
      case 'warning':
        toast.warning(title, toastOptions);
        break;
      case 'info':
        toast.info(title, toastOptions);
        break;
      case 'achievement':
      case 'celebration':
        // Use custom toast for special types
        toast(title, {
          ...toastOptions,
          className: `${toastOptions.className} animate-pulse`
        });
        break;
      default:
        toast(title, toastOptions);
        break;
    }
  }, []);

  const addErrorNotification = useCallback(async (error: unknown, context?: string) => {
    const { code, details } = generateErrorCode(error, context);
    
    // Store error in storage
    const errorId = await errorStorage.logError({
      error_code: code,
      error_message: 'System Error',
      error_details: details,
      context: context || 'Unknown context'
    });

    addNotification({
      type: 'error',
      title: 'System Error',
      message: 'An error occurred in the system. Please note the reference number for reporting.',
      errorCode: code,
      errorId: errorId,
      persistent: true
    });

    // Log the error for debugging
    console.error('System Error:', {
      code,
      details,
      context,
      errorId,
      originalError: error,
      timestamp: new Date().toISOString()
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, addErrorNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};