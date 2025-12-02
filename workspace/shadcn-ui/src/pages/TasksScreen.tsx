import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Sidebar';
import { supabaseAPI, type Task } from '@/lib/supabaseClient';
import { formatDateDMY } from '@/lib/date-utils';
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  Calendar,
  Clock,
  User,
  DollarSign,
  FileText,
  Search,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    assigned_to: '',
    due_date: '',
    revenue: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await supabaseAPI.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('خطأ في تحميل المهام:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المهام',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
      };

      if (formData.assigned_to) taskData.assigned_to = parseInt(formData.assigned_to);
      if (formData.due_date) taskData.due_date = formData.due_date;
      if (formData.revenue) taskData.revenue = parseFloat(formData.revenue);

      await supabaseAPI.createTask(taskData);
      
      toast({
        title: 'نجح',
        description: 'تم إنشاء المهمة بنجاح',
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        assigned_to: '',
        due_date: '',
        revenue: ''
      });
      loadTasks();
    } catch (error) {
      console.error('خطأ في إنشاء المهمة:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء المهمة',
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = (task: any) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'قيد الانتظار';
      default: return status;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            إدارة المهام
          </h1>
          <p className="text-gray-600">تنظيم ومتابعة جميع المهام والأنشطة</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">إجمالي المهام</p>
                  <p className="text-3xl font-bold">{tasks.length}</p>
                </div>
                <CheckSquare className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">مكتملة</p>
                  <p className="text-3xl font-bold">
                    {tasks.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <CheckSquare className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-100">قيد التنفيذ</p>
                  <p className="text-3xl font-bold">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">قيد الانتظار</p>
                  <p className="text-3xl font-bold">
                    {tasks.filter(t => t.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>المهام</span>
              <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                مهمة جديدة
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن مهمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتملة</option>
              </select>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>لا توجد مهام</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                              {getStatusText(task.status)}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {task.assigned_to && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>موظف #{task.assigned_to}</span>
                              </div>
                            )}
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDateDMY(task.due_date)}</span>
                              </div>
                            )}
                            {task.revenue && (
                              <div className="flex items-center gap-1 text-green-600 font-semibold">
                                <DollarSign className="h-4 w-4" />
                                <span>{task.revenue.toLocaleString()} ر.س</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(task)}>
                          عرض التفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Task Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المهمة *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان المهمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف المهمة"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتملة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">المكلف (ID)</Label>
                  <Input
                    id="assigned_to"
                    type="number"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="رقم الموظف"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="revenue">الإيراد (ر.س)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateTask} disabled={!formData.title}>
                إنشاء المهمة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>تفاصيل المهمة</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-lg font-bold mb-2">{selectedTask.title}</h3>
                  {selectedTask.description && (
                    <p className="text-gray-600">{selectedTask.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الحالة:</span>
                    <span className={`mr-2 px-2 py-1 rounded ${getStatusColor(selectedTask.status)}`}>
                      {getStatusText(selectedTask.status)}
                    </span>
                  </div>
                  
                  {selectedTask.assigned_to && (
                    <div>
                      <span className="text-gray-600">المكلف:</span>
                      <span className="mr-2 font-semibold">موظف #{selectedTask.assigned_to}</span>
                    </div>
                  )}
                  
                  {selectedTask.due_date && (
                    <div>
                      <span className="text-gray-600">تاريخ الاستحقاق:</span>
                      <span className="mr-2 font-semibold">
                        {formatDateDMY(selectedTask.due_date)}
                      </span>
                    </div>
                  )}
                  
                  {selectedTask.revenue && (
                    <div>
                      <span className="text-gray-600">الإيراد:</span>
                      <span className="mr-2 font-bold text-green-600">
                        {selectedTask.revenue.toLocaleString()} ر.س
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailsDialogOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
