import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AttendanceView from '../../components/AttendanceView.jsx';

const mockAttendanceLecture = [
  { student_id: 'B100000001', name: 'John', department: 'Bio', attendance: { '2025-11-19': true, '2025-11-20': false } },
  { student_id: 'B100000002', name: 'Jane', department: 'Chem', attendance: { '2025-11-19': false, '2025-11-20': true } }
];
const mockAttendanceDiscussion = [
  { student_id: 'B100000001', name: 'John', department: 'Bio', attendance: { '2025-12-19': true } },
  { student_id: 'B100000002', name: 'Jane', department: 'Chem', attendance: { '2025-12-20': false } }
];
const mockSessionDatesLecture = [
  { actual_date: '2025-11-19', session_order: 1 },
  { actual_date: '2025-11-20', session_order: 2 }
];
const mockSessionDatesDiscussion = [
  { actual_date: '2025-12-19', session_order: 1 },
  { actual_date: '2025-12-20', session_order: 2 }
];

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('AttendanceView Frontend', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('displays all students and attendance for lecture', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAttendanceLecture });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockSessionDatesLecture });
    render(<AttendanceView semester="1131" />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('11/19')).toBeInTheDocument();
      expect(screen.getByText('11/20')).toBeInTheDocument();
    });
  });

  it('switches to discussion tab and displays correct data', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAttendanceLecture });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockSessionDatesLecture });
    render(<AttendanceView semester="1131" />);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockAttendanceDiscussion });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockSessionDatesDiscussion });
    fireEvent.click(screen.getByText(/Discussion/));
    await waitFor(() => {
      expect(screen.getByText('12/19')).toBeInTheDocument();
      expect(screen.getByText('12/20')).toBeInTheDocument();
    });
  });

  it('shows error message when fetch fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    render(<AttendanceView semester="1131" />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });
  });

  it('shows loading state during fetch', async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    render(<AttendanceView semester="1131" />);
    expect(screen.getAllByText(/Loading/).length).toBeGreaterThan(0);

  });
});
