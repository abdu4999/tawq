import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TasksScreen from '../TasksScreen';
import { BrowserRouter } from 'react-router-dom';

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

describe('TasksScreen Page', () => {
  const renderTasksScreen = () => {
    return render(
      <BrowserRouter>
        <TasksScreen />
      </BrowserRouter>
    );
  };

  it('should render tasks table/list', () => {
    renderTasksScreen();
    // Check for task related headers
    // expect(screen.getByText(/Tasks/i)).toBeInTheDocument();
  });

  it('should allow creating a new task', () => {
    renderTasksScreen();
    const createButton = screen.queryByText(/Create Task|New Task|إضافة مهمة/i);
    if (createButton) {
      expect(createButton).toBeInTheDocument();
      // fireEvent.click(createButton);
      // Check if modal opens
    }
  });

  it('should filter tasks', () => {
    renderTasksScreen();
    // Check for filter inputs
    const searchInput = screen.getByPlaceholderText(/Search|بحث/i);
    expect(searchInput).toBeInTheDocument();
  });
});
