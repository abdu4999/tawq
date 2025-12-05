import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TasksScreen from '../TasksScreen';
import { BrowserRouter } from 'react-router-dom';

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={`mock-card ${className}`}>{children}</div>,
  CardHeader: ({ children }: any) => <div className="mock-card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div className="mock-card-title">{children}</div>,
  CardContent: ({ children }: any) => <div className="mock-card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div className="mock-card-description">{children}</div>,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

// Mock Supabase API
vi.mock('@/lib/supabaseClient', () => ({
  supabaseAPI: {
    getTasks: vi.fn().mockResolvedValue([
      { id: 1, title: 'Test Task 1', status: 'pending' },
      { id: 2, title: 'Test Task 2', status: 'completed' }
    ]),
    createTask: vi.fn().mockResolvedValue({}),
  }
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Lucide React
vi.mock('lucide-react', () => ({
  CheckSquare: () => <div />,
  Plus: () => <div />,
  Filter: () => <div />,
  Calendar: () => <div />,
  Clock: () => <div />,
  User: () => <div />,
  DollarSign: () => <div />,
  FileText: () => <div />,
  Search: () => <div />,
  AlertCircle: () => <div />,
  X: () => <div />,
}));

describe('TasksScreen Page', () => {
  const renderTasksScreen = () => {
    return render(
      <BrowserRouter>
        <TasksScreen />
      </BrowserRouter>
    );
  };

  it('should render tasks table/list', async () => {
    renderTasksScreen();
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
  });

  it('should allow creating a new task', async () => {
    renderTasksScreen();
    await waitFor(() => {
      const createButton = screen.queryByText(/مهمة جديدة/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  it('should filter tasks', async () => {
    renderTasksScreen();
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/ابحث عن مهمة/i);
      expect(searchInput).toBeInTheDocument();
    });
  });
});

