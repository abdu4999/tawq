import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@/components/NotificationSystem';
import { AuthProvider } from '@/components/AuthProvider';
import { ScrollProvider } from '@/contexts/ScrollContext';
import AppLayout from '@/components/AppLayout';

// Auth & Core
import Login from './pages/Login';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Dashboards
import Dashboard from './pages/Dashboard';
import DecisionCenterScreen from './pages/DecisionCenterScreen';
import SecurityDashboard from './pages/SecurityDashboard';

// Operations
import ProjectManagement from './pages/ProjectManagement';
import TaskManagement from './pages/TaskManagement';
import TaskDetailScreen from './pages/TaskDetailScreen';
import MandatoryWorkflowScreen from './pages/MandatoryWorkflowScreen';

// HR & Team
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeBehaviorScreen from './pages/EmployeeBehaviorScreen';
import EmployeeIdpScreen from './pages/EmployeeIdpScreen';
import GamificationSystem from './pages/GamificationSystem';
import MicroMeasurementScreen from './pages/MicroMeasurementScreen'; // Keeping as legacy/specific view

// CRM (Donors & Influencers)
import DonorsScreen from './pages/DonorsScreen';
import DonorProfileScreen from './pages/DonorProfileScreen';
import InfluencersScreen from './pages/InfluencersScreen';
import InfluencerProfileScreen from './pages/InfluencerProfileScreen';
import CelebrityManagement from './pages/CelebrityManagement';

// Marketing
import CampaignsScreen from './pages/CampaignsScreen';
import ChannelsPerformanceScreen from './pages/ChannelsPerformanceScreen';

// Finance
import Accounting from './pages/Accounting';
import InfluencerRevenueScreen from './pages/InfluencerRevenueScreen';
import TargetsRoiScreen from './pages/TargetsRoiScreen';

// Analytics
import Analytics from './pages/Analytics';
import DonorFunnelScreen from './pages/DonorFunnelScreen';
import AIAnalytics from './pages/AIAnalytics';
import AIInsights from './pages/AIInsights';
import AnalyticsScreen from './pages/AnalyticsScreen'; // Predictions
import BehaviorAnalyticsScreen from './pages/BehaviorAnalyticsScreen';

// Training & Knowledge
import TrainingPlatform from './pages/TrainingPlatform';
import BestPracticesScreen from './pages/BestPracticesScreen';

// System & Admin
import AdminPermissions from './pages/AdminPermissions';
import PoliciesLogScreen from './pages/PoliciesLogScreen';
import ErrorManagement from './pages/ErrorManagement';
import TestErrorPage from './pages/TestErrorPage';
import Notifications from './pages/Notifications';
import NotificationsChallengesScreen from './pages/NotificationsChallengesScreen';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ScrollProvider>
        <TooltipProvider>
          <Toaster position="bottom-left" dir="rtl" />
          <BrowserRouter>
            <NotificationProvider>
              <Routes>
                {/* Auth & Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/welcome" element={<Index />} />
                
                <Route element={<AppLayout />}>
                  {/* Dashboards */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/decision-center" element={<DecisionCenterScreen />} />
                  <Route path="/security" element={<SecurityDashboard />} />

                  {/* Operations */}
                  <Route path="/projects" element={<ProjectManagement />} />
                  <Route path="/tasks" element={<TaskManagement />} />
                  <Route path="/tasks/:id" element={<TaskDetailScreen />} />
                  <Route path="/mandatory-workflow" element={<MandatoryWorkflowScreen />} />

                  {/* HR & Team */}
                  <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                  <Route path="/employee-behavior" element={<EmployeeBehaviorScreen />} />
                  <Route path="/employee-idp" element={<EmployeeIdpScreen />} />
                  <Route path="/gamification" element={<GamificationSystem />} />
                  <Route path="/micro-measurement" element={<MicroMeasurementScreen />} />

                  {/* CRM */}
                  <Route path="/donors" element={<DonorsScreen />} />
                  <Route path="/donors/:id" element={<DonorProfileScreen />} />
                  <Route path="/influencers" element={<InfluencersScreen />} />
                  <Route path="/influencers/:id" element={<InfluencerProfileScreen />} />
                  <Route path="/celebrities" element={<CelebrityManagement />} />

                  {/* Marketing */}
                  <Route path="/campaigns" element={<CampaignsScreen />} />
                  <Route path="/channels-performance" element={<ChannelsPerformanceScreen />} />

                  {/* Finance */}
                  <Route path="/accounting" element={<Accounting />} />
                  <Route path="/influencer-revenue" element={<InfluencerRevenueScreen />} />
                  <Route path="/targets-roi" element={<TargetsRoiScreen />} />

                  {/* Analytics */}
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/donor-funnel" element={<DonorFunnelScreen />} />
                  <Route path="/ai-analytics" element={<AIAnalytics />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/analytics-predictions" element={<AnalyticsScreen />} />
                  <Route path="/behavior-analytics" element={<BehaviorAnalyticsScreen />} />

                  {/* Training & Knowledge */}
                  <Route path="/training-platform" element={<TrainingPlatform />} />
                  <Route path="/best-practices" element={<BestPracticesScreen />} />

                  {/* System & Admin */}
                  <Route path="/admin-permissions" element={<AdminPermissions />} />
                  <Route path="/policies-log" element={<PoliciesLogScreen />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/notifications-challenges" element={<NotificationsChallengesScreen />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/error-management" element={<ErrorManagement />} />
                  <Route path="/test-errors" element={<TestErrorPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </NotificationProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ScrollProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;