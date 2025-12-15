import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import LectureRollcall from '../../components/LectureRollcall';
import DiscussionRollcall from '../../components/DiscussionRollcall';

afterEach(() => {
  vi.resetAllMocks();
});

describe('Feedback submission (Lecture & Discussion)', () => {
  function baseFetchMock({ sessionType }) {
    return (url, options) => {
      if (sessionType === 'lecture' && url.includes('/sessions/lecture-dates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { actual_date: new Date().toISOString(), session_order: 1, is_active: true }
          ])
        });
      }
      if (sessionType === 'discussion' && url.includes('/sessions/discussion-dates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { actual_date: new Date().toISOString(), session_order: 1, is_active: true }
          ])
        });
      }
      if (url.includes('/students/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            name: 'John Doe',
            department: 'CS',
            student_id: 'B100000001'
          })
        });
      }
      if (url.includes('/attendance/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' })
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    };
  }
  
  function fillAndSubmitFeedback({ studentId = 'B100000001', feedback = 'Great class!' }) {
    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: studentId } });
    return waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()).then(() => {
      fireEvent.change(screen.getByLabelText(/Feedback/i), { target: { value: feedback } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });
  }

  function fillAndSubmitEmptyFeedback({ studentId = 'B100000001', feedback = '' }) {
    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: studentId } });
    return waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()).then(() => {
      fireEvent.change(screen.getByLabelText(/Feedback/i), { target: { value: feedback } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });
  }

  describe('success', () => {
    function setFetchForSession(sessionType) {
      const base = baseFetchMock({ sessionType });
      global.fetch = vi.fn((url, options) => {
        if (url.includes('/feedback')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Success' })
          });
        }
        return base(url, options);
      });
    }

    it('submits feedback for lecture', async () => {
      setFetchForSession('lecture');
      render(<LectureRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();
    });

    it('submits feedback for discussion', async () => {
      setFetchForSession('discussion');
      render(<DiscussionRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();
    });

    it('submits empty feedback for lecture', async () => {
      setFetchForSession('lecture');
      render(<LectureRollcall />);
      await fillAndSubmitEmptyFeedback({});
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();
    });

    it('submits empty feedback for discussion', async () => {
      setFetchForSession('discussion');
      render(<DiscussionRollcall />);
      await fillAndSubmitEmptyFeedback({});
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();
    });

    it('submits extremely long feedback for lecture', async () => {
      setFetchForSession('lecture');
      render(<LectureRollcall />);

      const longFeedback = 'A'.repeat(5000);
      await fillAndSubmitFeedback({ feedback: longFeedback });
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();

      const feedbackCall = global.fetch.mock.calls.find(([url]) => url.includes('/feedback'));
      expect(feedbackCall).toBeTruthy();
      if (feedbackCall) {
        const [, options] = feedbackCall;
        expect(options.body).toContain(longFeedback);
      }
    });

    it('submits extremely long feedback for discussion', async () => {
      setFetchForSession('discussion');
      render(<DiscussionRollcall />);

      const longFeedback = 'A'.repeat(5000);
      await fillAndSubmitFeedback({ feedback: longFeedback });
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();

      const feedbackCall = global.fetch.mock.calls.find(([url]) => url.includes('/feedback'));
      expect(feedbackCall).toBeTruthy();
      if (feedbackCall) {
        const [, options] = feedbackCall;
        expect(options.body).toContain(longFeedback);
      }
    });

    it('ignores feedback with only whitespace for lecture', async () => {
      setFetchForSession('lecture');
      render(<LectureRollcall />);
      
      await fillAndSubmitFeedback({ feedback: '   \n\t  ' });
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();
      
      const feedbackCall = global.fetch.mock.calls.find(([url]) => url.includes('/feedback'));
      expect(feedbackCall).toBeUndefined();
    });

    it('ignores feedback with only whitespace for discussion', async () => {
      setFetchForSession('discussion');
      render(<DiscussionRollcall />);

      await fillAndSubmitFeedback({ feedback: '   \n\t  ' });
      expect(await screen.findByText(/成功|Attendance and feedback submitted/i)).toBeInTheDocument();
      
      const feedbackCall = global.fetch.mock.calls.find(([url]) => url.includes('/feedback'));
      expect(feedbackCall).toBeUndefined();
    });
  });

  describe('server error', () => {
    function mockFetchWithFeedbackError({ sessionType }) {
      const base = baseFetchMock({ sessionType });
      global.fetch = vi.fn((url, options) => {
        if (url.includes('/feedback')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Server error' })
          });
        }
        return base(url, options);
      });
    }

    it('handles server error on feedback submission (lecture)', async () => {
      mockFetchWithFeedbackError({ sessionType: 'lecture' });
      render(<LectureRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/error|server error/i)).toBeInTheDocument();
    });

    it('handles server error on feedback submission (discussion)', async () => {
      mockFetchWithFeedbackError({ sessionType: 'discussion' });
      render(<DiscussionRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/error|server error/i)).toBeInTheDocument();
    });
  });

  describe('network failure', () => {
    function mockFetchWithNetworkFailure({ sessionType }) {
      const base = baseFetchMock({ sessionType });
      global.fetch = vi.fn((url, options) => {
        if (url.includes('/feedback')) {
          return Promise.reject(new Error('Network error'));
        }
        return base(url, options);
      });
    }

    it('handles network failure on feedback submission (lecture)', async () => {
      mockFetchWithNetworkFailure({ sessionType: 'lecture' });
      render(<LectureRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/error|network error/i)).toBeInTheDocument();
    });

    it('handles network failure on feedback submission (discussion)', async () => {
      mockFetchWithNetworkFailure({ sessionType: 'discussion' });
      render(<DiscussionRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/error|network error/i)).toBeInTheDocument();
    });
  });

  describe('not found error', () => {
    function mockFetchWithNotFound({ sessionType }) {
      const base = baseFetchMock({ sessionType });
      global.fetch = vi.fn((url, options) => {
        if (url.includes('/feedback')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Not found' })
          });
        }
        return base(url, options);
      });
    }

    it('handles 404 not found on feedback submission (lecture)', async () => {
      mockFetchWithNotFound({ sessionType: 'lecture' });
      render(<LectureRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/not found|404|error/i)).toBeInTheDocument();
    });

    it('handles 404 not found on feedback submission (discussion)', async () => {
      mockFetchWithNotFound({ sessionType: 'discussion' });
      render(<DiscussionRollcall />);
      await fillAndSubmitFeedback({});
      expect(await screen.findByText(/not found|404|error/i)).toBeInTheDocument();
    });
  });

  describe('timeout or slow response', () => {
    function mockFetchWithTimeout({ sessionType }) {
      const base = baseFetchMock({ sessionType });
      global.fetch = vi.fn((url, options) => {
        if (url.includes('/feedback')) {
          return new Promise(() => {});
        }
        return base(url, options);
      });
    }

    it('shows loading indicator during timeout on feedback submission (lecture)', async () => {
      mockFetchWithTimeout({ sessionType: 'lecture' });
      render(<LectureRollcall />);
      await fillAndSubmitFeedback({});
      expect(screen.getByText(/loading|submitting|please wait/i)).toBeInTheDocument();
      expect(screen.queryByText(/成功|Attendance and feedback submitted/i)).not.toBeInTheDocument();
    });

    it('shows loading indicator during timeout on feedback submission (discussion)', async () => {
      mockFetchWithTimeout({ sessionType: 'discussion' });
      render(<DiscussionRollcall />);
      await fillAndSubmitFeedback({});
      expect(screen.getByText(/loading|submitting|please wait/i)).toBeInTheDocument();
      expect(screen.queryByText(/成功|Attendance and feedback submitted/i)).not.toBeInTheDocument();
    });
  });
});