import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@/components/NotificationSystem';
import { AuthProvider } from '@/components/AuthProvider';
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
import LivePerformance from './pages/LivePerformance';
import TargetsRoi from './pages/TargetsRoi';
import TaskDetail from './pages/TaskDetail';
import Donors from './pages/Donors';
import DonorProfile from './pages/DonorProfile';
import InfluencerProfile from './pages/InfluencerProfile';
import InfluencerRevenue from './pages/InfluencerRevenue';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PoliciesLog from './pages/PoliciesLog';
import Login from './pages/Login';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster position="bottom-left" dir="rtl" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-dashboard" element={<EmployeeDashboard />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/task/:id" element={<TaskDetail />} />
              <Route path="/projects" element={<ProjectManagement />} />
              <Route path="/celebrities" element={<CelebrityManagement />} />
              <Route path="/influencer/:id" element={<InfluencerProfile />} />
              <Route path="/influencer-revenue" element={<InfluencerRevenue />} />
              <Route path="/donors" element={<Donors />} />
              <Route path="/donor/:id" element={<DonorProfile />} />
              <Route path="/live-performance" element={<LivePerformance />} />
              <Route path="/targets-roi" element={<TargetsRoi />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai-analytics" element={<AIAnalytics />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/training-platform" element={<TrainingPlatform />} />
              <Route path="/gamification" element={<GamificationSystem />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/admin-permissions" element={<AdminPermissions />} />
              <Route path="/policies-log" element={<PoliciesLog />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/error-management" element={<ErrorManagement />} />
              <Route path="/test-errors" element={<TestErrorPage />} />
              <Route path="/welcome" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;