import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from './NotificationSystem';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export const NotificationPanel: React.FC = () => {
  const { notifications, markAsRead, clearAll, deleteNotification, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleClearAll = () => {
    clearAll();
    setClearModalOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        📢 الإشعارات
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="flex items-center gap-2">
                📢 سجل الإشعارات
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} غير مقروء</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClearModalOpen(true)}
                  >
                    مسح الكل
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  إغلاق
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-0">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <div className="text-4xl mb-2">📭</div>
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${getNotificationColor(
                        notification.type
                      )} ${!notification.read ? 'ring-2 ring-opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 text-xs"
                            >
                              تم القراءة
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 text-xs text-red-600 hover:text-red-700"
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize">
                          {notification.type}
                        </Badge>
                        <span>{formatDate(notification.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAll}
        title="مسح جميع الإشعارات"
        description="هل أنت متأكد من رغبتك في مسح جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="مسح الكل"
        cancelText="إلغاء"
        variant="destructive"
      />
    </>
  );
};