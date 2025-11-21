import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectStorage, Task } from '@/lib/project-storage';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useNotifications } from '@/components/NotificationSystem';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const allTasks = ProjectStorage.getTasks();
    setTasks(allTasks);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'outline',
      'in-progress': 'secondary',
      'completed': 'default',
      'blocked': 'destructive'
    } as const;
    
    const statusLabels = {
      'pending': 'معلقة',
      'in-progress': 'قيد التنفيذ',
      'completed': 'مكتملة',
      'blocked': 'محظورة'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'low': 'outline',
      'medium': 'secondary',
      'high': 'destructive',
      'urgent': 'destructive'
    } as const;
    
    const priorityLabels = {
      'low': 'منخفضة',
      'medium': 'متوسطة',
      'high': 'عالية',
      'urgent': 'عاجلة'
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priorityLabels[priority as keyof typeof priorityLabels] || priority}
      </Badge>
    );
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      try {
        const success = ProjectStorage.deleteTask(taskToDelete.id);
        if (success) {
          const updatedTasks = ProjectStorage.getTasks();
          setTasks(updatedTasks);
          
          addNotification({
            type: 'success',
            title: 'تم حذف المهمة',
            message: `تم حذف المهمة "${taskToDelete.title}" بنجاح`,
          });
        } else {
          throw new Error('Failed to delete task');
        }
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'خطأ في الحذف',
          message: 'حدث خطأ أثناء محاولة حذف المهمة',
        });
      }
    }
    setTaskToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    try {
      const updatedTask = ProjectStorage.updateTaskStatus(taskId, newStatus as Task['status']);
      if (updatedTask) {
        const updatedTasks = ProjectStorage.getTasks();
        setTasks(updatedTasks);
        
        const task = tasks.find(t => t.id === taskId);
        addNotification({
          type: 'success',
          title: 'تم تحديث الحالة',
          message: `تم تحديث حالة المهمة "${task?.title}"`,
        });
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ في التحديث',
        message: 'حدث خطأ أثناء تحديث حالة المهمة',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المهام</h1>
        <Badge variant="secondary">{tasks.length} مهمة</Badge>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">جميع المهام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">المهام المنتهية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">العمل النشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">في انتظار البدء</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>جميع المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>المشروع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.projectName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                        className="text-xs border rounded px-1 py-0.5"
                      >
                        <option value="pending">معلقة</option>
                        <option value="in-progress">قيد التنفيذ</option>
                        <option value="completed">مكتملة</option>
                        <option value="blocked">محظورة</option>
                      </select>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(task)}
                    >
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد الحذف"
        description={`هل أنت متأكد من رغبتك في حذف المهمة "${taskToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
      />
    </div>
  );
};

export default Tasks;