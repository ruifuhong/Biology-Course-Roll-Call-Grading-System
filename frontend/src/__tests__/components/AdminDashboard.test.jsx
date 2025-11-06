import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '../../AdminDashboard.jsx';

vi.mock('../../StudentManagement', () => ({
  default: ({ semester }) => (
    <div data-testid="student-management">
      Student Management - Semester: {semester}
    </div>
  )
}));

vi.mock('../../SessionManagement', () => ({
  default: ({ semester }) => (
    <div data-testid="session-management">
      Session Management - Semester: {semester}
    </div>
  )
}));

describe('AdminDashboard - Integration Tests', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-11-06'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Semester Dropdown', () => {
    it('should render semester dropdown with generated options', async () => {
      render(<AdminDashboard />);
      
      const semesterSelect = screen.getByRole('combobox');
      expect(semesterSelect).toBeInTheDocument();
      
      const options = screen.getAllByRole('option');
      
      expect(screen.getByRole('option', { name: /114-1.*Fall 2025/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /113-2.*Spring 2025/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /113-1.*Fall 2024/ })).toBeInTheDocument();
    });

    it('should default to most recent semester', () => {
      render(<AdminDashboard />);
      
      const semesterSelect = screen.getByRole('combobox');
      expect(semesterSelect.value).toBe('1141');
    });

    it('should update semester when dropdown selection changes', () => {
      render(<AdminDashboard />);
      
      const semesterSelect = screen.getByRole('combobox');
      
      fireEvent.change(semesterSelect, { target: { value: '1131' } });
      
      expect(semesterSelect.value).toBe('1131');
    });
  });

  describe('Tab Navigation', () => {
    it('should show StudentManagement by default', () => {
      render(<AdminDashboard />);
      
      const studentTab = screen.getByRole('button', { name: /學生管理.*Student Management/ });
      expect(studentTab).toHaveClass('active');
      
      expect(screen.getByTestId('student-management')).toBeInTheDocument();
      expect(screen.queryByTestId('session-management')).not.toBeInTheDocument();
    });

    it('should switch to SessionManagement when sessions tab is clicked', () => {
      render(<AdminDashboard />);
      
      const sessionsTab = screen.getByRole('button', { name: /課程日期.*Session Dates/ });
      fireEvent.click(sessionsTab);
      
      expect(sessionsTab).toHaveClass('active');
      
      expect(screen.getByTestId('session-management')).toBeInTheDocument();
      expect(screen.queryByTestId('student-management')).not.toBeInTheDocument();
    });

    it('should switch back to StudentManagement when students tab is clicked', () => {
      render(<AdminDashboard />);
      
      const sessionsTab = screen.getByRole('button', { name: /課程日期.*Session Dates/ });
      fireEvent.click(sessionsTab);
      expect(screen.getByTestId('session-management')).toBeInTheDocument();
      
      const studentTab = screen.getByRole('button', { name: /學生管理.*Student Management/ });
      fireEvent.click(studentTab);
      
      expect(studentTab).toHaveClass('active');
      expect(screen.getByTestId('student-management')).toBeInTheDocument();
      expect(screen.queryByTestId('session-management')).not.toBeInTheDocument();
    });

    it('should show correct tab button states', () => {
      render(<AdminDashboard />);
      
      const studentTab = screen.getByRole('button', { name: /學生管理.*Student Management/ });
      const sessionsTab = screen.getByRole('button', { name: /課程日期.*Session Dates/ });
      
      expect(studentTab).toHaveClass('active');
      expect(sessionsTab).not.toHaveClass('active');
      
      fireEvent.click(sessionsTab);
      expect(studentTab).not.toHaveClass('active');
      expect(sessionsTab).toHaveClass('active');
    });
  });

  describe('Component Integration', () => {
    it('should pass current semester to StudentManagement component', () => {
      render(<AdminDashboard />);
      
      const studentComponent = screen.getByTestId('student-management');
      expect(studentComponent).toHaveTextContent('Student Management - Semester: 1141');
    });

    it('should pass current semester to SessionManagement component', () => {
      render(<AdminDashboard />);
      
      const sessionsTab = screen.getByRole('button', { name: /課程日期.*Session Dates/ });
      fireEvent.click(sessionsTab);
      
      const sessionComponent = screen.getByTestId('session-management');
      expect(sessionComponent).toHaveTextContent('Session Management - Semester: 1141');
    });

    it('should update child component when semester changes', () => {
      render(<AdminDashboard />);
      
      const semesterSelect = screen.getByRole('combobox');
      
      fireEvent.change(semesterSelect, { target: { value: '1131' } });
      
      const studentComponent = screen.getByTestId('student-management');
      expect(studentComponent).toHaveTextContent('Student Management - Semester: 1131');
    });

    it('should maintain semester selection when switching between tabs', () => {
      render(<AdminDashboard />);
      
      const semesterSelect = screen.getByRole('combobox');
      const sessionsTab = screen.getByRole('button', { name: /課程日期.*Session Dates/ });
      
      fireEvent.change(semesterSelect, { target: { value: '1132' } });
      
      fireEvent.click(sessionsTab);
      
      expect(semesterSelect.value).toBe('1132');
      const sessionComponent = screen.getByTestId('session-management');
      expect(sessionComponent).toHaveTextContent('Session Management - Semester: 1132');
    });
  });

  describe('Basic UI Elements', () => {
    it('should display dashboard title', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByRole('heading', { name: /TA Admin Dashboard.*助教管理面板/ })).toBeInTheDocument();
    });

    it('should display semester selector label', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByText(/Semester.*學期:/)).toBeInTheDocument();
    });

    it('should display both tab buttons', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByRole('button', { name: /學生管理.*Student Management/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /課程日期.*Session Dates/ })).toBeInTheDocument();
    });
  });
});