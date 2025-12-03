/**
 * 🛡️ SECURITY DASHBOARD
 * لوحة تحكم الأمن السيبراني الشاملة
 */

import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Eye, Lock, Database, Activity, FileText, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  securityFramework, 
  AuditAction, 
  AuditSeverity, 
  UserRole 
} from '@/lib/security-framework';
import { 
  securityTestRunner, 
  SecurityTestType,
  TestSeverity,
  type SecurityTestReport 
} from '@/lib/security-testing';
import { backupManager } from '@/lib/data-protection';
import Sidebar from '@/components/Sidebar';

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [testReport, setTestReport] = useState<SecurityTestReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [threats, setThreats] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [backupStats, setBackupStats] = useState<any>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSecurityData();
    loadBackups();
  }, []);

  const loadSecurityData = () => {
    const logs = securityFramework.getAuditLogs();
    setAuditLogs(logs.slice(0, 50)); // آخر 50 سجل
    
    const threats_data = securityFramework.getThreatDetections(false);
    setThreats(threats_data);
  };

  const loadBackups = () => {
    const backupList = backupManager.getBackups();
    setBackups(backupList);
    
    const stats = backupManager.getBackupStats();
    setBackupStats(stats);
  };

  const runSecurityTests = async () => {
    setIsRunningTests(true);
    try {
      const report = await securityTestRunner.runAllTests();
      setTestReport(report);
      showMessage('success', '✅ تم إكمال الاختبارات الأمنية بنجاح');
    } catch (error) {
      console.error('Error running tests:', error);
      showMessage('error', '❌ حدث خطأ أثناء تشغيل الاختبارات');
    } finally {
      setIsRunningTests(false);
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const user = securityFramework.getCurrentUser();
      if (user) {
        const backup = await backupManager.createBackup('full', user.id);
        showMessage('success', `✅ تم إنشاء النسخة الاحتياطية: ${backup.fileName}`);
        loadBackups();
      } else {
        showMessage('error', '❌ يجب تسجيل الدخول أولاً');
      }
    } catch (error) {
      showMessage('error', '❌ فشل إنشاء النسخة الاحتياطية');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('⚠️ هل أنت متأكد من استرجاع هذه النسخة؟ سيتم استبدال جميع البيانات الحالية.')) {
      return;
    }

    try {
      showMessage('info', '🔄 جارِ استرجاع النسخة الاحتياطية...');
      const success = await backupManager.restoreBackup(backupId);
      
      if (success) {
        showMessage('success', '✅ تم استرجاع النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة...');
      } else {
        showMessage('error', '❌ فشل استرجاع النسخة الاحتياطية');
      }
    } catch (error: any) {
      showMessage('error', `❌ خطأ: ${error.message}`);
    }
  };

  const exportBackup = async (backupId: string) => {
    try {
      const backup = backupManager.getBackupInfo(backupId);
      if (!backup) return;

      const blob = await backupManager.exportBackup(backupId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('success', `✅ تم تحميل الملف: ${backup.fileName}`);
      }
    } catch (error) {
      showMessage('error', '❌ فشل تصدير النسخة الاحتياطية');
    }
  };

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      showMessage('info', '📥 جارِ استيراد النسخة الاحتياطية...');
      
      const user = securityFramework.getCurrentUser();
      if (!user) {
        showMessage('error', '❌ يجب تسجيل الدخول أولاً');
        return;
      }

      const backup = await backupManager.importBackup(file, user.id);
      
      if (backup) {
        showMessage('success', `✅ تم استيراد النسخة: ${backup.fileName}`);
        loadBackups();
      } else {
        showMessage('error', '❌ فشل استيراد النسخة الاحتياطية');
      }
    } catch (error) {
      showMessage('error', '❌ خطأ في استيراد الملف');
    }
    
    // إعادة تعيين input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه النسخة؟')) {
      return;
    }

    try {
      // حذف من القائمة (في التطبيق الفعلي سيكون من الخادم)
      setBackups(backups.filter(b => b.id !== backupId));
      showMessage('success', '✅ تم حذف النسخة الاحتياطية');
    } catch (error) {
      showMessage('error', '❌ فشل حذف النسخة');
    }
  };

  const cleanOldBackups = () => {
    if (!confirm('⚠️ سيتم حذف جميع النسخ الأقدم من 30 يوم. هل تريد المتابعة؟')) {
      return;
    }

    try {
      const deletedCount = backupManager.cleanOldBackups(30);
      showMessage('success', `✅ تم حذف ${deletedCount} نسخة احتياطية قديمة`);
      loadBackups();
    } catch (error) {
      showMessage('error', '❌ فشل تنظيف النسخ القديمة');
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      <Sidebar />
      <div className="flex-1 p-6 mr-80">
      {/* Header */}
      <div className="mb-6">
        {message && (
          <Alert className={`mb-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-200' :
            message.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <AlertDescription className={
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🛡️ نظام الأمن السيبراني
              </h1>
              <p className="text-sm text-gray-600">
                إدارة شاملة للأمن والاختبارات والتهديدات
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={runSecurityTests}
              disabled={isRunningTests}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {isRunningTests ? '⏳ جارِ الاختبار...' : '🧪 تشغيل الاختبارات'}
            </Button>
            <Button 
              onClick={createBackup}
              disabled={isCreatingBackup}
              variant="outline"
            >
              {isCreatingBackup ? '⏳ جارِ الإنشاء...' : '💾 نسخة احتياطية'}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview">📊 نظرة عامة</TabsTrigger>
          <TabsTrigger value="tests">🧪 الاختبارات</TabsTrigger>
          <TabsTrigger value="audit">📜 سجل التدقيق</TabsTrigger>
          <TabsTrigger value="threats">⚠️ التهديدات</TabsTrigger>
          <TabsTrigger value="backups">💾 النسخ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SecurityStatCard
              title="الأمان العام"
              value={testReport?.isSecure ? "آمن" : "يحتاج تحسين"}
              icon={<Shield className="w-5 h-5" />}
              color={testReport?.isSecure ? "green" : "yellow"}
            />
            <SecurityStatCard
              title="معدل النجاح"
              value={testReport ? `${Math.round(testReport.passRate)}%` : "--"}
              icon={<CheckCircle className="w-5 h-5" />}
              color="blue"
            />
            <SecurityStatCard
              title="تهديدات نشطة"
              value={threats.length.toString()}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={threats.length > 0 ? "red" : "green"}
            />
            <SecurityStatCard
              title="سجلات اليوم"
              value={auditLogs.filter(log => 
                new Date(log.timestamp).toDateString() === new Date().toDateString()
              ).length.toString()}
              icon={<Activity className="w-5 h-5" />}
              color="purple"
            />
          </div>

          {testReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📊 ملخص الاختبارات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <TestSummaryRow
                      label="🔴 حرجة"
                      total={testReport.summary.critical.total}
                      passed={testReport.summary.critical.passed}
                      failed={testReport.summary.critical.failed}
                    />
                    <TestSummaryRow
                      label="🟠 عالية"
                      total={testReport.summary.high.total}
                      passed={testReport.summary.high.passed}
                      failed={testReport.summary.high.failed}
                    />
                    <TestSummaryRow
                      label="🟡 متوسطة"
                      total={testReport.summary.medium.total}
                      passed={testReport.summary.medium.passed}
                      failed={testReport.summary.medium.failed}
                    />
                    <TestSummaryRow
                      label="🟢 منخفضة"
                      total={testReport.summary.low.total}
                      passed={testReport.summary.low.passed}
                      failed={testReport.summary.low.failed}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>💡 التوصيات</CardTitle>
                </CardHeader>
                <CardContent>
                  {testReport.recommendations.length === 0 ? (
                    <div className="text-center py-8 text-green-600">
                      ✅ لا توجد توصيات - النظام آمن!
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {testReport.recommendations.slice(0, 5).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>🧪 نتائج الاختبارات الأمنية</CardTitle>
              <CardDescription>
                {testReport 
                  ? `آخر تشغيل: ${new Date(testReport.timestamp).toLocaleString('ar-SA')}`
                  : 'لم يتم تشغيل الاختبارات بعد'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!testReport ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    قم بتشغيل الاختبارات الأمنية للحصول على النتائج
                  </p>
                  <Button onClick={runSecurityTests}>
                    🧪 تشغيل الاختبارات
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {testReport.results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        result.passed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {result.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{result.testId}</span>
                              <Badge variant={
                                result.severity === TestSeverity.CRITICAL ? 'destructive' :
                                result.severity === TestSeverity.HIGH ? 'default' :
                                'secondary'
                              }>
                                {result.severity}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{result.message}</p>
                            {result.details && (
                              <p className="text-xs text-gray-600">{result.details}</p>
                            )}
                            {result.recommendation && (
                              <p className="text-xs text-amber-700 mt-2 flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 mt-0.5" />
                                {result.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>📜 سجل التدقيق</CardTitle>
              <CardDescription>
                آخر 50 عملية في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد سجلات بعد
                  </div>
                ) : (
                  auditLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        log.severity === AuditSeverity.CRITICAL ? 'bg-red-500' :
                        log.severity === AuditSeverity.WARNING ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.userRole}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      {log.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>⚠️ التهديدات المكتشفة</CardTitle>
              <CardDescription>
                التهديدات النشطة التي تحتاج إلى متابعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threats.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-green-600 font-semibold">
                    ✅ لا توجد تهديدات نشطة
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    النظام آمن حالياً
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {threats.map((threat, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        threat.severity === 'critical' ? 'bg-red-50 border-red-300' :
                        threat.severity === 'high' ? 'bg-amber-50 border-amber-300' :
                        'bg-yellow-50 border-yellow-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="destructive" className="mb-2">
                            {threat.type}
                          </Badge>
                          <p className="font-semibold">{threat.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          threat.severity === 'critical' ? 'bg-red-600 text-white' :
                          threat.severity === 'high' ? 'bg-amber-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {threat.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>🕐 {new Date(threat.timestamp).toLocaleString('ar-SA')}</p>
                        <p>👤 {threat.userId || 'غير محدد'}</p>
                        {threat.indicators.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold text-xs mb-1">المؤشرات:</p>
                            {threat.indicators.map((indicator, i) => (
                              <span key={i} className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups">
          <div className="space-y-4">
            {/* Backup Stats */}
            {backupStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">إجمالي النسخ</div>
                    <div className="text-2xl font-bold">{backupStats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">الحجم الإجمالي</div>
                    <div className="text-2xl font-bold">
                      {Math.round(backupStats.totalSize / 1024)} KB
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">نسخ كاملة</div>
                    <div className="text-2xl font-bold">{backupStats.byType.full}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">نسخ تزايدية</div>
                    <div className="text-2xl font-bold">{backupStats.byType.incremental}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>💾 النسخ الاحتياطية</CardTitle>
                    <CardDescription>
                      إدارة النسخ الاحتياطية للنظام
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".enc"
                      onChange={importBackup}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      استيراد
                    </Button>
                    <Button
                      onClick={cleanOldBackups}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      تنظيف القديمة
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {backups.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      لا توجد نسخ احتياطية بعد
                    </p>
                    <Button onClick={createBackup} disabled={isCreatingBackup}>
                      💾 إنشاء أول نسخة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backups.map((backup, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <Database className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">
                              {backup.fileName || backup.id}
                            </span>
                            <Badge variant={backup.type === 'full' ? 'default' : 'secondary'}>
                              {backup.type === 'full' ? 'كاملة' : 'تزايدية'}
                            </Badge>
                            {backup.encrypted && (
                              <Lock className="w-3 h-3 text-green-600" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(backup.timestamp).toLocaleString('ar-SA')} • 
                            {Math.round(backup.size / 1024)} KB •
                            {backup.location && (
                              <span className="text-gray-400"> {backup.location}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => restoreBackup(backup.id)}
                            variant="outline"
                            size="sm"
                            title="استرجاع"
                          >
                            🔄
                          </Button>
                          <Button
                            onClick={() => exportBackup(backup.id)}
                            variant="outline"
                            size="sm"
                            title="تحميل"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteBackup(backup.id)}
                            variant="outline"
                            size="sm"
                            title="حذف"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

// مكونات مساعدة

function SecurityStatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    red: 'from-red-500 to-pink-600',
    yellow: 'from-amber-500 to-orange-600',
    purple: 'from-purple-500 to-indigo-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestSummaryRow({
  label,
  total,
  passed,
  failed
}: {
  label: string;
  total: number;
  passed: number;
  failed: number;
}) {
  const percentage = total > 0 ? (passed / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">
          {passed}/{total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {failed > 0 && (
        <p className="text-xs text-red-600 mt-1">
          {failed} فشل
        </p>
      )}
    </div>
  );
}
