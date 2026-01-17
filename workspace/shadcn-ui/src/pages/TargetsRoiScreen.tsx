import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target as TargetIcon, TrendingUp, Calculator, DollarSign, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseAPI, Target } from '@/lib/supabaseClient';

const defaultFormState = {
  name: '',
  period: 'monthly' as 'weekly' | 'monthly' | 'annual',
  revenueTarget: '',
  expensesBudget: '',
  roiFormula: '(revenue - expenses) / expenses * 100',
  startDate: '',
  endDate: ''
};

export default function TargetsRoiScreen() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [targetType, setTargetType] = useState<'employee' | 'project'>('employee');
  const [formData, setFormData] = useState(defaultFormState);
  const { toast } = useToast();

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      setLoading(true);
      const data = await supabaseAPI.getTargets();
      setTargets(data || []);
    } catch (error) {
      console.error('Error loading targets:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر تحميل الأهداف من قاعدة البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormState);
    setTargetType('employee');
  };

  const handleCreateTarget = async () => {
    if (!formData.name.trim() || !formData.revenueTarget.trim()) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال الاسم وهدف الإيراد',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSaving(true);
      await supabaseAPI.createTarget({
        name: formData.name.trim(),
        type: targetType,
        period: formData.period,
        revenue_target: Number(formData.revenueTarget) || 0,
        current_revenue: 0,
        expenses_budget: formData.expensesBudget ? Number(formData.expensesBudget) : null,
        current_expenses: 0,
        roi: 0,
        roi_formula: formData.roiFormula,
        progress: 0,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null
      });

      toast({
        title: 'تم الإنشاء',
        description: 'تم إضافة الهدف الجديد بنجاح'
      });

      setIsDialogOpen(false);
      resetForm();
      loadTargets();
    } catch (error) {
      console.error('Error creating target:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الهدف',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const averageProgress = useMemo(() => {
    if (!targets.length) return 0;
    const total = targets.reduce((sum, t) => sum + (t.progress || 0), 0);
    return Math.round(total / targets.length);
  }, [targets]);

  const averageRoi = useMemo(() => {
    const roiTargets = targets.filter((t) => typeof t.roi === 'number');
    if (!roiTargets.length) return 0;
    const total = roiTargets.reduce((sum, t) => sum + (t.roi || 0), 0);
    return Math.round(total / roiTargets.length);
  }, [targets]);

  const totalRevenue = useMemo(() => {
    return targets.reduce((sum, t) => sum + (t.current_revenue || 0), 0);
  }, [targets]);

  const formatCurrency = (value?: number) => (value || 0).toLocaleString();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الأهداف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TargetIcon className="h-12 w-12 text-blue-600" />
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
              <TargetIcon className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">متوسط التقدم</p>
                <p className="text-3xl font-bold">{averageProgress}%</p>
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
                <p className="text-3xl font-bold">{averageRoi}%</p>
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
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)} ر.س</p>
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
          <TargetIcon className="h-4 w-4" />
          هدف مشروع
        </Button>
      </div>

      {/* Targets List */}
      <div className="space-y-4">
        {targets.map((target) => {
          const progressValue = target.progress || 0;
          const revenueTarget = target.revenue_target || 0;
          const currentRevenue = target.current_revenue || 0;
          const deadlineDays = target.end_date ? Math.ceil((new Date(target.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

          return (
            <Card key={target.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
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
                      {deadlineDays !== null && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {deadlineDays} يوم متبقي
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">تعديل الصيغة</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">هدف الإيراد</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(revenueTarget)} ر.س
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">الإيراد الحالي</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(currentRevenue)} ر.س
                    </p>
                  </div>

                  {target.type === 'project' && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">العائد (ROI)</p>
                      <p className="text-xl font-bold text-purple-600">
                        {(target.roi || 0).toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">نسبة التقدم</span>
                    <span className="font-bold">{progressValue}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        progressValue >= 100 ? 'bg-green-500' :
                        progressValue >= 70 ? 'bg-blue-500' :
                        progressValue >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(progressValue, 100)}%` }}
                    />
                  </div>
                </div>

                {target.type === 'project' && target.roi_formula && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                    <Calculator className="h-4 w-4" />
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      ROI = {target.roi_formula}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {!targets.length && (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              لا توجد أهداف مسجلة حالياً
            </CardContent>
          </Card>
        )}
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
                <Select value={formData.period} onValueChange={(value: 'weekly' | 'monthly' | 'annual') => setFormData({ ...formData, period: value })}>
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
                    استخدم المتغيرات: revenue (الإيراد), expenses (المصروفات), budget (الميزانية)
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
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleCreateTarget} disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : 'إنشاء الهدف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
