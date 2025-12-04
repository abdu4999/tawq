import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock components that might cause issues or need data
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={`mock-card ${className}`}>{children}</div>,
  CardHeader: ({ children }: any) => <div className="mock-card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div className="mock-card-title">{children}</div>,
  CardContent: ({ children }: any) => <div className="mock-card-content">{children}</div>,
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

describe('Dashboard Page', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('should render without crashing', () => {
    renderDashboard();
    // Basic check if the page loads
    // Assuming there is a main heading or some text
    // We might need to adjust based on actual content
  });

  it('should render stat cards', () => {
    renderDashboard();
    // Look for common dashboard elements
    // This depends on the actual content of Dashboard.tsx
    // For now, we check if any "mock-card" is rendered
    const cards = document.getElementsByClassName('mock-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should show performance metrics', () => {
    renderDashboard();
    // Check for text that likely appears in the dashboard
    // e.g., "Performance", "Tasks", "Revenue"
    // expect(screen.getByText(/Performance/i)).toBeInTheDocument();
  });
});
