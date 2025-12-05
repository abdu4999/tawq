import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock components that might cause issues or need data
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={`mock-card ${className}`}>{children}</div>,
  CardHeader: ({ children }: any) => <div className="mock-card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div className="mock-card-title">{children}</div>,
  CardContent: ({ children }: any) => <div className="mock-card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div className="mock-card-description">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span className="mock-badge">{children}</span>,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

// Mock NotificationSystem to avoid context issues
vi.mock('@/components/NotificationSystem', () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
    addErrorNotification: vi.fn(),
  }),
  NotificationProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock Supabase API
vi.mock('@/lib/supabaseClient', () => ({
  supabaseAPI: {
    getTasks: vi.fn().mockResolvedValue([]),
    getProjects: vi.fn().mockResolvedValue([]),
    getCelebrities: vi.fn().mockResolvedValue([]),
    getTransactions: vi.fn().mockResolvedValue([]),
    getAdminUsers: vi.fn().mockResolvedValue([]),
  }
}));

// Mock Recharts to avoid rendering issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div className="mock-chart">{children}</div>,
  BarChart: () => <div>BarChart</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
}));

// Mock Lucide React
vi.mock('lucide-react', () => ({
  CheckSquare: () => <div />,
  FolderOpen: () => <div />,
  Star: () => <div />,
  DollarSign: () => <div />,
  TrendingUp: () => <div />,
  TrendingDown: () => <div />,
  Calendar: () => <div />,
  Activity: () => <div />,
  BarChart3: () => <div />,
  PieChart: () => <div />,
  Users: () => <div />,
}));

describe('Dashboard Page', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('should render without crashing', async () => {
    renderDashboard();
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/جاري تحميل بيانات/i)).not.toBeInTheDocument();
    });
  });

  it('should render stat cards', async () => {
    renderDashboard();
    await waitFor(() => {
      const cards = document.getElementsByClassName('mock-card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});


