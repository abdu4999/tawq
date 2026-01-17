import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'سناب شات', spend: 4000, revenue: 24000, roas: 6 },
  { name: 'تيك توك', spend: 3000, revenue: 13980, roas: 4.66 },
  { name: 'انستغرام', spend: 2000, revenue: 9800, roas: 4.9 },
  { name: 'جوجل', spend: 2780, revenue: 3908, roas: 1.4 },
  { name: 'واتساب', spend: 1890, revenue: 4800, roas: 2.5 },
];

export default function ChannelsPerformanceScreen() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-slate-900">📊 أداء القنوات التسويقية</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>العائد على الإعلان (ROAS) حسب القناة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="roas" fill="#8884d8" name="ROAS" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المصروف مقابل الإيراد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="spend" fill="#ff8042" name="المصروف" />
                  <Bar dataKey="revenue" fill="#00C49F" name="الإيراد" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}