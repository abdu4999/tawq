import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectStorage } from '@/lib/project-storage';
import { GamificationStorage } from '@/lib/gamification-storage';
import { getFinancialSummary } from '@/lib/finance-storage';

interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

interface LeaderboardEntry {
  username: string;
  points: number;
  role: string;
}

const Dashboard: React.FC = () => {
  const [projectStats, setProjectStats] = useState<ProjectStats>({ total: 0, completed: 0, inProgress: 0, pending: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [financialSummary, setFinancialSummary] = useState({ totalRevenue: 0, totalExpenses: 0, netIncome: 0 });

  useEffect(() => {
    // Load project statistics
    const projects = ProjectStorage.getProjects();
    const stats: ProjectStats = {
      total: projects.length,
      completed: projects.filter(p => p.status === 'completed').length,
      inProgress: projects.filter(p => p.status === 'active').length,
      pending: projects.filter(p => p.status === 'on-hold').length,
    };
    setProjectStats(stats);

    // Load leaderboard
    const leaderboardData = GamificationStorage.getLeaderboard();
    setLeaderboard(leaderboardData.slice(0, 5));

    // Load financial summary
    const financeData = getFinancialSummary();
    setFinancialSummary(financeData);
  }, []);

  const completionRate = projectStats.total > 0 ? (projectStats.completed / projectStats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="secondary">Overview</Badge>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
            <p className="text-xs text-muted-foreground">All active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${financialSummary.netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderboard.length}</div>
            <p className="text-xs text-muted-foreground">Top performers</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Completed</span>
              <Badge variant="default">{projectStats.completed}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>In Progress</span>
              <Badge variant="secondary">{projectStats.inProgress}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending</span>
              <Badge variant="outline">{projectStats.pending}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{entry.userName}</div>
                    <div className="text-sm text-muted-foreground">User ID: {entry.userId}</div>
                  </div>
                  <Badge variant="default">{entry.totalPoints} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;