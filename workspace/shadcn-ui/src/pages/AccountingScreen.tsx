import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { formatDateDMY } from '@/lib/date-utils';
import { supabaseAPI, Transaction } from '@/lib/supabaseClient';
import { useNotifications } from '@/components/NotificationSystem';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  FileText,
  CreditCard,
  Wallet,
  Receipt
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'all' | 'income' | 'expense';
type PeriodFilter = '30' | '90' | '365' | 'all';

interface FilterState {
  type: FilterType;
  period: PeriodFilter;
  category: string;
  search: string;
}

const FILTER_DEFAULTS: FilterState = {
  type: 'all',
  period: '30',
  category: 'all',
  search: ''
};

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  '30': 'آخر 30 يوم',
  '90': 'آخر 90 يوم',
  '365': 'آخر 12 شهر',
  all: 'كامل السجل'
};

export default function AccountingScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: '',
    project: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();
  const { addErrorNotification } = useNotifications();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await supabaseAPI.getTransactions();
      setTransactions(data);
      calculateTotals(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المعاملات المالية',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (data: Transaction[]) => {
    const income = data
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = data
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);
  };

  const handleCreateTransaction = async () => {
    try {
      if (!formData.description || !formData.amount || !formData.category) {
        toast({
          title: 'خطأ',
          description: 'الرجاء ملء جميع الحقول المطلوبة',
          variant: 'destructive'
        });
        return;
      }

      setIsSaving(true);
      
      await supabaseAPI.createTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        project: formData.project || undefined,
        date: formData.date
      });
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        type: 'income',
        category: '',
        project: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsCreateDialogOpen(false);
      
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        'تمت إضافة المعاملة بنجاح'
      );
      
      loadTransactions();
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في حفظ المعاملة',
        context: 'AccountingScreen - Create',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء حفظ المعاملة',
        payload: formData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المحاسبة والمالية</h1>
          <p className="text-gray-500 mt-2">إدارة المعاملات المالية والميزانية</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <DollarSign className="h-4 w-4" />
          تسجيل معاملة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100">إجمالي الإيرادات</p>
                <h3 className="text-3xl font-bold mt-2">{totalIncome.toLocaleString()}</h3>
                <p className="text-sm text-green-100 mt-1">ر.س</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-100">إجمالي المصروفات</p>
                <h3 className="text-3xl font-bold mt-2">{totalExpenses.toLocaleString()}</h3>
                <p className="text-sm text-red-100 mt-1">ر.س</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100">صافي الرصيد</p>
                <h3 className="text-3xl font-bold mt-2">{(totalIncome - totalExpenses).toLocaleString()}</h3>
                <p className="text-sm text-blue-100 mt-1">ر.س</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDateDMY(transaction.date)}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>{transaction.project || '-'}</TableCell>
                    <TableCell className="font-bold">
                      {transaction.amount.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                        {transaction.type === 'income' ? 'إيراد' : 'مصروف'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد معاملات مسجلة
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسجيل معاملة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>نوع المعاملة</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">إيراد</SelectItem>
                  <SelectItem value="expense">مصروف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المبلغ</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  type="number" 
                  className="pr-10" 
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input 
                placeholder="وصف المعاملة"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === 'income' ? (
                    <>
                      <SelectItem value="تبرعات">تبرعات</SelectItem>
                      <SelectItem value="منح">منح</SelectItem>
                      <SelectItem value="استثمارات">استثمارات</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="رواتب">رواتب</SelectItem>
                      <SelectItem value="تشغيل">تشغيل</SelectItem>
                      <SelectItem value="تسويق">تسويق</SelectItem>
                      <SelectItem value="مشاريع">مشاريع</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المشروع (اختياري)</Label>
              <Input 
                placeholder="اسم المشروع المرتبط"
                value={formData.project}
                onChange={(e) => setFormData({...formData, project: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>إلغاء</Button>
            <LoadingButton loading={isSaving} onClick={handleCreateTransaction}>
              حفظ المعاملة
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
