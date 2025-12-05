import { useState, useEffect } from 'react';
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
import { formatDateDMY } from '@/lib/date-utils';
import { supabase } from '@/lib/supabase';
import { errorStorage } from '@/lib/error-storage';
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

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  project?: string;
}

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
      // Mock data - replace with actual Supabase query
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2025-12-01',
          description: 'تبرع من حملة رمضان',
          amount: 50000,
          type: 'income',
          category: 'تبرعات',
          project: 'حملة رمضان'
        },
        {
          id: '2',
          date: '2025-12-02',
          description: 'رواتب الموظفين',
          amount: 30000,
          type: 'expense',
          category: 'رواتب'
        },
        {
          id: '3',
          date: '2025-12-02',
          description: 'تبرع مشروع بناء المساجد',
          amount: 75000,
          type: 'income',
          category: 'تبرعات',
          project: 'بناء المساجد'
        },
        {
          id: '4',
          date: '2025-12-03',
          description: 'مصاريف تشغيلية',
          amount: 5000,
          type: 'expense',
          category: 'تشغيل'
        },
      ];

      setTransactions(mockTransactions);
      
      const income = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setTotalIncome(income);
      setTotalExpenses(expenses);
    } catch (error) {
      console.error('خطأ في تحميل المعاملات:', error);
      
      // Log error to system with notification
      if (error instanceof Error) {
        await addErrorNotification(error, 'Accounting - Load Transactions');
      }
      
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المعاملات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      // Validate inputs
      if (!formData.description || !formData.amount || !formData.category || !formData.date) {
        toast({
          title: 'خطأ',
          description: 'الرجاء ملء جميع الحقول المطلوبة',
          variant: 'destructive'
        });
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'خطأ',
          description: 'الرجاء إدخال مبلغ صحيح',
          variant: 'destructive'
        });
        return;
      }

      setIsSaving(true);

      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: formData.date,
        description: formData.description,
        amount: amount,
        type: formData.type,
        category: formData.category,
        project: formData.project || undefined
      };

      // Update state
      setTransactions([newTransaction, ...transactions]);
      
      if (formData.type === 'income') {
        setTotalIncome(prev => prev + amount);
      } else {
        setTotalExpenses(prev => prev + amount);
      }
      
      // Reset form FIRST
      setFormData({
        description: '',
        amount: '',
        type: 'income',
        category: '',
        project: '',
        date: new Date().toISOString().split('T')[0]
      });

      // Then close dialog
      setIsCreateDialogOpen(false);
      
      // Show success message with enhanced notification
      showSuccessNotification(
        'تم حفظ المعاملة بنجاح ✅',
        `تمت إضافة ${formData.type === 'income' ? 'إيراد' : 'مصروف'} بمبلغ ${amount.toLocaleString()} ر.س`
      );
      
    } catch (error) {
      // Log error with reference number
      await handleApiError(error, {
        message: 'فشل في حفظ المعاملة',
        context: 'Accounting - Create Transaction',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء حفظ المعاملة',
        payload: formData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'جاري التصدير',
      description: 'يتم تصدير التقرير بتنسيق Excel...',
    });
    
    // Export logic would go here
    setTimeout(() => {
      toast({
        title: 'تم التصدير',
        description: 'تم تنزيل التقرير بنجاح',
      });
    }, 1500);
  };

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-12 w-12 text-green-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              النظام المحاسبي
            </h1>
          </div>
          <p className="text-gray-600">إدارة شاملة للإيرادات والمصروفات</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold">{totalIncome.toLocaleString()}</p>
                  <p className="text-xs text-green-100">ريال سعودي</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-100">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold">{totalExpenses.toLocaleString()}</p>
                  <p className="text-xs text-red-100">ريال سعودي</p>
                </div>
                <TrendingDown className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${netBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">الصافي</p>
                  <p className="text-2xl font-bold">{netBalance.toLocaleString()}</p>
                  <p className="text-xs text-blue-100">ريال سعودي</p>
                </div>
                <Wallet className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">عدد المعاملات</p>
                  <p className="text-3xl font-bold">{transactions.length}</p>
                </div>
                <Receipt className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>سجل المعاملات</span>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExportReport}>
                  <FileText className="h-4 w-4" />
                  تصدير تقرير
                </Button>
                <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                  <CreditCard className="h-4 w-4" />
                  معاملة جديدة
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>النوع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDateDMY(transaction.date)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell>{transaction.project || '-'}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'} {transaction.amount.toLocaleString()} ر.س
                        </span>
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
            )}
          </CardContent>
        </Card>

        {/* Categories Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-6 w-6" />
                تصنيف الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['تبرعات', 'رعايات', 'استثمارات'].map((category, index) => {
                  const amount = [125000, 50000, 20000][index];
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-semibold text-gray-800">{category}</span>
                      <span className="text-lg font-bold text-green-600">{amount.toLocaleString()} ر.س</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TrendingDown className="h-6 w-6" />
                تصنيف المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['رواتب', 'تشغيل', 'تسويق'].map((category, index) => {
                  const amount = [30000, 5000, 3000][index];
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="font-semibold text-gray-800">{category}</span>
                      <span className="text-lg font-bold text-red-600">{amount.toLocaleString()} ر.س</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Transaction Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة معاملة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع المعاملة *</Label>
                  <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
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
                  <Label htmlFor="amount">المبلغ (ر.س) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">الوصف *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف المعاملة"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="مثال: تبرعات، رواتب، تشغيل"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project">المشروع (اختياري)</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="اسم المشروع"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSaving}
              >
                إلغاء
              </Button>
              <LoadingButton 
                onClick={handleCreateTransaction} 
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={!formData.description || !formData.amount || !formData.category}
              >
                إضافة المعاملة
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
