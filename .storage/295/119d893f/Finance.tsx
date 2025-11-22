import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FinanceStorage, FinancialRecord } from '@/lib/finance-storage';

const Finance: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, netIncome: 0 });

  useEffect(() => {
    const financialRecords = FinanceStorage.getFinancialRecords();
    setRecords(financialRecords);

    const financialSummary = FinanceStorage.getOverallFinancialSummary();
    setSummary({
      totalRevenue: financialSummary.totalRevenue,
      totalExpenses: financialSummary.totalExpenses,
      netIncome: financialSummary.netProfit
    });
  }, []);

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'revenue' ? 'default' : 'destructive'}>
        {type === 'revenue' ? 'إيرادات' : 'مصروفات'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <Badge variant="secondary">Finance</Badge>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All revenue sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.description}</TableCell>
                  <TableCell>{getTypeBadge(record.type)}</TableCell>
                  <TableCell className={record.type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                    ${record.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.projectId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;