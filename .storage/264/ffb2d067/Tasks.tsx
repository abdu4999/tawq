import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProjectStorage, Task as TaskType } from '../lib/project-storage';
import { GamificationStorage } from '../lib/gamification-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newTask, setNewTask] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'medium' as TaskType['priority'],
    dueDate: '',
    estimatedHours: 0
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user) return;

    let userTasks: TaskType[] = [];
    let userProjects = [];

    if (user.role === 'admin') {
      userTasks = ProjectStorage.getTasks();
      userProjects = ProjectStorage.getProjects();
    } else if (user.role === 'supervisor') {
      const supervisorProjects = ProjectStorage.getSupervisorProjects(user.id);
      userProjects = supervisorProjects;
      const allTasks = ProjectStorage.getTasks();
      userTasks = allTasks.filter(task => 
        supervisorProjects.some(project => project.id === task.projectId)
      );
    } else if (user.role === 'employee') {
      userTasks = ProjectStorage.getUserTasks(user.id);
      const allProjects = ProjectStorage.getProjects();
      userProjects = allProjects.filter(project => 
        project.teamMembers.includes(user.id)
      );
    }

    setTasks(userTasks);
    setProjects(userProjects);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const createdTask = ProjectStorage.createTask({
      ...newTask,
      assignedTo: user.id,
      status: 'pending'
    });

    if (createdTask) {
      setTasks([...tasks, createdTask]);
      setShowCreateForm(false);
      setNewTask({
        projectId: '',
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedHours: 0
      });
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskType['status']) => {
    const updatedTask = ProjectStorage.updateTask(taskId, { status: newStatus });
    
    if (updatedTask) {
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));

      // Award points for completing tasks
      if (newStatus === 'completed' && user) {
        GamificationStorage.addPoints(
          user.id,
          100,
          'performance',
          `إكمال مهمة: ${updatedTask.title}`,
          taskId,
          updatedTask.projectId
        );
      }
    }
  };

  const getPriorityBadge = (priority: TaskType['priority']) => {
    const priorityConfig = {
      low: { label: 'منخفض', className: 'bg-gray-100 text-gray-800' },
      medium: { label: 'متوسط', className: 'bg-blue-100 text-blue-800' },
      high: { label: 'مرتفع', className: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'عاجل', className: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority];
    return (
      <Badge variant="default" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: TaskType['status']) => {
    const statusConfig = {
      pending: { label: 'معلق', className: 'bg-gray-100 text-gray-800' },
      'in-progress': { label: 'قيد التنفيذ', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'مكتمل', className: 'bg-green-100 text-green-800' },
      blocked: { label: 'محظور', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return (
      <Badge variant="default" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  const canCreateTasks = user && (user.role === 'admin' || user.role === 'supervisor');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة المهام</h1>
          <p className="text-gray-600">عرض وتحديث حالة المهام الموكلة إليك</p>
        </div>
        {canCreateTasks && (
          <Button onClick={() => setShowCreateForm(true)}>
            + إنشاء مهمة جديدة
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium">تصفية حسب الحالة:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="blocked">محظور</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء مهمة جديدة</CardTitle>
            <CardDescription>املأ بيانات المهمة الجديدة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المشروع</label>
                  <Select
                    value={newTask.projectId}
                    onValueChange={(value) => setNewTask({...newTask, projectId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الأولوية</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: TaskType['priority']) => setNewTask({...newTask, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفض</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="high">مرتفع</SelectItem>
                      <SelectItem value="urgent">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان المهمة</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="عنوان المهمة"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ الاستحقاق</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">وصف المهمة</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="وصف تفصيلي للمهمة"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الساعات المتوقعة</label>
                <Input
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({...newTask, estimatedHours: Number(e.target.value)})}
                  placeholder="عدد الساعات المتوقعة"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">إنشاء المهمة</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const project = projects.find(p => p.id === task.projectId);
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>المشروع: {project?.name || 'غير معروف'}</span>
                      <span>تاريخ الاستحقاق: {new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>
                      <span>الساعات المتوقعة: {task.estimatedHours}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                      >
                        بدء التنفيذ
                      </Button>
                    )}
                    {task.status === 'in-progress' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                      >
                        إكمال المهمة
                      </Button>
                    )}
                    {task.status === 'blocked' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                      >
                        إلغاء الحظر
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    آخر تحديث: {new Date(task.updatedAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">لا توجد مهام</h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? 'لا توجد مهام مخصصة لك حالياً'
                : `لا توجد مهام بحالة "${filterStatus}"`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};