import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FinanceStorage, FinancialRecord, ProjectFinancialSummary } from '../lib/finance-storage';
import { ProjectStorage } from '../lib/project-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export const Finance: React.FC = () => {
  const { user, canAccess } = useAuth();
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectSummaries, setProjectSummaries] = useState<ProjectFinancialSummary[]>([]);
  const [overallSummary, setOverallSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [newRecord, setNewRecord] = useState({
    projectId: '',
    type: 'revenue' as FinancialRecord['type'],
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    const allRecords = FinanceStorage.getFinancialRecords();
    const allProjects = ProjectStorage.getProjects();
    
    let userRecords = allRecords;
    let userProjects = allProjects;

    if (user?.role === 'employee') {
      userProjects = allProjects.filter(project => 
        project.teamMembers.includes(user.id)
      );
      userRecords = allRecords.filter(record => 
        userProjects.some(project => project.id === record.projectId)
      );
    } else if (user?.role === 'supervisor') {
      userProjects = ProjectStorage.getSupervisorProjects(user.id);
      userRecords = allRecords.filter(record => 
        userProjects.some(project => project.id === record.projectId)
      );
    }

    setFinancialRecords(userRecords);
    setProjects(userProjects);
    
    // Calculate project summaries
    const summaries = userProjects.map(project => 
      FinanceStorage.getProjectFinancialSummary(project.id)
    );
    setProjectSummaries(summaries);

    // Calculate overall summary
    const overall = FinanceStorage.getOverallFinancialSummary();
    setOverallSummary(overall);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const createdRecord = FinanceStorage.createRecord({
      ...newRecord,
      createdBy: user.id
    });

    if (createdRecord) {
      setFinancialRecords([...financialRecords, createdRecord]);
      setShowCreateForm(false);
      setNewRecord({
        projectId: '',
        type: 'revenue',
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadData(); // Reload to update summaries
    }
  };

  const getTypeBadge = (type: FinancialRecord['type']) => {
    return (
      <Badge variant={type === 'revenue' ? 'default' : 'destructive'} className={
        type === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }>
        {type === 'revenue' ? 'إيراد' : 'مصروف'}
      </Badge>
    );
  };

  const getCategoryOptions = (type: FinancialRecord['type']) => {
    if (type === 'revenue') {
      return ['تبرعات مباشرة', 'كفالات', 'تبرعات شهرية', 'تبرعات الشركات', 'منح', 'أخرى'];
    } else {
      return ['تكاليف تشغيل', 'رواتب', 'تسويق', 'نقل ومواصلات', 'معدات', 'تدريب', 'أخرى'];
    }
  };

  const filteredRecords = financialRecords.filter(record => {
    const projectMatch = filterProject === 'all' || record.projectId === filterProject;
    const typeMatch = filterType === 'all' || record.type === filterType;
    return projectMatch && typeMatch;
  });

  const canCreateRecords = user && (user.role === 'admin' || user.role === 'accountant');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">التقارير المالية</h1>
          <p className="text-gray-600">متابعة الإيرادات والمصروفات والأداء المالي</p>
        </div>
        {canCreateRecords && (
          <Button onClick={() => setShowCreateForm(true)}>
            + تسجيل معاملة مالية
          </Button>
        )}
      </div>

      {/* Overall Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallSummary.totalRevenue.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overallSummary.totalExpenses.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              overallSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overallSummary.netProfit.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              overallSummary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overallSummary.profitMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Financial Summaries */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص المشاريع المالية</CardTitle>
          <CardDescription>الأداء المالي لكل مشروع</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المشروع</TableHead>
                <TableHead className="text-right">الإيرادات</TableHead>
                <TableHead className="text-right">المصروفات</TableHead>
                <TableHead className="text-right">صافي الربح</TableHead>
                <TableHead className="text-right">هامش الربح</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectSummaries.map((summary) => {
                const project = projects.find(p => p.id === summary.projectId);
                return (
                  <TableRow key={summary.projectId}>
                    <TableCell className="font-medium">{project?.name || 'غير معروف'}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {summary.totalRevenue.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {summary.totalExpenses.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className={`text-right ${
                      summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {summary.netProfit.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className={`text-right ${
                      summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {summary.profitMargin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium">تصفية:</span>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="جميع المشاريع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المشاريع</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="revenue">إيرادات</SelectItem>
                <SelectItem value="expense">مصروفات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Record Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>تسجيل معاملة مالية جديدة</CardTitle>
            <CardDescription>إضافة إيراد أو مصروف جديد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المشروع</label>
                  <Select
                    value={newRecord.projectId}
                    onValueChange={(value) => setNewRecord({...newRecord, projectId: value})}
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
                  <label className="block text-sm font-medium mb-2">النوع</label>
                  <Select
                    value={newRecord.type}
                    onValueChange={(value: FinancialRecord['type']) => {
                      setNewRecord({
                        ...newRecord, 
                        type: value,
                        category: '' // Reset category when type changes
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">إيراد</SelectItem>
                      <SelectItem value="expense">مصروف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ</label>
                  <Input
                    type="number"
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord({...newRecord, amount: Number(e.target.value)})}
                    placeholder="المبلغ بالريال"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">التاريخ</label>
                  <Input
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">التصنيف</label>
                <Select
                  value={newRecord.category}
                  onValueChange={(value) => setNewRecord({...newRecord, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoryOptions(newRecord.type).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <Textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                  placeholder="وصف تفصيلي للمعاملة"
                  rows={2}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">تسجيل المعاملة</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Financial Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات المالية</CardTitle>
          <CardDescription>جميع الإيرادات والمصروفات المسجلة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>المشروع</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => {
                const project = projects.find(p => p.id === record.projectId);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell className="font-medium">{project?.name || 'غير معروف'}</TableCell>
                    <TableCell>{getTypeBadge(record.type)}</TableCell>
                    <TableCell>{record.category}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      record.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.amount.toLocaleString()} ر.س
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد معاملات مالية مطابقة للبحث
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};