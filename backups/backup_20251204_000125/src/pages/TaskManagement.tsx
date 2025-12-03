import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateDMY } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { supabaseAPI, type Task, type Employee } from '@/lib/supabaseClient';
import {
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Target,
  Filter,
  Search,
  Users,
  CalendarDays
} from 'lucide-react';

export default function TaskManagement() {
  const { addNotification, addErrorNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    assignee_id: '',
    due_date: '',
    execution_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, employeesData] = await Promise.all([
        supabaseAPI.getTasks(),
        supabaseAPI.getEmployees()
      ]);
      
      setTasks(tasksData);
      setEmployees(employeesData);
      
      // Removed notification on page load as requested
    } catch (error) {
      console.error('Error loading data:', error);
      addErrorNotification(error, 'Loading tasks and employees data');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.title.trim()) {
        addNotification({
          type: 'warning',
          title: '⚠️ خطأ في البيانات',
          message: 'يرجى إدخال عنوان المهمة'
        });
        return;
      }
      
      setIsSaving(true);
      
      if (editingTask) {
        await supabaseAPI.updateTask(editingTask.id, {
          ...formData,
          assignee_id: formData.assignee_id || undefined,
          due_date: formData.due_date || undefined,
          execution_date: formData.execution_date || undefined
        });
        
        showSuccessNotification(
          'تم الحفظ بنجاح ✅',
          `تم تحديث المهمة "${formData.title}" بنجاح`
        );
      } else {
        await supabaseAPI.createTask({
          ...formData,
          assignee_id: formData.assignee_id || undefined,
          due_date: formData.due_date || undefined,
          execution_date: formData.execution_date || undefined
        });
        
        showSuccessNotification(
          'تم الحفظ بنجاح ✅',
          `تم إنشاء المهمة "${formData.title}" بنجاح`
        );
      }

      // Reset form
      setIsDialogOpen(false);
      resetForm();
      loadData();
      
    } catch (error) {
      await handleApiError(error, {
        message: editingTask ? 'فشل في تحديث المهمة' : 'فشل في إنشاء المهمة',
        context: `TaskManagement - ${editingTask ? 'Update' : 'Create'}`,
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء حفظ المهمة',
        payload: formData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (task: Task) => {
    console.log('Edit clicked for task:', task);
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      assignee_id: task.assignee_id || '',
      due_date: task.due_date || '',
      execution_date: task.execution_date || ''
    });
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      await supabaseAPI.deleteTask(taskToDelete.id);
      addNotification({
        type: 'info',
        title: '🗑️ تم حذف المهمة',
        message: `تم حذف المهمة "${taskToDelete.title}" بنجاح`
      });
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
      addErrorNotification(error, 'Deleting task operation');
    } finally {
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignee_id: '',
      due_date: '',
      execution_date: ''
    });
    setEditingTask(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'معلقة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'غير محدد';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    return formatDateDMY(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل المهام...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            إدارة المهام
          </h1>
          <p className="text-xl text-gray-600">تنظيم وتوكيل ومتابعة المهام والأنشطة</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <CheckSquare className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{tasks.length}</div>
              <p className="text-blue-100">إجمالي المهام</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <p className="text-green-100">مهام مكتملة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-yellow-200" />
              <div className="text-3xl font-bold mb-1">
                {tasks.filter(t => t.status === 'in_progress').length}
              </div>
              <p className="text-yellow-100">قيد التنفيذ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-200" />
              <div className="text-3xl font-bold mb-1">
                {tasks.filter(t => t.priority === 'urgent').length}
              </div>
              <p className="text-red-100">مهام عاجلة</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المهام..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="فلترة بالحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">معلقة</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="cancelled">ملغية</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="فلترة بالأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    <SelectItem value="urgent">عاجل</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة مهمة جديدة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {getPriorityText(task.priority)}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600">{task.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>المكلف: {task.assignee_id ? getEmployeeName(task.assignee_id) : 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>الاستحقاق: {formatDate(task.due_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>التنفيذ: {formatDate(task.execution_date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row lg:flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(task)}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(task)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 lg:flex-none"
                      >
                        <Trash2 className="h-4 w-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد مهام</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'لا توجد مهام تطابق معايير البحث المحددة'
                    : 'لم يتم إنشاء أي مهام بعد'}
                </p>
                <Button 
                  onClick={openCreateDialog}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مهمة جديدة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create/Edit Task Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingTask ? 'قم بتعديل بيانات المهمة' : 'أدخل بيانات المهمة الجديدة'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">عنوان المهمة *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="أدخل عنوان المهمة"
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف المهمة</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="وصف تفصيلي للمهمة"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">الحالة</Label>
                    <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">معلقة</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتملة</SelectItem>
                        <SelectItem value="cancelled">ملغية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">الأولوية</Label>
                    <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="assignee">توكيل المهة للمظف</Label>
                  <Select value={formData.assignee_id} onValueChange={(value) => setFormData({...formData, assignee_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر موظف..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون توكيل</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="execution_date">تاريخ التنفيذ</Label>
                    <Input
                      id="execution_date"
                      type="date"
                      value={formData.execution_date}
                      onChange={(e) => setFormData({...formData, execution_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  إلغاء
                </Button>
                <LoadingButton 
                  type="submit" 
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  loading={isSaving}
                  loadingText="جاري الحفظ..."
                  disabled={!formData.title}
                >
                  {editingTask ? 'تحديث المهمة' : 'إنشاء المهمة'}
                </LoadingButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="تأكيد الحذف"
          description={`هل أنت متأكد من حذف المهمة "${taskToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmText="حذف"
          cancelText="إلغاء"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>
  );
}