import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DonorsScreen from '../DonorsScreen';
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
}));

vi.mock('@/components/ui/loading-button', () => ({
  LoadingButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

// Mock Lucide React
vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      return () => <div className={`lucide-${String(prop)}`} />;
    }
  });
});

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('DonorsScreen Page', () => {
  const renderDonorsScreen = () => {
    return render(
      <BrowserRouter>
        <DonorsScreen />
      </BrowserRouter>
    );
  };

  it('should render donors list', async () => {
    renderDonorsScreen();
    await waitFor(() => {
      expect(screen.getByText('أحمد محمد السعيد')).toBeInTheDocument();
    });
  });

  it('should show stats cards', async () => {
    renderDonorsScreen();
    await waitFor(() => {
      expect(screen.getByText('إجمالي المتبرعين')).toBeInTheDocument();
      expect(screen.getByText('إجمالي التبرعات')).toBeInTheDocument();
    });
  });

  it('should allow creating a new donor', async () => {
    renderDonorsScreen();
    await waitFor(() => {
      const createButton = screen.queryByText(/متبرع جديد/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  it('should filter donors', async () => {
    renderDonorsScreen();
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/البحث بالاسم/i);
      expect(searchInput).toBeInTheDocument();
    });
  });
});
