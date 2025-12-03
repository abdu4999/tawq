import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@/components/NotificationSystem';
import { AuthProvider } from '@/components/AuthProvider';
import { ScrollProvider } from '@/contexts/ScrollContext';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import ProjectManagement from './pages/ProjectManagement';
import CelebrityManagement from './pages/CelebrityManagement';
import Analytics from './pages/Analytics';
import AIAnalytics from './pages/AIAnalytics';
import AIInsights from './pages/AIInsights';
import TrainingPlatform from './pages/TrainingPlatform';
import GamificationSystem from './pages/GamificationSystem';
import Accounting from './pages/Accounting';
import AdminPermissions from './pages/AdminPermissions';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ErrorManagement from './pages/ErrorManagement';
import TestErrorPage from './pages/TestErrorPage';
import TargetsRoiScreen from './pages/TargetsRoiScreen';
import TaskDetailScreen from './pages/TaskDetailScreen';
import DonorsScreen from './pages/DonorsScreen';
import DonorProfileScreen from './pages/DonorProfileScreen';
import InfluencersScreen from './pages/InfluencersScreen';
import InfluencerProfileScreen from './pages/InfluencerProfileScreen';
import InfluencerRevenueScreen from './pages/InfluencerRevenueScreen';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AnalyticsScreen from './pages/AnalyticsScreen';
import PoliciesLogScreen from './pages/PoliciesLogScreen';
import NotificationsChallengesScreen from './pages/NotificationsChallengesScreen';
import MicroMeasurementScreen from './pages/MicroMeasurementScreen';
import BehaviorAnalyticsScreen from './pages/BehaviorAnalyticsScreen';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <ScrollProvider>
          <TooltipProvider>
            <Toaster position="bottom-left" dir="rtl" />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/tasks/:id" element={<TaskDetailScreen />} />
              <Route path="/projects" element={<ProjectManagement />} />
              <Route path="/celebrities" element={<CelebrityManagement />} />
              <Route path="/donors" element={<DonorsScreen />} />
              <Route path="/donors/:id" element={<DonorProfileScreen />} />
              <Route path="/influencers" element={<InfluencersScreen />} />
              <Route path="/influencers/:id" element={<InfluencerProfileScreen />} />
              <Route path="/influencer-revenue" element={<InfluencerRevenueScreen />} />
              <Route path="/targets-roi" element={<TargetsRoiScreen />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai-analytics" element={<AIAnalytics />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/analytics-predictions" element={<AnalyticsScreen />} />
              <Route path="/micro-measurement" element={<MicroMeasurementScreen />} />
              <Route path="/behavior-analytics" element={<BehaviorAnalyticsScreen />} />
              <Route path="/training-platform" element={<TrainingPlatform />} />
              <Route path="/gamification" element={<GamificationSystem />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/admin-permissions" element={<AdminPermissions />} />
              <Route path="/policies-log" element={<PoliciesLogScreen />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notifications-challenges" element={<NotificationsChallengesScreen />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/error-management" element={<ErrorManagement />} />
              <Route path="/test-errors" element={<TestErrorPage />} />
              <Route path="/welcome" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ScrollProvider>
    </NotificationProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;