export interface FinancialRecord {
  id: string;
  projectId: string;
  taskId?: string;
  type: 'revenue' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface ProjectFinancialSummary {
  projectId: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export class FinanceStorage {
  private static readonly FINANCIAL_RECORDS_KEY = 'charity_financial_records';

  static getFinancialRecords(): FinancialRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.FINANCIAL_RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveFinancialRecords(records: FinancialRecord[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.FINANCIAL_RECORDS_KEY, JSON.stringify(records));
  }

  static createRecord(record: Omit<FinancialRecord, 'id' | 'createdAt'>): FinancialRecord {
    const records = this.getFinancialRecords();
    const newRecord: FinancialRecord = {
      ...record,
      id: `finance_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    this.saveFinancialRecords(records);
    return newRecord;
  }

  static getProjectFinancials(projectId: string): FinancialRecord[] {
    const records = this.getFinancialRecords();
    return records.filter(record => record.projectId === projectId);
  }

  static getProjectFinancialSummary(projectId: string): ProjectFinancialSummary {
    const records = this.getProjectFinancials(projectId);
    const totalRevenue = records
      .filter(r => r.type === 'revenue')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      projectId,
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin
    };
  }

  static getOverallFinancialSummary(): {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  } {
    const records = this.getFinancialRecords();
    const totalRevenue = records
      .filter(r => r.type === 'revenue')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin
    };
  }

  static getFinancialRecordsByDateRange(startDate: string, endDate: string): FinancialRecord[] {
    const records = this.getFinancialRecords();
    return records.filter(record => 
      record.date >= startDate && record.date <= endDate
    );
  }

  static getRevenueByCategory(): { [category: string]: number } {
    const records = this.getFinancialRecords();
    const revenueByCategory: { [category: string]: number } = {};

    records
      .filter(record => record.type === 'revenue')
      .forEach(record => {
        revenueByCategory[record.category] = (revenueByCategory[record.category] || 0) + record.amount;
      });

    return revenueByCategory;
  }

  static getExpensesByCategory(): { [category: string]: number } {
    const records = this.getFinancialRecords();
    const expensesByCategory: { [category: string]: number } = {};

    records
      .filter(record => record.type === 'expense')
      .forEach(record => {
        expensesByCategory[record.category] = (expensesByCategory[record.category] || 0) + record.amount;
      });

    return expensesByCategory;
  }

  // Initialize with sample data
  static initializeSampleData(): void {
    const existingRecords = this.getFinancialRecords();
    if (existingRecords.length === 0) {
      const sampleRecords: FinancialRecord[] = [
        {
          id: 'finance_1',
          projectId: 'project_1',
          taskId: 'task_1',
          type: 'revenue',
          amount: 25000,
          description: 'تبرعات حملة رمضان',
          category: 'تبرعات مباشرة',
          date: '2024-03-01',
          createdBy: '4',
          createdAt: '2024-03-01'
        },
        {
          id: 'finance_2',
          projectId: 'project_1',
          taskId: 'task_1',
          type: 'expense',
          amount: 500,
          description: 'تكاليف اتصالات',
          category: 'تكاليف تشغيل',
          date: '2024-03-01',
          createdBy: '4',
          createdAt: '2024-03-01'
        },
        {
          id: 'finance_3',
          projectId: 'project_2',
          taskId: 'task_3',
          type: 'revenue',
          amount: 15000,
          description: 'كفالات الأيتام',
          category: 'كفالات',
          date: '2024-02-28',
          createdBy: '4',
          createdAt: '2024-02-28'
        },
        {
          id: 'finance_4',
          projectId: 'project_2',
          taskId: 'task_3',
          type: 'expense',
          amount: 200,
          description: 'تكاليف نقل وزيارات',
          category: 'تكاليف تشغيل',
          date: '2024-02-28',
          createdBy: '4',
          createdAt: '2024-02-28'
        }
      ];
      this.saveFinancialRecords(sampleRecords);
    }
  }
}