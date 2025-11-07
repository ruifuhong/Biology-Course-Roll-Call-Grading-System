import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SessionManagement from '../../components/SessionManagement.jsx';

global.fetch = vi.fn();

describe('SessionManagement - Add Session Date Full Stack Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });
  });

  const renderAndWaitForLoad = async (semester) => {
    const result = render(<SessionManagement semester={semester} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      const button = screen.getByText('➕ Add Date Field');
      expect(button).not.toBeDisabled();
    }, { timeout: 3000 });
    
    return result;
  };

  describe('UI Components', () => {
    it('should display semester information', async () => {
      await renderAndWaitForLoad("1131");
      
      expect(screen.getByText('Session Date Management - 1131')).toBeInTheDocument();
    });

    it('should show valid date range for semester 113-1', async () => {
      await renderAndWaitForLoad("1131");
      
      expect(screen.getByText(/Valid date range for 113-1: 2024-08-01 to 2025-01-31/))
        .toBeInTheDocument();
    });

    it('should show Add Date Field button', async () => {
      await renderAndWaitForLoad("1131");
      
      const button = screen.getByText('➕ Add Date Field');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should show date picker when Add Date Field is clicked', async () => {
      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('')).toBeInTheDocument();
      });
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Date Range Validation (getSemesterDateRange)', () => {
    it('should calculate correct range for fall semester (113-1)', async () => {
      await renderAndWaitForLoad("1131");
      
      expect(screen.getByText(/2024-08-01 to 2025-01-31/)).toBeInTheDocument();
    });

    it('should calculate correct range for spring semester (113-2)', async () => {
      await renderAndWaitForLoad("1132");
      
      expect(screen.getByText(/2025-02-01 to 2025-07-31/)).toBeInTheDocument();
    });

    it('should handle future semesters (114-1)', async () => {
      await renderAndWaitForLoad("1141");
      
      expect(screen.getByText(/2025-08-01 to 2026-01-31/)).toBeInTheDocument();
    });
  });

  describe('Date Selection and API Call (handleDateSelect + handleSetDates)', () => {
    it('should make API call when valid date is selected', async () => {
      const mockResponse = [
        { semester: '1131', actual_date: '2024-10-15', is_active: false }
      ];
      
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      const dateInput = await screen.findByDisplayValue('');
      
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-10-15' } });
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/sessions/lecture-dates',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              semester: '1131', 
              dates: ['2024-10-15'] 
            })
          })
        );
      }, { timeout: 5000 });
    });

    it('should show success message after successful date addition', async () => {
      const mockResponse = [
        { semester: '1131', actual_date: '2024-10-15', is_active: false }
      ];
      
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-10-15' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Lecture dates set successfully')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show error message when API call fails', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Date already exists' })
      });

      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-10-15' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Error: Date already exists')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Frontend Date Validation (validateDateForSemester)', () => {
    it('should reject dates outside semester range', async () => {
      fetch.mockClear();
      fetch.mockResolvedValue({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      const dateInput = await screen.findByDisplayValue('');
      
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-07-15' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Date must be between/)).toBeInTheDocument();
      });
      
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should accept dates within semester range', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-10-15' } });
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/sessions/lecture-dates'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Date Picker UI Interaction', () => {
    it('should hide date picker after successful submission', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      const dateInput = await screen.findByDisplayValue('');
      expect(dateInput).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-10-15' } });
      });

      await waitFor(() => {
        expect(screen.queryByDisplayValue('')).not.toBeInTheDocument();
      });
      expect(screen.getByText('➕ Add Date Field')).toBeInTheDocument();
    });

    it('should hide date picker when Cancel is clicked', async () => {
      await renderAndWaitForLoad("1131");
      
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      const dateInput = await screen.findByDisplayValue('');
      expect(dateInput).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(screen.getByText('Cancel'));
      });
      
      await waitFor(() => {
        expect(screen.queryByDisplayValue('')).not.toBeInTheDocument();
      });
      expect(screen.getByText('➕ Add Date Field')).toBeInTheDocument();
    });
  });
});