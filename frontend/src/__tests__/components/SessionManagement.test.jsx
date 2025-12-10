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

    it('should show error message if initial fetch throws', async () => {
      fetch.mockClear();
      fetch.mockRejectedValueOnce(new Error('Test error'));
      render(<SessionManagement semester="1131" />);
      await waitFor(() => {
        expect(screen.getByText(/Error loading session dates/)).toBeInTheDocument();
      });
    });
  });

    describe('Tab Switching', () => {
    it('switches to lecture tab when lecture button is clicked', async () => {
      const lectureDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: true }];
      const discussionDates = [{ semester: '1141', actual_date: '2025-01-02', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => lectureDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => discussionDates });

      await renderAndWaitForLoad("1141");

      fireEvent.click(screen.getByText('討論課 (Discussion)'));
      await waitFor(() => {
        expect(screen.getByText(/Discussion Dates/)).toBeInTheDocument();
        expect(screen.getByText('2025-01-02')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('正課 (Lecture)'));
      await waitFor(() => {
        expect(screen.getByText(/Lecture Dates/)).toBeInTheDocument();
        expect(screen.getByText('2025-01-01')).toBeInTheDocument();
      });
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
    it('should show error message if adding date fails', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Add failed' }) });

      await renderAndWaitForLoad("1131");

      const addButton = screen.getByText('➕ Add Date Field');

      await act(async () => { fireEvent.click(addButton); });

      const dateInput = await screen.findByDisplayValue('');

      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-15' } }); });

      await waitFor(() => {
        expect(screen.getByText(/Error: Add failed/)).toBeInTheDocument();
      });
    });

    it('should show error if discussion dates fetch fails', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Discussion fetch failed' }) }); // discussion

      await renderAndWaitForLoad("1131");

      await waitFor(() => {
        expect(screen.getByText(/No session dates set for this semester/)).toBeInTheDocument();
      });
    });

    it('should show error for invalid semester format', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("9999");

      const addButton = screen.getByText('➕ Add Date Field');

      await act(async () => { fireEvent.click(addButton); });

      const dateInput = await screen.findByDisplayValue('');

      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-15' } }); });

      await waitFor(() => {
        expect(screen.getByText(/Invalid semester format/)).toBeInTheDocument();
      });
    });

    it('should add lecture date and show success message', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      const lectureResult = [{ semester: '1131', actual_date: '2024-11-20', is_active: false }];
      fetch.mockResolvedValueOnce({ ok: true, json: async () => lectureResult });

      await renderAndWaitForLoad("1131");

      const lectureTab = screen.getByText('正課 (Lecture)');
      await act(async () => { fireEvent.click(lectureTab); });

      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => { fireEvent.click(addButton); });

      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-11-20' } });
      });

      await waitFor(() => {
        expect(screen.getByText('2024-11-20')).toBeInTheDocument();
        expect(screen.getByText('Lecture dates set successfully')).toBeInTheDocument();
      });
    });

    it('should add discussion date and show success message', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
  
      const discussionResult = [{ semester: '1131', actual_date: '2024-11-15', is_active: false }];
      fetch.mockResolvedValueOnce({ ok: true, json: async () => discussionResult });

      await renderAndWaitForLoad("1131");
      const discussionTab = screen.getByText('討論課 (Discussion)');
      await act(async () => { fireEvent.click(discussionTab); });

      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => { fireEvent.click(addButton); });

      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-11-15' } });
      });

      await waitFor(() => {
        expect(screen.getByText('2024-11-15')).toBeInTheDocument();
        expect(screen.getByText('Discussion dates set successfully')).toBeInTheDocument();
      });
    });
    
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

    it('should add a date for the fall semester (first semester) and show success message', async () => {
      const mockResponse = [
      { semester: '1131', actual_date: '2024-09-10', is_active: false }
      ];

      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture fetch
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion fetch
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse }); // add date

      await renderAndWaitForLoad("1131");

      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
      fireEvent.click(addButton);
      });

      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
      fireEvent.change(dateInput, { target: { value: '2024-09-10' } });
      });

      await waitFor(() => {
      expect(screen.getByText('2024-09-10')).toBeInTheDocument();
      expect(screen.getByText('Lecture dates set successfully')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should add a date for the spring semester (second semester) and show success message', async () => {
      const mockResponse = [
      { semester: '1132', actual_date: '2025-03-10', is_active: false }
      ];

      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture fetch
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion fetch
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse }); // add date

      await renderAndWaitForLoad("1132");

      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
      fireEvent.click(addButton);
      });

      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
      fireEvent.change(dateInput, { target: { value: '2025-03-10' } });
      });

      await waitFor(() => {
      expect(screen.getByText('2025-03-10')).toBeInTheDocument();
      expect(screen.getByText('Lecture dates set successfully')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show error message when adding a duplicate date', async () => {
      const initialDates = [
        { semester: '1131', actual_date: '2024-10-15', is_active: false }
      ];

      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Date 2024-10-15 already exists for semester 1131' })
      });

      await renderAndWaitForLoad("1131");

      expect(screen.getByText('2024-10-15')).toBeInTheDocument();

      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => {
        fireEvent.click(addButton);
      });

      const dateInput = await screen.findByDisplayValue('');
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2024-10-15' } });
      });

       await waitFor(() => {
        expect(screen.getByText(/Date 2024-10-15 already exists for semester 1131/)).toBeInTheDocument();
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
        fireEvent.change(dateInput, { target: { value: '2020-07-15' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Date must be between/)).toBeInTheDocument();
      });
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

  describe('Handle Delete Operations', () => {
    it('deletes a lecture date and shows success message', async () => {
      const initialDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: true }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // lecture
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion
      fetch.mockResolvedValueOnce({ ok: true }); // DELETE

      await renderAndWaitForLoad("1141");
      window.confirm = vi.fn(() => true);
      
      await waitFor(() => screen.getByText(/Lecture Dates/i));

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Session date deleted successfully')).toBeInTheDocument();
      });
    });

    it('deletes a discussion date and shows success message', async () => {
      const initialDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: true }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // discussion
      fetch.mockResolvedValueOnce({ ok: true }); // DELETE

      await renderAndWaitForLoad("1141");
      window.confirm = vi.fn(() => true);

      fireEvent.click(screen.getByText('討論課 (Discussion)'));

      await waitFor(() => screen.getByText(/Discussion Dates/i));

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Discussion session date deleted successfully')).toBeInTheDocument();
      });
    });

    it('should show error if deleting date fails', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Delete failed' }) });

      await renderAndWaitForLoad("1131");

      window.confirm = vi.fn(() => true);

      const deleteButton = screen.getByText('Delete');

            await act(async () => { fireEvent.click(deleteButton); });

      await waitFor(() => {
        expect(screen.getByText(/Error: Delete failed/)).toBeInTheDocument();
      });
    });

    it('should not delete date if confirmation is cancelled', async () => {
      const initialDates = [ { semester: '1131', actual_date: '2024-10-15', is_active: false } ];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("1131");

      window.confirm = vi.fn(() => false);

      const deleteButton = screen.getByText('Delete');

      await act(async () => { fireEvent.click(deleteButton); });

      expect(screen.getByText('2024-10-15')).toBeInTheDocument();
    });

     it('should delete a lecture date and show success message', async () => {
    const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // lecture fetch
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion fetch
    fetch.mockResolvedValueOnce({ ok: true }); // DELETE

    await renderAndWaitForLoad("1131");
    window.confirm = vi.fn(() => true);

    const deleteButton = screen.getByText('Delete');
    await act(async () => { fireEvent.click(deleteButton); });

    await waitFor(() => {
      expect(screen.getByText('Session date deleted successfully')).toBeInTheDocument();
    });
    expect(screen.queryByText('2024-10-15')).not.toBeInTheDocument();
  });

  it('should delete a discussion date and show success message', async () => {
    const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture fetch
    fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // discussion fetch
    fetch.mockResolvedValueOnce({ ok: true }); // DELETE

    await renderAndWaitForLoad("1131");
    window.confirm = vi.fn(() => true);

    fireEvent.click(screen.getByText('討論課 (Discussion)'));
    await waitFor(() => screen.getByText(/Discussion Dates/i));

    const deleteButton = screen.getByText('Delete');
    await act(async () => { fireEvent.click(deleteButton); });

    await waitFor(() => {
      expect(screen.getByText('Discussion session date deleted successfully')).toBeInTheDocument();
    });
    expect(screen.queryByText('2024-10-15')).not.toBeInTheDocument();
  });
  });

  describe('Handle Editing Operations', () => {    
    it('should update lecture date and show success message', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      const updatedDate = { semester: '1131', actual_date: '2024-10-16', is_active: false };
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => updatedDate });

      await renderAndWaitForLoad("1131");

      const editButton = screen.getByText('Edit Date');

      await act(async () => { fireEvent.click(editButton); });

      const dateInput = screen.getByDisplayValue('2024-10-15');

      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-16' } }); });
      await act(async () => { fireEvent.click(screen.getByText('Save')); });

      await waitFor(() => {
        expect(screen.getByText('2024-10-16')).toBeInTheDocument();
        expect(screen.getByText('Date updated successfully')).toBeInTheDocument();
      });
    });

    it('should update discussion date and show success message', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-11-15', is_active: false }];
      const updatedDate = { semester: '1131', actual_date: '2024-11-16', is_active: false };

      fetch.mockClear();

      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => updatedDate });

      await renderAndWaitForLoad("1131");

      const discussionTab = screen.getByText('討論課 (Discussion)');

      await act(async () => { fireEvent.click(discussionTab); });

      const editButton = screen.getByText('Edit Date');

      await act(async () => { fireEvent.click(editButton); });

      const dateInput = screen.getByDisplayValue('2024-11-15');

      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-11-16' } }); });
      await act(async () => { fireEvent.click(screen.getByText('Save')); });

      await waitFor(() => {
        expect(screen.getByText('2024-11-16')).toBeInTheDocument();
        expect(screen.getByText('Discussion date updated successfully')).toBeInTheDocument();
      });
    });

    it('should show Save and Cancel buttons when editing date', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];

      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("1131");

      const editButton = screen.getByText('Edit Date');

      await act(async () => { fireEvent.click(editButton); });

      expect(screen.getByText('Save')).toBeInTheDocument();

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should alert if edit date is empty', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ semester: '1131', actual_date: '2024-10-15', is_active: false }] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("1131");

      window.alert = vi.fn();

      const editButton = screen.getByText('Edit Date');

      await act(async () => { fireEvent.click(editButton); });

      const saveButton = screen.getByText('Save');

      await act(async () => { fireEvent.change(screen.getByDisplayValue('2024-10-15'), { target: { value: '' } }); });
      await act(async () => { fireEvent.click(saveButton); });

      expect(window.alert).toHaveBeenCalledWith('Please enter a valid date');
    });

    it('should cancel edit and reset state', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ semester: '1131', actual_date: '2024-10-15', is_active: false }] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await renderAndWaitForLoad("1131");

      const editButton = screen.getByText('Edit Date');

      await act(async () => { fireEvent.click(editButton); });

      const cancelButton = screen.getByText('Cancel');

      await act(async () => { fireEvent.click(cancelButton); });

      expect(screen.queryByDisplayValue('2024-10-15')).not.toBeInTheDocument();
    });
  });

  describe('Toggle Attendance', () => {
     it('should show correct attendance status and toggle', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      const toggledDate = { semester: '1131', actual_date: '2024-10-15', is_active: true };

      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => toggledDate });

      await renderAndWaitForLoad("1131");

      expect(screen.getByText('🔴 關閉中 Closed')).toBeInTheDocument();

      const toggleButton = screen.getByTitle('Click to enable attendance submission');

      await act(async () => { fireEvent.click(toggleButton); });

      await waitFor(() => {
        expect(screen.getByText('🟢 開放中 Open')).toBeInTheDocument();
      });
    });

    it('updates lectureDates when toggling attendance for a lecture date', async () => {
      const initialDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: false }];
      const toggledDate = { semester: '1141', actual_date: '2025-01-01', is_active: true };
      
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // lecture fetch
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion fetch
      fetch.mockResolvedValueOnce({ ok: true, json: async () => toggledDate }); // PATCH

      await renderAndWaitForLoad("1141");
      window.confirm = vi.fn(() => true);

      await waitFor(() => screen.getByText(/Lecture Dates/i));
      expect(screen.getByText('🔴 關閉中 Closed')).toBeInTheDocument();

      fireEvent.click(screen.getByTitle('Click to enable attendance submission'));

      await waitFor(() => {
      expect(screen.getByText('🟢 開放中 Open')).toBeInTheDocument();
      expect(screen.getByText('Attendance submission enabled for Session 2025-01-01')).toBeInTheDocument();
      });
    });

    it('updates discussionDates when toggling attendance for a discussion date', async () => {
    const initialDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: false }];
    const toggledDate = { semester: '1141', actual_date: '2025-01-01', is_active: true };
    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
    fetch.mockResolvedValueOnce({ ok: true, json: async () => toggledDate });

    await renderAndWaitForLoad("1141");
    window.confirm = vi.fn(() => true);

    fireEvent.click(screen.getByText('討論課 (Discussion)'));

    await waitFor(() => screen.getByText(/Discussion Dates/i));
    expect(screen.getByText('🔴 關閉中 Closed')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Click to enable attendance submission'));

    await waitFor(() => {
      expect(screen.getByText('🟢 開放中 Open')).toBeInTheDocument();
      expect(screen.getByText('Attendance submission enabled for Session 2025-01-01')).toBeInTheDocument();
    });
  });

   it('should show error if PATCH fails on toggle attendance', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];

      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Toggle failed' }) });

      await renderAndWaitForLoad("1131");

      const toggleButton = screen.getByTitle('Click to enable attendance submission');

      await act(async () => { fireEvent.click(toggleButton); });

      await waitFor(() => {
        expect(screen.getByText('Error: Toggle failed')).toBeInTheDocument();
      });
    });
  });
});