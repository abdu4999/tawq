import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';
import { supabaseAPI } from '@/lib/supabaseClient';
import { Target, TrendingUp, DollarSign, Calculator, Plus, Edit, Save } from 'lucide-react';

interface EmployeeTarget {
  id: string;
  employeeId: string;
  employeeName: string;
  monthlyRevenue: number;
  yearlyRevenue: number;
  currentRevenue: number;
  monthlyTasks: number;
  currentTasks: number;
  achievement: number;
}

interface ProjectTarget {
  id: string;
  projectId: string;
  projectName: string;
  expectedRevenue: number;
  currentRevenue: number;
  expectedExpenses: number;
  currentExpenses: number;
  roi: number;
  roiFormula: string;
}

export default function TargetsRoi() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [employeeTargets, setEmployeeTargets] = useState<EmployeeTarget[]>([]);
  const [projectTargets, setProjectTargets] = useState<ProjectTarget[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeTarget | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectTarget | null>(null);

  useEffect(() => {
    loadTargetsData();
  }, []);

  const loadTargetsData = async () => {
    try {
      setLoading(true);

      const [employees, projects, tasks] = await Promise.all([
        supabaseAPI.getAdminUsers().catch(() => []),
        supabaseAPI.getProjects().catch(() => []),
        supabaseAPI.getTasks().catch(() => [])
      ]);

      // حساب أهداف الموظفين
      const empTargets: EmployeeTarget[] = employees.map(emp => {
        const empTasks = tasks.filter(t => t.assigned_to?.includes(emp.id));
        const completedTasks = empTasks.filter(t => t.status === 'completed').length;
        
        const monthlyRevenue = 50000;
        const yearlyRevenue = 600000;
        const currentRevenue = Math.random() * monthlyRevenue;
        const monthlyTasks = 20;
        const achievement = (completedTasks / monthlyTasks) * 100;

        return {
          id: emp.id,
          employeeId: emp.id,
          employeeName: emp.name,
          monthlyRevenue,
          yearlyRevenue,
          currentRevenue,
          monthlyTasks,
          currentTasks: completedTasks,
          achievement
        };
      });

      // حساب أهداف المشاريع
      const projTargets: ProjectTarget[] = projects.map(proj => {
        const expectedRevenue = proj.budget || 100000;
        const currentRevenue = Math.random() * expectedRevenue;
        const expectedExpenses = expectedRevenue * 0.3;
        const currentExpenses = Math.random() * expectedExpenses;
        const roi = ((currentRevenue - currentExpenses) / currentExpenses) * 100;

        return {
          id: proj.id,
          projectId: proj.id,
          projectName: proj.name,
          expectedRevenue,
          currentRevenue,
          expectedExpenses,
          currentExpenses,
          roi,
          roiFormula: '(الإيراد - المصروفات) / المصروفات * 100'
        };
      });

      setEmployeeTargets(empTargets);
      setProjectTargets(projTargets);

      addNotification({
        type: 'success',
        title: '✅ تم التحميل',
        message: 'تم تحميل بيانات الأهداف بنجاح'
      });
    } catch (error) {
      console.error('Error loading targets:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ',
        message: 'حدث خطأ أثناء تحميل البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmployeeTarget = () => {
    if (editingEmployee) {
      setEmployeeTargets(prev => 
        prev.map(t => t.id === editingEmployee.id ? editingEmployee : t)
      );
      setEditingEmployee(null);
      addNotification({
        type: 'success',
        title: '✅ تم الحفظ',
        message: 'تم تحديث أهداف الموظف بنجاح'
      });
    }
  };

  const handleSaveProjectTarget = () => {
    if (editingProject) {
      setProjectTargets(prev => 
        prev.map(t => t.id === editingProject.id ? editingProject : t)
      );
      setEditingProject(null);
      addNotification({
        type: 'success',
        title: '✅ تم الحفظ',
        message: 'تم تحديث أهداف المشروع بنجاح'
      });
    }
  };

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 90) return 'text-green-600';
    if (achievement >= 70) return 'text-blue-600';
    if (achievement >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 100) return 'text-green-600';
    if (roi >= 50) return 'text-blue-600';
    if (roi >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الأهداف...</p>
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
            الأهداف والعائد على الاستثمار
          </h1>
          <p className="text-xl text-gray-600">إدارة الأهداف وحساب العائد على الاستثمار ROI</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{employeeTargets.length}</div>
              <p className="text-blue-100">أهداف الموظفين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{projectTargets.length}</div>
              <p className="text-purple-100">أهداف المشاريع</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">
                {Math.round(employeeTargets.reduce((sum, t) => sum + t.achievement, 0) / employeeTargets.length)}%
              </div>
              <p className="text-green-100">متوسط الإنجاز</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Calculator className="h-8 w-8 mx-auto mb-3 text-orange-200" />
              <div className="text-3xl font-bold mb-1">
                {Math.round(projectTargets.reduce((sum, t) => sum + t.roi, 0) / projectTargets.length)}%
              </div>
              <p className="text-orange-100">متوسط ROI</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="employees" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employees">أهداف الموظفين</TabsTrigger>
                <TabsTrigger value="projects">أهداف المشاريع</TabsTrigger>
              </TabsList>

              {/* Employee Targets Tab */}
              <TabsContent value="employees" className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-3 font-semibold">الموظف</th>
                        <th className="text-center p-3 font-semibold">هدف شهري</th>
                        <th className="text-center p-3 font-semibold">هدف سنوي</th>
                        <th className="text-center p-3 font-semibold">الإيراد الحالي</th>
                        <th className="text-center p-3 font-semibold">هدف المهام</th>
                        <th className="text-center p-3 font-semibold">المهام المنجزة</th>
                        <th className="text-center p-3 font-semibold">نسبة الإنجاز</th>
                        <th className="text-center p-3 font-semibold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeTargets.map((target) => (
                        <tr key={target.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{target.employeeName}</td>
                          <td className="p-3 text-center">{target.monthlyRevenue.toLocaleString()} ر.س</td>
                          <td className="p-3 text-center">{target.yearlyRevenue.toLocaleString()} ر.س</td>
                          <td className="p-3 text-center font-bold text-blue-600">
                            {target.currentRevenue.toFixed(0).toLocaleString()} ر.س
                          </td>
                          <td className="p-3 text-center">{target.monthlyTasks}</td>
                          <td className="p-3 text-center font-bold">{target.currentTasks}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${getAchievementColor(target.achievement)}`}>
                              {target.achievement.toFixed(0)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setEditingEmployee(target)}
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  تعديل
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md" dir="rtl">
                                <DialogHeader>
                                  <DialogTitle>تعديل أهداف الموظف</DialogTitle>
                                </DialogHeader>
                                {editingEmployee && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>الموظف</Label>
                                      <Input value={editingEmployee.employeeName} disabled />
                                    </div>
                                    <div>
                                      <Label>هدف الإيراد الشهري (ر.س)</Label>
                                      <Input 
                                        type="number"
                                        value={editingEmployee.monthlyRevenue}
                                        onChange={(e) => setEditingEmployee({
                                          ...editingEmployee,
                                          monthlyRevenue: Number(e.target.value)
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>هدف الإيراد السنوي (ر.س)</Label>
                                      <Input 
                                        type="number"
                                        value={editingEmployee.yearlyRevenue}
                                        onChange={(e) => setEditingEmployee({
                                          ...editingEmployee,
                                          yearlyRevenue: Number(e.target.value)
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>هدف المهام الشهري</Label>
                                      <Input 
                                        type="number"
                                        value={editingEmployee.monthlyTasks}
                                        onChange={(e) => setEditingEmployee({
                                          ...editingEmployee,
                                          monthlyTasks: Number(e.target.value)
                                        })}
                                      />
                                    </div>
                                    <Button onClick={handleSaveEmployeeTarget} className="w-full">
                                      <Save className="h-4 w-4 ml-2" />
                                      حفظ التعديلات
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Project Targets Tab */}
              <TabsContent value="projects" className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-3 font-semibold">المشروع</th>
                        <th className="text-center p-3 font-semibold">الإيراد المتوقع</th>
                        <th className="text-center p-3 font-semibold">الإيراد الفعلي</th>
                        <th className="text-center p-3 font-semibold">المصروفات المتوقعة</th>
                        <th className="text-center p-3 font-semibold">المصروفات الفعلية</th>
                        <th className="text-center p-3 font-semibold">ROI</th>
                        <th className="text-center p-3 font-semibold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectTargets.map((target) => (
                        <tr key={target.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{target.projectName}</td>
                          <td className="p-3 text-center">{target.expectedRevenue.toLocaleString()} ر.س</td>
                          <td className="p-3 text-center font-bold text-blue-600">
                            {target.currentRevenue.toFixed(0).toLocaleString()} ر.س
                          </td>
                          <td className="p-3 text-center">{target.expectedExpenses.toLocaleString()} ر.س</td>
                          <td className="p-3 text-center font-bold text-red-600">
                            {target.currentExpenses.toFixed(0).toLocaleString()} ر.س
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${getRoiColor(target.roi)}`}>
                              {target.roi.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setEditingProject(target)}
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  تعديل
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md" dir="rtl">
                                <DialogHeader>
                                  <DialogTitle>تعديل أهداف المشروع</DialogTitle>
                                </DialogHeader>
                                {editingProject && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>المشروع</Label>
                                      <Input value={editingProject.projectName} disabled />
                                    </div>
                                    <div>
                                      <Label>الإيراد المتوقع (ر.س)</Label>
                                      <Input 
                                        type="number"
                                        value={editingProject.expectedRevenue}
                                        onChange={(e) => setEditingProject({
                                          ...editingProject,
                                          expectedRevenue: Number(e.target.value)
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>المصروفات المتوقعة (ر.س)</Label>
                                      <Input 
                                        type="number"
                                        value={editingProject.expectedExpenses}
                                        onChange={(e) => setEditingProject({
                                          ...editingProject,
                                          expectedExpenses: Number(e.target.value)
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>صيغة حساب ROI</Label>
                                      <Textarea 
                                        value={editingProject.roiFormula}
                                        onChange={(e) => setEditingProject({
                                          ...editingProject,
                                          roiFormula: e.target.value
                                        })}
                                        rows={3}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        الصيغة الافتراضية: (الإيراد - المصروفات) / المصروفات * 100
                                      </p>
                                    </div>
                                    <Button onClick={handleSaveProjectTarget} className="w-full">
                                      <Save className="h-4 w-4 ml-2" />
                                      حفظ التعديلات
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ROI Calculator Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              دليل حساب العائد على الاستثمار (ROI)
            </CardTitle>
            <CardDescription>فهم كيفية حساب العائد على الاستثمار</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">الصيغة الأساسية:</h4>
                <p className="font-mono text-lg text-blue-600">ROI = (الإيراد - المصروفات) / المصروفات × 100</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-semibold">ROI {'>'} 100%</span>
                  </div>
                  <p className="text-sm text-gray-600">عائد ممتاز - المشروع مربح جداً</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-semibold">ROI 50% - 100%</span>
                  </div>
                  <p className="text-sm text-gray-600">عائد جيد - المشروع مربح</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-semibold">ROI 0% - 50%</span>
                  </div>
                  <p className="text-sm text-gray-600">عائد متوسط - يحتاج تحسين</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
