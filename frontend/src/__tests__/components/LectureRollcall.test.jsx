import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LectureRollcall from '../../components/LectureRollcall.jsx';

const mockSessionInfo = {
  actual_date: new Date().toISOString().split('T')[0],
  is_active: true,
  courseType: 'lecture',
  courseName: '\u6b63\u8ab2 (Lecture)',
  semester: '1131'
};
const mockStudentInfo = { name: 'John Doe', department: 'Bio', studentID: '101035210' };

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('LectureRollcall Frontend', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('fetches and displays session info for today', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    render(<LectureRollcall />);
    await waitFor(() => {
      expect(screen.getByText(/Lecture/)).toBeInTheDocument();
    });
  });

  it('auto-populates student info on valid ID', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockStudentInfo });
    render(<LectureRollcall />);
    const input = screen.getByPlaceholderText(/student ID/);
    fireEvent.change(input, { target: { value: '101035210' } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bio')).toBeInTheDocument();
    });
  });

  it('submits attendance when session is open', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockStudentInfo });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    render(<LectureRollcall />);
    fireEvent.change(screen.getByPlaceholderText(/student ID/), { target: { value: '101035210' } });
    await waitFor(() => screen.getByDisplayValue('John Doe'));
    fireEvent.click(screen.getByText(/Submit Attendance/));
    await waitFor(() => {
     expect(screen.getByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();
    });
  });

  it('shows error for duplicate attendance', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockStudentInfo });
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Attendance has already been submitted for this session' }) });
    render(<LectureRollcall />);
    fireEvent.change(screen.getByPlaceholderText(/student ID/), { target: { value: '101035210' } });
    await waitFor(() => screen.getByDisplayValue('John Doe'));
    fireEvent.click(screen.getByText(/Submit Attendance/));
    await waitFor(() => {
      expect(screen.getByText(/Attendance has already been submitted for this session/)).toBeInTheDocument();
    });
  });

  it('prevents rapid double submission for lecture', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [mockSessionInfo] }) // session info
      .mockResolvedValueOnce({ ok: true, json: async () => mockStudentInfo }) // student info
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Success' }) }) // attendance
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Success' }) }); // feedback

    render(<LectureRollcall />);

    fireEvent.change(screen.getByPlaceholderText(/student ID/i), { target: { value: mockStudentInfo.studentID } });
    await waitFor(() => expect(screen.getByDisplayValue(mockStudentInfo.name)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Feedback/i), { target: { value: 'Double submit test' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();

    const feedbackCalls = fetchMock.mock.calls.filter(([url]) => url.includes('/feedback'));
    expect(feedbackCalls.length).toBe(1);
  });
});
