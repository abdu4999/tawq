import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@/components/NotificationSystem';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Finance } from './pages/Finance';
import { Gamification } from './pages/Gamification';
import ErrorManagement from './pages/ErrorManagement';
import TestErrorPage from './pages/TestErrorPage';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { ProjectStorage } from '@/lib/project-storage';
import { FinanceStorage } from '@/lib/finance-storage';
import { GamificationStorage } from '@/lib/gamification-storage';

const queryClient = new QueryClient();

// Initialize sample data on app start
ProjectStorage.initializeSampleData();
FinanceStorage.initializeSampleData();
GamificationStorage.initializeSampleData();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/error-management" element={<ErrorManagement />} />
          <Route path="/test-errors" element={<TestErrorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster position="bottom-left" dir="rtl" />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;