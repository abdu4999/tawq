import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProjectStorage, Project } from '../lib/project-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const Projects: React.FC = () => {
  const { user, canAccess } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'active' as Project['status']
  });

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = () => {
    let userProjects: Project[] = [];
    
    if (user?.role === 'admin') {
      userProjects = ProjectStorage.getProjects();
    } else if (user?.role === 'supervisor') {
      userProjects = ProjectStorage.getSupervisorProjects(user.id);
    } else if (user?.role === 'employee') {
      const allProjects = ProjectStorage.getProjects();
      userProjects = allProjects.filter(project => 
        project.teamMembers.includes(user.id)
      );
    }

    setProjects(userProjects);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const createdProject = ProjectStorage.createProject({
      ...newProject,
      teamMembers: [],
      supervisorId: user.role === 'supervisor' ? user.id : '3' // Default supervisor
    });

    if (createdProject) {
      setProjects([...projects, createdProject]);
      setShowCreateForm(false);
      setNewProject({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: 0,
        status: 'active'
      });
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      completed: { label: 'مكتمل', variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
      'on-hold': { label: 'معلق', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'ملغي', variant: 'default' as const, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const canCreateProjects = user && (user.role === 'admin' || user.role === 'supervisor');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
          <p className="text-gray-600">عرض وإدارة جميع المشاريع النشطة</p>
        </div>
        {canCreateProjects && (
          <Button onClick={() => setShowCreateForm(true)}>
            + إنشاء مشروع جديد
          </Button>
        )}
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء مشروع جديد</CardTitle>
            <CardDescription>املأ بيانات المشروع الجديد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المشروع</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="اسم المشروع"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الميزانية</label>
                  <Input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                    placeholder="الميزانية بالريال"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ البدء</label>
                  <Input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ الانتهاء</label>
                  <Input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">وصف المشروع</label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="وصف تفصيلي للمشروع"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">حالة المشروع</label>
                <Select
                  value={newProject.status}
                  onValueChange={(value: Project['status']) => setNewProject({...newProject, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="on-hold">معلق</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">إنشاء المشروع</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {getStatusBadge(project.status)}
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الميزانية:</span>
                <span className="font-medium">{project.budget.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">فريق العمل:</span>
                <span className="font-medium">{project.teamMembers.length} عضو</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">تاريخ البدء:</span>
                <span className="font-medium">
                  {new Date(project.startDate).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">تاريخ الانتهاء:</span>
                <span className="font-medium">
                  {new Date(project.endDate).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  عرض التفاصيل
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium mb-2">لا توجد مشاريع</h3>
            <p className="text-gray-500 mb-4">
              {canCreateProjects 
                ? 'ابدأ بإنشاء مشروعك الأول' 
                : 'لا توجد مشاريع مخصصة لك حالياً'
              }
            </p>
            {canCreateProjects && (
              <Button onClick={() => setShowCreateForm(true)}>
                إنشاء مشروع جديد
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};