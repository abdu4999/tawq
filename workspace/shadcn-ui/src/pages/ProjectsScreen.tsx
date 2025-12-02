import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Sidebar';
import { supabaseAPI, type Project } from '@/lib/supabaseClient';
import { 
  FolderKanban, 
  Plus, 
  Users as UsersIcon, 
  Target,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    budget: '',
    revenue: '',
    team_size: '',
    deadline: '',
    progress: '0'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await supabaseAPI.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('خطأ في تحميل المشاريع:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المشاريع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const projectData: any = {
        name: formData.name,
        status: formData.status,
      };

      if (formData.description) projectData.description = formData.description;
      if (formData.budget) projectData.budget = parseFloat(formData.budget);
      if (formData.revenue) projectData.revenue = parseFloat(formData.revenue);
      if (formData.team_size) projectData.team_size = parseInt(formData.team_size);
      if (formData.deadline) projectData.deadline = formData.deadline;
      if (formData.progress) projectData.progress = parseInt(formData.progress);

      await supabaseAPI.createProject(projectData);
      
      toast({
        title: 'نجح',
        description: 'تم إنشاء المشروع بنجاح',
      });

      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        status: 'active',
        budget: '',
        revenue: '',
        team_size: '',
        deadline: '',
        progress: '0'
      });
      loadProjects();
    } catch (error) {
      console.error('خطأ في إنشاء المشروع:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء المشروع',
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'on_hold': return 'متوقف';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FolderKanban className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              إدارة المشاريع
            </h1>
          </div>
          <p className="text-gray-600">متابعة وتقييم جميع المشاريع</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">إجمالي المشاريع</p>
                  <p className="text-3xl font-bold">{projects.length}</p>
                </div>
                <FolderKanban className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">المشاريع النشطة</p>
                  <p className="text-3xl font-bold">
                    {projects.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">المشاريع المكتملة</p>
                  <p className="text-3xl font-bold">
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <Target className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + (p.revenue || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-100">ريال سعودي</p>
                </div>
                <DollarSign className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>المشاريع</span>
              <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                مشروع جديد
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد مشاريع</p>
                </div>
              ) : (
                projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span className="text-lg">{project.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        {project.budget && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">الميزانية:</span>
                            <span className="font-semibold text-blue-600">
                              {project.budget.toLocaleString()} ر.س
                            </span>
                          </div>
                        )}
                        
                        {project.revenue && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">الإيراد:</span>
                            <span className="font-semibold text-green-600">
                              {project.revenue.toLocaleString()} ر.س
                            </span>
                          </div>
                        )}
                        
                        {project.team_size && (
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{project.team_size} موظف</span>
                          </div>
                        )}
                        
                        {project.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(project.deadline).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress */}
                      {project.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">التقدم</span>
                            <span className="font-semibold">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <Button variant="outline" className="w-full" onClick={() => handleViewDetails(project)}>
                        عرض التفاصيل
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Project Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء مشروع جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المشروع *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم المشروع"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف المشروع"
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
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="on_hold">متوقف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">الميزانية (ر.س)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="team_size">حجم الفريق</Label>
                  <Input
                    id="team_size"
                    type="number"
                    value={formData.team_size}
                    onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">تاريخ الانتهاء</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="progress">نسبة الإنجاز (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateProject} disabled={!formData.name}>
                إنشاء المشروع
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Project Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>تفاصيل المشروع</DialogTitle>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-lg font-bold mb-2">{selectedProject.name}</h3>
                  {selectedProject.description && (
                    <p className="text-gray-600">{selectedProject.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الحالة:</span>
                    <span className={`mr-2 px-2 py-1 rounded ${getStatusColor(selectedProject.status)}`}>
                      {getStatusText(selectedProject.status)}
                    </span>
                  </div>
                  
                  {selectedProject.budget && (
                    <div>
                      <span className="text-gray-600">الميزانية:</span>
                      <span className="mr-2 font-bold text-blue-600">
                        {selectedProject.budget.toLocaleString()} ر.س
                      </span>
                    </div>
                  )}
                  
                  {selectedProject.revenue && (
                    <div>
                      <span className="text-gray-600">الإيراد:</span>
                      <span className="mr-2 font-bold text-green-600">
                        {selectedProject.revenue.toLocaleString()} ر.س
                      </span>
                    </div>
                  )}
                  
                  {selectedProject.team_size && (
                    <div>
                      <span className="text-gray-600">الفريق:</span>
                      <span className="mr-2 font-semibold">
                        {selectedProject.team_size} موظف
                      </span>
                    </div>
                  )}
                  
                  {selectedProject.deadline && (
                    <div>
                      <span className="text-gray-600">الموعد النهائي:</span>
                      <span className="mr-2 font-semibold">
                        {new Date(selectedProject.deadline).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  )}
                  
                  {selectedProject.progress !== undefined && (
                    <div>
                      <span className="text-gray-600">التقدم:</span>
                      <span className="mr-2 font-bold text-purple-600">
                        {selectedProject.progress}%
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedProject.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                  </div>
                )}
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
