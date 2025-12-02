import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';
import { supabaseAPI, Transaction } from '@/lib/supabaseClient';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Eye,
  FileText,
  PieChart
} from 'lucide-react';

export default function Accounting() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as const,
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const transactionsData = await supabaseAPI.getTransactions();
      setTransactions(transactionsData);
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleCreateTransaction = async () => {
    try {
      // Validation
      if (!newTransaction.description.trim() || !newTransaction.category.trim() || newTransaction.amount <= 0) {
        addNotification({
          type: 'warning',
          title: '⚠️ خطأ في البيانات',
          message: 'يرجى إدخال جميع البيانات المطلوبة'
        });
        return;
      }

      setIsSaving(true);
      
      const transactionData = {
        ...newTransaction,
        reference: newTransaction.reference || null
      };
      
      const createdTransaction = await supabaseAPI.createTransaction(transactionData);
      setTransactions([createdTransaction, ...transactions]);
      
      // Reset form
      setNewTransaction({
        type: 'income',
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        reference: ''
      });
      setIsCreateDialogOpen(false);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم إضافة ${createdTransaction.type === 'income' ? 'إيراد' : 'مصروف'} بقيمة ${createdTransaction.amount.toLocaleString()} ريال`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في إضافة المعاملة',
        context: 'Accounting - Create',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء إضافة المعاملة',
        payload: newTransaction,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      setIsSaving(true);
      
      const updatedTransaction = await supabaseAPI.updateTransaction(selectedTransaction.id, selectedTransaction);
      setTransactions(transactions.map(transaction => transaction.id === selectedTransaction.id ? updatedTransaction : transaction));
      
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        'تم تحديث المعاملة بنجاح'
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في تحديث المعاملة',
        context: 'Accounting - Update',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء تحديث المعاملة',
        payload: selectedTransaction,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string, transactionDesc: string) => {
    try {
      await supabaseAPI.deleteTransaction(transactionId);
      setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
      
      addNotification({
        type: 'warning',
        title: '🗑️ تم حذف المعاملة',
        message: `تم حذف "${transactionDesc}"`,
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
      console.error('Error deleting transaction:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في الحذف',
        message: 'حدث خطأ أثناء حذف المعاملة'
      });
    }
  };

  // Calculate statistics
  const financialStats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    netBalance: 0,
    transactionCount: transactions.length
  };
  financialStats.netBalance = financialStats.totalIncome - financialStats.totalExpense;

  // Get unique categories
  const categories = [...new Set(transactions.map(t => t.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات المالية من قاعدة البيانات...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            النظام المحاسبي
          </h1>
          <p className="text-xl text-gray-600">إدارة الإيرادات والمصروفات المالية</p>
        </div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-2xl font-bold mb-1">{financialStats.totalIncome.toLocaleString()}</div>
              <p className="text-green-100">إجمالي الإيرادات</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-3 text-red-200" />
              <div className="text-2xl font-bold mb-1">{financialStats.totalExpense.toLocaleString()}</div>
              <p className="text-red-100">إجمالي المصروفات</p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${financialStats.netBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white border-0`}>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-2xl font-bold mb-1">{financialStats.netBalance.toLocaleString()}</div>
              <p className="text-blue-100">الرصيد الصافي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{financialStats.transactionCount}</div>
              <p className="text-purple-100">عدد المعاملات</p>
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
                    placeholder="البحث في المعاملات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="income">إيرادات</SelectItem>
                    <SelectItem value="expense">مصروفات</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة معاملة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة معاملة مالية جديدة</DialogTitle>
                    <DialogDescription>
                      أدخل تفاصيل المعاملة المالية
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">نوع المعاملة</Label>
                        <Select value={newTransaction.type} onValueChange={(value: Transaction['type']) => setNewTransaction({...newTransaction, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">إيراد</SelectItem>
                            <SelectItem value="expense">مصروف</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">المبلغ</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">الوصف</Label>
                      <Textarea
                        id="description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                        placeholder="وصف المعاملة المالية"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">الفئة</Label>
                        <Input
                          id="category"
                          value={newTransaction.category}
                          onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                          placeholder="فئة المعاملة"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">التاريخ</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newTransaction.date}
                          onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reference">المرجع (اختياري)</Label>
                      <Input
                        id="reference"
                        value={newTransaction.reference}
                        onChange={(e) => setNewTransaction({...newTransaction, reference: e.target.value})}
                        placeholder="رقم المرجع أو الفاتورة"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSaving}>
                      إلغاء
                    </Button>
                    <LoadingButton 
                      onClick={handleCreateTransaction}
                      loading={isSaving}
                      loadingText="جاري الحفظ..."
                      disabled={!newTransaction.description || !newTransaction.category || newTransaction.amount <= 0}
                    >
                      إضافة المعاملة
                    </LoadingButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                      {transaction.type === 'income' ? 
                        <TrendingUp className="h-6 w-6 text-green-600" /> : 
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      }
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{transaction.description}</h3>
                        <Badge className={transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {transaction.type === 'income' ? 'إيراد' : 'مصروف'}
                        </Badge>
                        <Badge variant="outline">
                          {transaction.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount.toLocaleString()} ريال
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(transaction.date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        {transaction.reference && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>المرجع: {transaction.reference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        addNotification({
                          type: 'info',
                          title: '👁️ عرض المعاملة',
                          message: `عرض تفاصيل: ${transaction.description}`
                        });
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTransactions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-600">لا توجد معاملات</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                    ? 'لا توجد معاملات تطابق معايير البحث' 
                    : 'لم يتم إضافة أي معاملات مالية بعد'}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة أول معاملة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل المعاملة المالية</DialogTitle>
              <DialogDescription>
                تحديث تفاصيل المعاملة
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">نوع المعاملة</Label>
                    <Select value={selectedTransaction.type} onValueChange={(value: Transaction['type']) => setSelectedTransaction({...selectedTransaction, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">إيراد</SelectItem>
                        <SelectItem value="expense">مصروف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-amount">المبلغ</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      value={selectedTransaction.amount}
                      onChange={(e) => setSelectedTransaction({...selectedTransaction, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">الوصف</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedTransaction.description}
                    onChange={(e) => setSelectedTransaction({...selectedTransaction, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">الفئة</Label>
                    <Input
                      id="edit-category"
                      value={selectedTransaction.category}
                      onChange={(e) => setSelectedTransaction({...selectedTransaction, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-date">التاريخ</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={selectedTransaction.date}
                      onChange={(e) => setSelectedTransaction({...selectedTransaction, date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-reference">المرجع</Label>
                  <Input
                    id="edit-reference"
                    value={selectedTransaction.reference || ''}
                    onChange={(e) => setSelectedTransaction({...selectedTransaction, reference: e.target.value})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <LoadingButton 
                onClick={handleUpdateTransaction}
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={!selectedTransaction?.description}
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