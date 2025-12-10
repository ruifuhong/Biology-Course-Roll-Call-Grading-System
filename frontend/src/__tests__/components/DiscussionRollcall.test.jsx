import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DiscussionRollcall from '../../components/DiscussionRollcall.jsx';

const mockSessionInfo = {
  actual_date: new Date().toISOString().split('T')[0],
  is_active: true,
  courseType: 'discussion',
  courseName: '\u8a0e\u8ad6\u8ab2 (Discussion)',
  semester: '1131'
};
const mockStudentInfo = { name: 'Jane Doe', department: 'Bio', studentID: '101035211' };

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('DiscussionRollcall Frontend', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('fetches and displays session info for today', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    render(<DiscussionRollcall />);
    await waitFor(() => {
      expect(screen.getByText(/Discussion/)).toBeInTheDocument();
    });
  });

  it('auto-populates student info on valid ID', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockStudentInfo });
    render(<DiscussionRollcall />);
    const input = screen.getByPlaceholderText(/student ID/);
    fireEvent.change(input, { target: { value: '101035211' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bio')).toBeInTheDocument();
    });
  });

  it('submits attendance when session is open', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockStudentInfo });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    render(<DiscussionRollcall />);
    fireEvent.change(screen.getByPlaceholderText(/student ID/), { target: { value: '101035211' } });
    await waitFor(() => screen.getByDisplayValue('Jane Doe'));
    fireEvent.click(screen.getByText(/Submit Attendance/));
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('shows error for duplicate attendance', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockStudentInfo });
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Attendance has already been submitted for this session' }) });
    render(<DiscussionRollcall />);
    fireEvent.change(screen.getByPlaceholderText(/student ID/), { target: { value: '101035211' } });
    await waitFor(() => screen.getByDisplayValue('Jane Doe'));
    fireEvent.click(screen.getByText(/Submit Attendance/));
    await waitFor(() => {
      expect(screen.getByText(/Attendance has already been submitted for this session/)).toBeInTheDocument();
    });
  });
});
