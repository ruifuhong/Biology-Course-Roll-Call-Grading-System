import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StudentManagement from '../../components/StudentManagement.jsx';

vi.mock('../../components/StudentList.jsx', () => ({
  default: ({ semester }) => (
    <div data-testid="student-list">StudentList Component - {semester}</div>
  )
}));

vi.mock('../../components/AttendanceView.jsx', () => ({
  default: ({ semester }) => (
    <div data-testid="attendance-view">AttendanceView Component - {semester}</div>
  )
}));

describe('StudentManagement', () => {
  const mockSemester = '1131';

  it('renders with correct semester in header', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    expect(screen.getByText('Student Management - 1131 / 學生管理 - 1131')).toBeInTheDocument();
  });

  it('displays bilingual text in tab buttons', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    expect(screen.getByText('👥 Manage Students / 管理學生')).toBeInTheDocument();
    expect(screen.getByText('📊 View Attendance / 查看出席')).toBeInTheDocument();
  });

  it('defaults to students view', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    expect(screen.getByTestId('student-list')).toBeInTheDocument();
    expect(screen.getByText('StudentList Component - 1131')).toBeInTheDocument();
    
    expect(screen.queryByTestId('attendance-view')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes to active and inactive tabs', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    const studentsTab = screen.getByText('👥 Manage Students / 管理學生');
    const attendanceTab = screen.getByText('📊 View Attendance / 查看出席');
    
    expect(studentsTab).toHaveClass('btn', 'btn-primary');
    expect(studentsTab).not.toHaveClass('btn-secondary');
    
    expect(attendanceTab).toHaveClass('btn', 'btn-secondary');
    expect(attendanceTab).not.toHaveClass('btn-primary');
  });

  it('switches to attendance view when attendance tab is clicked', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    const attendanceTab = screen.getByText('📊 View Attendance / 查看出席');
    
    fireEvent.click(attendanceTab);
    
    expect(screen.getByTestId('attendance-view')).toBeInTheDocument();
    expect(screen.getByText('AttendanceView Component - 1131')).toBeInTheDocument();
    
    expect(screen.queryByTestId('student-list')).not.toBeInTheDocument();
  });

  it('updates tab CSS classes when switching views', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    const studentsTab = screen.getByText('👥 Manage Students / 管理學生');
    const attendanceTab = screen.getByText('📊 View Attendance / 查看出席');
    
    fireEvent.click(attendanceTab);
    
    expect(attendanceTab).toHaveClass('btn', 'btn-primary');
    expect(attendanceTab).not.toHaveClass('btn-secondary');
    
    expect(studentsTab).toHaveClass('btn', 'btn-secondary');
    expect(studentsTab).not.toHaveClass('btn-primary');
  });

  it('switches back to students view when students tab is clicked', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    const studentsTab = screen.getByText('👥 Manage Students / 管理學生');
    const attendanceTab = screen.getByText('📊 View Attendance / 查看出席');
    
    fireEvent.click(attendanceTab);
    expect(screen.getByTestId('attendance-view')).toBeInTheDocument();
    
    fireEvent.click(studentsTab);
    
    expect(screen.getByTestId('student-list')).toBeInTheDocument();
    expect(screen.getByText('StudentList Component - 1131')).toBeInTheDocument();
    
    expect(screen.queryByTestId('attendance-view')).not.toBeInTheDocument();
  });

  it('passes semester prop correctly to child components', () => {
    const customSemester = '1142';
    render(<StudentManagement semester={customSemester} />);
    
    expect(screen.getByText('StudentList Component - 1142')).toBeInTheDocument();
    
    const attendanceTab = screen.getByText('📊 View Attendance / 查看出席');
    fireEvent.click(attendanceTab);
    
    expect(screen.getByText('AttendanceView Component - 1142')).toBeInTheDocument();
  });

  it('renders with proper component structure', () => {
    render(<StudentManagement semester={mockSemester} />);
    
    const container = screen.getByText('Student Management - 1131 / 學生管理 - 1131').closest('div');
    expect(container).toHaveClass('student-management');
    
    const tabsContainer = screen.getByText('👥 Manage Students / 管理學生').closest('div');
    expect(tabsContainer).toHaveClass('view-mode-tabs');
  });
});