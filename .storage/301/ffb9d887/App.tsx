import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import NotificationSystem from '@/components/NotificationSystem';
import { LoginForm } from '@/components/LoginForm';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Finance from './pages/Finance';
import Gamification from './pages/Gamification';
import ErrorManagement from './pages/ErrorManagement';
import TestErrorPage from './pages/TestErrorPage';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { ProjectStorage } from '@/lib/project-storage';
import { FinanceStorage } from '@/lib/finance-storage';
import { GamificationStorage } from '@/lib/gamification-storage';

function App() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Initialize sample data
    ProjectStorage.initializeSampleData();
    FinanceStorage.initializeSampleData();
    GamificationStorage.initializeSampleData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <LoginForm />
        <Toaster />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 mr-80 transition-all duration-300">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/gamification" element={<Gamification />} />
              <Route path="/error-management" element={<ErrorManagement />} />
              <Route path="/test-error" element={<TestErrorPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <NotificationSystem />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;