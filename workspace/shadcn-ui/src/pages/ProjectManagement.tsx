import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateDMY } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';
import { supabaseAPI, Project, Employee } from '@/lib/supabaseClient';
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Search,
  Eye,
  BarChart3
} from 'lucide-react';

export default function ProjectManagement() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: 0,
    start_date: '',
    end_date: '',
    manager_id: '',
    status: 'planning' as const,
    progress: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, employeesData] = await Promise.all([
        supabaseAPI.getProjects(),
        supabaseAPI.getEmployees()
      ]);
      setProjects(projectsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في تحميل البيانات',
        message: 'حدث خطأ أثناء تحميل البيانات من قاعدة البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = async () => {
    try {
      // Validation
      if (!newProject.name.trim()) {
        addNotification({
          type: 'warning',
          title: '⚠️ خطأ في البيانات',
          message: 'يرجى إدخال اسم المشروع'
        });
        return;
      }

      setIsSaving(true);
      
      const projectData = {
        ...newProject,
        manager_id: newProject.manager_id || null,
        start_date: newProject.start_date || null,
        end_date: newProject.end_date || null
      };
      
      const createdProject = await supabaseAPI.createProject(projectData);
      setProjects([createdProject, ...projects]);
      
      // Reset form
      setNewProject({
        name: '',
        description: '',
        budget: 0,
        start_date: '',
        end_date: '',
        manager_id: '',
        status: 'planning',
        progress: 0
      });
      setIsCreateDialogOpen(false);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم إنشاء المشروع "${createdProject.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في إنشاء المشروع',
        context: 'ProjectManagement - Create',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء إنشاء المشروع',
        payload: newProject,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      setIsSaving(true);
      
      const updatedProject = await supabaseAPI.updateProject(selectedProject.id, selectedProject);
      setProjects(projects.map(project => project.id === selectedProject.id ? updatedProject : project));
      
      setIsEditDialogOpen(false);
      setSelectedProject(null);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم تحديث المشروع "${updatedProject.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في تحديث المشروع',
        context: 'ProjectManagement - Update',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء تحديث المشروع',
        payload: selectedProject,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      await supabaseAPI.deleteProject(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      
      addNotification({
        type: 'warning',
        title: '🗑️ تم حذف المشروع',
        message: `تم حذف المشروع "${projectName}"`,
        duration: 4000,
        action: {
          label: 'تراجع',
          onClick: () => {
            loadData();
            addNotification({
              type: 'info',
              title: '↩️ تم التراجع',
              message: 'تم إلغاء عملية الحذف'
            });
          }
        }
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في الحذف',
        message: 'حدث خطأ أثناء حذف المشروع'
      });
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEmployeeById = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  };

  // Calculate statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل المشاريع من قاعدة البيانات...</p>
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
            إدارة المشاريع
          </h1>
          <p className="text-xl text-gray-600">تخطيط ومتابعة المشاريع الخيرية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <FolderOpen className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{projectStats.total}</div>
              <p className="text-blue-100">إجمالي المشاريع</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{projectStats.active}</div>
              <p className="text-green-100">نشطة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{projectStats.completed}</div>
              <p className="text-purple-100">مكتملة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-yellow-200" />
              <div className="text-3xl font-bold mb-1">{projectStats.planning}</div>
              <p className="text-yellow-100">تحت التخطيط</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-emerald-200" />
              <div className="text-2xl font-bold mb-1">{projectStats.totalBudget.toLocaleString()}</div>
              <p className="text-emerald-100">إجمالي الميزانية</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-indigo-200" />
              <div className="text-3xl font-bold mb-1">{projectStats.avgProgress}%</div>
              <p className="text-indigo-100">متوسط التقدم</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في المشاريع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="planning">تحت التخطيط</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="on_hold">متوقف</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مشروع جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة مشروع جديد</DialogTitle>
                    <DialogDescription>
                      أدخل تفاصيل المشروع الجديد
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم المشروع</Label>
                      <Input
                        id="name"
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        placeholder="أدخل اسم المشروع"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">الوصف</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        placeholder="وصف تفصيلي للمشروع"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">الميزانية</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={newProject.budget}
                          onChange={(e) => setNewProject({...newProject, budget: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="progress">نسبة التقدم (%)</Label>
                        <Input
                          id="progress"
                          type="number"
                          min="0"
                          max="100"
                          value={newProject.progress}
                          onChange={(e) => setNewProject({...newProject, progress: parseInt(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">تاريخ البداية</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newProject.start_date}
                          onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">تاريخ النهاية</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newProject.end_date}
                          onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">الحالة</Label>
                        <Select value={newProject.status} onValueChange={(value: Project['status']) => setNewProject({...newProject, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">تحت التخطيط</SelectItem>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="on_hold">متوقف</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="manager">مدير المشروع</Label>
                        <Select value={newProject.manager_id} onValueChange={(value) => setNewProject({...newProject, manager_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المدير" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">بدون تعيين</SelectItem>
                            {employees.map(employee => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSaving}>
                      إلغاء
                    </Button>
                    <LoadingButton 
                      onClick={handleCreateProject}
                      loading={isSaving}
                      loadingText="جاري الحفظ..."
                      disabled={!newProject.name}
                    >
                      إنشاء المشروع
                    </LoadingButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const manager = project.manager_id ? getEmployeeById(project.manager_id) : null;
            
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FolderOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {manager ? `مدير المشروع: ${manager.name}` : 'بدون مدير'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status === 'completed' ? 'مكتمل' :
                       project.status === 'active' ? 'نشط' :
                       project.status === 'planning' ? 'تحت التخطيط' :
                       project.status === 'on_hold' ? 'متوقف' : 'ملغي'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">التقدم</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">الميزانية:</span>
                      <span className="font-medium">{project.budget.toLocaleString()}</span>
                    </div>
                    {project.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">البداية:</span>
                        <span className="font-medium">{new Date(project.start_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </div>
                  
                  {project.end_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <span className="text-gray-600">النهاية:</span>
                      <span className="font-medium">{new Date(project.end_date).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      أنشئ: {new Date(project.created_at).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          addNotification({
                            type: 'info',
                            title: '👁️ عرض المشروع',
                            message: `عرض تفاصيل المشروع: ${project.name}`
                          });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-600">لا توجد مشاريع</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'لا توجد مشاريع تطابق معايير البحث' 
                      : 'لم يتم إنشاء أي مشاريع بعد'}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إنشاء أول مشروع
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل المشروع</DialogTitle>
              <DialogDescription>
                تحديث تفاصيل المشروع
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">اسم المشروع</Label>
                  <Input
                    id="edit-name"
                    value={selectedProject.name}
                    onChange={(e) => setSelectedProject({...selectedProject, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">الوصف</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedProject.description || ''}
                    onChange={(e) => setSelectedProject({...selectedProject, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-budget">الميزانية</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      value={selectedProject.budget}
                      onChange={(e) => setSelectedProject({...selectedProject, budget: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-progress">نسبة التقدم (%)</Label>
                    <Input
                      id="edit-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={selectedProject.progress}
                      onChange={(e) => setSelectedProject({...selectedProject, progress: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-start_date">تاريخ البداية</Label>
                    <Input
                      id="edit-start_date"
                      type="date"
                      value={selectedProject.start_date || ''}
                      onChange={(e) => setSelectedProject({...selectedProject, start_date: e.target.value || null})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-end_date">تاريخ النهاية</Label>
                    <Input
                      id="edit-end_date"
                      type="date"
                      value={selectedProject.end_date || ''}
                      onChange={(e) => setSelectedProject({...selectedProject, end_date: e.target.value || null})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-status">الحالة</Label>
                    <Select value={selectedProject.status} onValueChange={(value: Project['status']) => setSelectedProject({...selectedProject, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">تحت التخطيط</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="on_hold">متوقف</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-manager">مدير المشروع</Label>
                    <Select value={selectedProject.manager_id || ''} onValueChange={(value) => setSelectedProject({...selectedProject, manager_id: value || null})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدير" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون تعيين</SelectItem>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <LoadingButton 
                onClick={handleUpdateProject}
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={!selectedProject?.name}
              >
                حفظ التغييرات
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}