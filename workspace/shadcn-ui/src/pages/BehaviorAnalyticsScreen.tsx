import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Activity, Zap } from 'lucide-react';
import { behaviorAnalytics, DistractionAnalysis, ConfusionMap, BehaviorScore } from '@/lib/behavior-analytics';
import { microMeasurement } from '@/lib/micro-measurement';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function BehaviorAnalyticsScreen() {
  const [analyses, setAnalyses] = useState<DistractionAnalysis[]>([]);
  const [confusionMaps, setConfusionMaps] = useState<ConfusionMap[]>([]);
  const [behaviorScores, setBehaviorScores] = useState<BehaviorScore[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  useEffect(() => {
    performAnalysis();
    const interval = setInterval(performAnalysis, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  const performAnalysis = () => {
    const events = microMeasurement.getStoredEvents();
    const employees = Array.from(new Set(events.map(e => e.employeeId)));

    const newAnalyses: DistractionAnalysis[] = [];
    const newScores: BehaviorScore[] = [];

    employees.forEach(empId => {
      const empEvents = events.filter(e => e.employeeId === empId);
      const empName = empEvents[0]?.employeeName || empId;

      const analysis = behaviorAnalytics.performFullAnalysis(empId, empName, empEvents);
      const score = behaviorAnalytics.calculateBehaviorScore(empId, empName, empEvents);

      newAnalyses.push(analysis);
      newScores.push(score);
    });

    setAnalyses(newAnalyses);
    setBehaviorScores(newScores);

    if (selectedEmployee) {
      const empEvents = events.filter(e => e.employeeId === selectedEmployee);
      const maps = behaviorAnalytics.createConfusionMap(empEvents);
      setConfusionMaps(maps);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🧠 تحليل السلوك والتشتت
          </h1>
          <p className="text-gray-600 text-lg">فهم كيف يعمل الموظف وليس فقط ماذا أنجز</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="distraction">التشتت</TabsTrigger>
            <TabsTrigger value="confusion">خريطة الحيرة</TabsTrigger>
            <TabsTrigger value="scores">الدرجات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyses.map(analysis => (
                <Card key={analysis.employeeId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{analysis.employeeName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>مؤشر التشتت</span>
                        <Badge variant={analysis.distractionIndex > 70 ? "destructive" : "default"}>
                          {analysis.distractionIndex}%
                        </Badge>
                      </div>
                      <Progress value={analysis.distractionIndex} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>درجة الحيرة</span>
                        <Badge variant={analysis.confusionScore > 70 ? "destructive" : "default"}>
                          {analysis.confusionScore}%
                        </Badge>
                      </div>
                      <Progress value={analysis.confusionScore} className="h-2 [&>div]:bg-yellow-500" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>مؤشر التوتر</span>
                        <Badge variant={analysis.stressIndicator > 70 ? "destructive" : "default"}>
                          {analysis.stressIndicator}%
                        </Badge>
                      </div>
                      <Progress value={analysis.stressIndicator} className="h-2 [&>div]:bg-red-500" />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">جودة التركيز:</div>
                      <Badge className={
                        analysis.focusQuality === 'excellent' ? 'bg-green-500' :
                        analysis.focusQuality === 'good' ? 'bg-blue-500' :
                        analysis.focusQuality === 'fair' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }>
                        {analysis.focusQuality === 'excellent' ? '⭐ ممتاز' :
                         analysis.focusQuality === 'good' ? '✓ جيد' :
                         analysis.focusQuality === 'fair' ? '~ مقبول' : '✗ ضعيف'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distraction" className="space-y-6">
            {analyses.map(analysis => (
              <Card key={analysis.employeeId}>
                <CardHeader>
                  <CardTitle>{analysis.employeeName} - أنماط التشتت</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.patterns.length > 0 ? (
                    analysis.patterns.map((pattern, idx) => (
                      <Alert key={idx} className={`border-2 ${getSeverityColor(pattern.severity)}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{pattern.description}</p>
                              <p className="text-sm mt-1">التكرار: {pattern.frequency} مرة</p>
                            </div>
                            <Badge>{pattern.severity === 'high' ? 'عالي' : pattern.severity === 'medium' ? 'متوسط' : 'منخفض'}</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">لا توجد أنماط تشتت ملحوظة ✓</p>
                  )}

                  <div className="mt-6 space-y-2">
                    <h4 className="font-semibold">التوصيات:</h4>
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg text-sm">
                        {rec}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="confusion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>خريطة الحيرة - الشاشات الأكثر تعقيداً</CardTitle>
              </CardHeader>
              <CardContent>
                {confusionMaps.length > 0 ? (
                  <div className="space-y-4">
                    {confusionMaps.map(map => (
                      <div key={map.screenName} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{map.screenName}</h4>
                          <Badge variant={map.confusionScore > 70 ? "destructive" : map.confusionScore > 40 ? "default" : "secondary"}>
                            درجة الحيرة: {map.confusionScore}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-gray-600">مرات الرجوع:</span>
                            <p className="font-bold">{map.indicators.backtracking}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">وقت التردد:</span>
                            <p className="font-bold">{(map.indicators.hesitationTime / 1000).toFixed(0)}ث</p>
                          </div>
                          <div>
                            <span className="text-gray-600">نقرات خاطئة:</span>
                            <p className="font-bold">{map.indicators.errorClicks}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">اختر موظفاً لعرض خريطة الحيرة</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {behaviorScores.map(score => (
                <Card key={score.employeeId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{score.employeeName}</CardTitle>
                      {getTrendIcon(score.trend)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                      <div className="text-sm opacity-90">الدرجة الإجمالية</div>
                      <div className="text-4xl font-bold">{score.overallScore}</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">الإنتاجية</span>
                        <div className="flex items-center gap-2">
                          <Progress value={score.productivityScore} className="w-24 h-2" />
                          <span className="text-sm font-medium">{score.productivityScore}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">المشاركة</span>
                        <div className="flex items-center gap-2">
                          <Progress value={score.engagementScore} className="w-24 h-2" />
                          <span className="text-sm font-medium">{score.engagementScore}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">الكفاءة</span>
                        <div className="flex items-center gap-2">
                          <Progress value={score.efficiencyScore} className="w-24 h-2" />
                          <span className="text-sm font-medium">{score.efficiencyScore}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">الجودة</span>
                        <div className="flex items-center gap-2">
                          <Progress value={score.qualityScore} className="w-24 h-2" />
                          <span className="text-sm font-medium">{score.qualityScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <Badge variant={score.trend === 'improving' ? "default" : score.trend === 'declining' ? "destructive" : "secondary"}>
                        {score.trend === 'improving' ? '📈 في تحسن' : score.trend === 'declining' ? '📉 في تراجع' : '➡️ مستقر'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
