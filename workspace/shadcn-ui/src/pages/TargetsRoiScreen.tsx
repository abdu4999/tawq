import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Calculator, DollarSign, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TargetsRoiScreen() {
  const [targets, setTargets] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetType, setTargetType] = useState<'employee' | 'project'>('employee');
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly',
    revenueTarget: '',
    expensesBudget: '',
    roiFormula: '(revenue - expenses) / expenses * 100',
    startDate: '',
    endDate: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = () => {
    // Mock data
    setTargets([
      {
        id: 1,
        name: 'أحمد محمد',
        type: 'employee',
        period: 'monthly',
        revenueTarget: 50000,
        currentRevenue: 35000,
        progress: 70
      },
      {
        id: 2,
        name: 'مشروع رمضان',
        type: 'project',
        period: 'annual',
        revenueTarget: 500000,
        expensesBudget: 100000,
        currentRevenue: 320000,
        currentExpenses: 75000,
        roi: 226.67,
        progress: 64
      }
    ]);
  };

  const handleCreateTarget = () => {
    toast({
      title: 'تم إنشاء الهدف',
      description: 'تم إضافة الهدف الجديد بنجاح'
    });
    setIsDialogOpen(false);
    setFormData({
      name: '',
      type: 'monthly',
      revenueTarget: '',
      expensesBudget: '',
      roiFormula: '(revenue - expenses) / expenses * 100',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              الأهداف والعائد
            </h1>
          </div>
          <p className="text-gray-600">تحديد ومتابعة الأهداف وحساب العائد على الاستثمار</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">إجمالي الأهداف</p>
                  <p className="text-3xl font-bold">{targets.length}</p>
                </div>
                <Target className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">متوسط التقدم</p>
                  <p className="text-3xl font-bold">
                    {Math.round(targets.reduce((sum, t) => sum + (t.progress || 0), 0) / targets.length)}%
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">متوسط العائد</p>
                  <p className="text-3xl font-bold">
                    {targets.find(t => t.roi)?.roi.toFixed(0) || 0}%
                  </p>
                </div>
                <Calculator className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">الإيراد المحقق</p>
                  <p className="text-2xl font-bold">
                    {targets.reduce((sum, t) => sum + (t.currentRevenue || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => { setTargetType('employee'); setIsDialogOpen(true); }} className="gap-2">
            <Users className="h-4 w-4" />
            هدف موظف
          </Button>
          <Button onClick={() => { setTargetType('project'); setIsDialogOpen(true); }} variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            هدف مشروع
          </Button>
        </div>

        {/* Targets List */}
        <div className="space-y-4">
          {targets.map((target) => (
            <Card key={target.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{target.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          target.type === 'employee' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {target.type === 'employee' ? 'موظف' : 'مشروع'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {target.period === 'monthly' ? 'شهري' : target.period === 'annual' ? 'سنوي' : 'أسبوعي'}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">تعديل الصيغة</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">هدف الإيراد</p>
                      <p className="text-xl font-bold text-blue-600">
                        {target.revenueTarget.toLocaleString()} ر.س
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">الإيراد الحالي</p>
                      <p className="text-xl font-bold text-green-600">
                        {target.currentRevenue.toLocaleString()} ر.س
                      </p>
                    </div>

                    {target.type === 'project' && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">العائد (ROI)</p>
                        <p className="text-xl font-bold text-purple-600">
                          {target.roi.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">نسبة التقدم</span>
                      <span className="font-bold">{target.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          target.progress >= 100 ? 'bg-green-500' :
                          target.progress >= 70 ? 'bg-blue-500' :
                          target.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(target.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {target.type === 'project' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                      <Calculator className="h-4 w-4" />
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        ROI = (revenue - expenses) / expenses * 100
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Target Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {targetType === 'employee' ? 'إنشاء هدف موظف' : 'إنشاء هدف مشروع'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input
                  placeholder={targetType === 'employee' ? 'اسم الموظف' : 'اسم المشروع'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الفترة</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                      <SelectItem value="annual">سنوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>هدف الإيراد (ر.س) *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.revenueTarget}
                    onChange={(e) => setFormData({ ...formData, revenueTarget: e.target.value })}
                  />
                </div>
              </div>

              {targetType === 'project' && (
                <>
                  <div className="space-y-2">
                    <Label>ميزانية المصروفات (ر.س)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.expensesBudget}
                      onChange={(e) => setFormData({ ...formData, expensesBudget: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>صيغة حساب العائد (ROI)</Label>
                    <Textarea
                      placeholder="(revenue - expenses) / expenses * 100"
                      value={formData.roiFormula}
                      onChange={(e) => setFormData({ ...formData, roiFormula: e.target.value })}
                      rows={2}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      استخدم: revenue (الإيراد), expenses (المصروفات), budget (الميزانية)
                    </p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ البداية</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ النهاية</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateTarget} disabled={!formData.name || !formData.revenueTarget}>
                إنشاء الهدف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
