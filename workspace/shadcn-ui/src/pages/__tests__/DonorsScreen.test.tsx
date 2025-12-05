import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DonorsScreen from '../DonorsScreen';
import * as useToastModule from '@/hooks/use-toast';

// Mock dependencies
vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => (props: any) => <span data-testid={\icon-\} {...props} />
  });
});

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid='sidebar'>Sidebar</div>
}));

vi.mock('@/lib/error-handler', () => ({
  handleApiError: vi.fn(),
  showSuccessNotification: vi.fn()
}));

// Mock UI components to avoid complex rendering issues
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid='card'>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid='card-header'>{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid='card-title'>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid='card-content'>{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid='dialog-content'>{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid='dialog-header'>{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid='dialog-title'>{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid='dialog-footer'>{children}</div>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => <div data-testid='select' onClick={() => onValueChange && onValueChange('vip')}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid='select-trigger'>{children}</div>,
  SelectValue: () => <div data-testid='select-value'>Select Value</div>,
  SelectContent: ({ children }: any) => <div data-testid='select-content'>{children}</div>,
  SelectItem: ({ children, value, onClick }: any) => <div data-testid={\select-item-\} onClick={onClick}>{children}</div>,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

describe('DonorsScreen', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useToastModule, 'useToast').mockReturnValue({ toast: mockToast });
  });

  it('renders the donors screen correctly', () => {
    render(
      <BrowserRouter>
        <DonorsScreen />
      </BrowserRouter>
    );

    expect(screen.getByText('«·„ »—⁄Ê‰')).toBeInTheDocument();
    expect(screen.getByText('≈œ«—… Ê„ «»⁄… «·„ »—⁄Ì‰ Ê »—⁄« Â„')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('displays statistics cards', () => {
    render(
      <BrowserRouter>
        <DonorsScreen />
      </BrowserRouter>
    );

    expect(screen.getByText('≈Ã„«·Ì «·„ »—⁄Ì‰')).toBeInTheDocument();
    expect(screen.getByText('≈Ã„«·Ì «· »—⁄« ')).toBeInTheDocument();
    expect(screen.getByText('„ Ê”ÿ «· »—⁄')).toBeInTheDocument();
    expect(screen.getByText('„ »—⁄Ê‰ VIP')).toBeInTheDocument();
  });

  it('filters donors by search term', async () => {
    render(
      <BrowserRouter>
        <DonorsScreen />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('«·»ÕÀ »«·«”„ √Ê «·»—Ìœ...');
    fireEvent.change(searchInput, { target: { value: '√Õ„œ' } });

    await waitFor(() => {
      expect(screen.getByText('√Õ„œ „Õ„œ «·”⁄Ìœ')).toBeInTheDocument();
      expect(screen.queryByText('›«ÿ„… ⁄·Ì')).not.toBeInTheDocument();
    });
  });

  it('opens the add donor dialog when clicking the button', () => {
    render(
      <BrowserRouter>
        <DonorsScreen />
      </BrowserRouter>
    );

    const addButton = screen.getByText('„ »—⁄ ÃœÌœ');
    fireEvent.click(addButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('≈÷«›… „ »—⁄ ÃœÌœ')).toBeInTheDocument();
  });

  it('validates form inputs before submission', async () => {
    render(
      <BrowserRouter>
        <DonorsScreen />
      </BrowserRouter>
    );

    // Open dialog
    fireEvent.click(screen.getByText('„ »—⁄ ÃœÌœ'));

    // Click save without filling data
    const saveButton = screen.getByText('≈÷«›… «·„ »—⁄');
    fireEvent.click(saveButton);

    // Should show error toast (button is disabled actually, so we check if it's disabled)
    expect(saveButton).toBeDisabled();
  });

  it('renders donor cards with correct information', () => {
    render(
      <BrowserRouter>
        <DonorsScreen />
      </BrowserRouter>
    );

    expect(screen.getByText('√Õ„œ „Õ„œ «·”⁄Ìœ')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('150,000')).toBeInTheDocument();
  });
});
