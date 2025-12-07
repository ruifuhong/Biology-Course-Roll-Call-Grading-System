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
        fireEvent.change(dateInput, { target: { value: '2024-07-15' } });
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

  describe('Error Handling', () => {
    it('should show error message if initial fetch throws', async () => {
      fetch.mockClear();
      fetch.mockRejectedValueOnce(new Error('Test error'));
      render(<SessionManagement semester="1131" />);
      await waitFor(() => {
        expect(screen.getByText(/Error loading session dates/)).toBeInTheDocument();
      });
    });

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
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture
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
      await renderAndWaitForLoad("9999"); // invalid format
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => { fireEvent.click(addButton); });
      const dateInput = await screen.findByDisplayValue('');
      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-15' } }); });
      await waitFor(() => {
        expect(screen.getByText(/Invalid semester format/)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Confirmation', () => {
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
  });

  describe('Empty Data Handling', () => {
    it('should show no data message when no session dates', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await renderAndWaitForLoad("1131");
      expect(screen.getByText('No session dates set for this semester.')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('switches to lecture tab when lecture button is clicked', async () => {
      const lectureDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: true }];
      const discussionDates = [{ semester: '1141', actual_date: '2025-01-02', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => lectureDates }); // lecture
      fetch.mockResolvedValueOnce({ ok: true, json: async () => discussionDates }); // discussion

      await renderAndWaitForLoad("1141");

      // Switch to discussion tab first
      fireEvent.click(screen.getByText('討論課 (Discussion)'));
      await waitFor(() => {
        expect(screen.getByText('Discussion Dates (1)')).toBeInTheDocument();
        expect(screen.getByText('2025-01-02')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('正課 (Lecture)'));
      await waitFor(() => {
        expect(screen.getByText('Lecture Dates (1)')).toBeInTheDocument();
        expect(screen.getByText('2025-01-01')).toBeInTheDocument();
      });
    });

    it('should switch tabs and show correct data', async () => {
      const lectureDates = [ { semester: '1131', actual_date: '2024-10-15', is_active: false } ];
      const discussionDates = [ { semester: '1131', actual_date: '2024-11-15', is_active: false } ];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => lectureDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => discussionDates });
      await renderAndWaitForLoad("1131");
      expect(screen.getByText('Lecture Dates (1)')).toBeInTheDocument();
      const discussionTab = screen.getByText('討論課 (Discussion)');
      await act(async () => { fireEvent.click(discussionTab); });
      expect(screen.getByText('Discussion Dates (1)')).toBeInTheDocument();
    });

    it('should set discussionDates to empty if discussion fetch not ok', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'fail' }) }); // discussion
      await renderAndWaitForLoad("1131");
      expect(screen.getByText('No session dates set for this semester.')).toBeInTheDocument();
    });
  });

  describe('Loading Indicator', () => {
    it('should show loading indicator while fetching', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      const { container } = render(<SessionManagement semester="1131" />);
      expect(container.textContent).toContain('Loading...');
    });
  });

  describe('Attendance Status', () => {
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
  });

  describe('Editing Dates', () => {
    it('should show error if network fails when updating date', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // lecture
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion
      fetch.mockRejectedValueOnce(new Error('Update network error')); // PUT

      await renderAndWaitForLoad("1131");
      const editButton = screen.getByText('Edit Date');
      await act(async () => { fireEvent.click(editButton); });
      const dateInput = screen.getByDisplayValue('2024-10-15');
      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-16' } }); });
      await act(async () => { fireEvent.click(screen.getByText('Save')); });
      await waitFor(() => {
        expect(screen.getByText('Error updating date: Update network error')).toBeInTheDocument();
      });
    });
    
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
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // discussion
      fetch.mockResolvedValueOnce({ ok: true, json: async () => updatedDate }); // PUT

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

  describe('Delete Button', () => {
    it('should show Delete button for each date', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await renderAndWaitForLoad("1131");
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Error Handling for Updates and Deletes', () => {
    it('should show error if updating date fails', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Update failed' }) });
      await renderAndWaitForLoad("1131");
      const editButton = screen.getByText('Edit Date');
      await act(async () => { fireEvent.click(editButton); });
      const dateInput = screen.getByDisplayValue('2024-10-15');
      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-16' } }); });
      await act(async () => { fireEvent.click(screen.getByText('Save')); });
      await waitFor(() => {
        expect(screen.getByText(/Error: Update failed/)).toBeInTheDocument();
      });
    });

    it('deletes a lecture date and shows success message', async () => {
      const initialDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: true }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // lecture
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion
      fetch.mockResolvedValueOnce({ ok: true }); // DELETE

      await renderAndWaitForLoad("1141");
      window.confirm = vi.fn(() => true); // Simulate confirm

      // Wait for initial data to load
      await waitFor(() => screen.getByText(/Lecture Dates/i));

      // Click delete button for lecture date
      fireEvent.click(screen.getByText('Delete'));

      // Wait for success message
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
      window.confirm = vi.fn(() => true); // Simulate confirm

      // Switch to discussion tab
      fireEvent.click(screen.getByText('討論課 (Discussion)'));

      // Wait for initial data to load
      await waitFor(() => screen.getByText(/Discussion Dates/i));

      // Click delete button for discussion date
      fireEvent.click(screen.getByText('Delete'));

      // Wait for success message
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
      window.confirm = vi.fn(() => true); // Simulate confirm
      const deleteButton = screen.getByText('Delete');
      await act(async () => { fireEvent.click(deleteButton); });
      await waitFor(() => {
        expect(screen.getByText(/Error: Delete failed/)).toBeInTheDocument();
      });
    });

    describe('Delete Error Handling', () => {
      it('shows error message if network fails when deleting date', async () => {
        const initialDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: true }];
        fetch.mockClear();
        fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // lecture
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // discussion
        fetch.mockRejectedValueOnce(new Error('Network delete error')); // DELETE

        await renderAndWaitForLoad("1141");
        window.confirm = vi.fn(() => true); // Simulate confirm

        // Wait for initial data to load
        await waitFor(() => screen.getByText(/Lecture Dates/i));

        // Click delete button for lecture date
        fireEvent.click(screen.getByText('Delete'));

        // Wait for error message
        await waitFor(() => {
          expect(screen.getByText('Error deleting date: Network delete error')).toBeInTheDocument();
        });
      });
    });

    it('should show validation error for invalid date on set', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await renderAndWaitForLoad("1131");
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => { fireEvent.click(addButton); });
      const dateInput = screen.getByDisplayValue('');
      await act(async () => { fireEvent.change(dateInput, { target: { value: '1900-01-01' } }); });
      await waitFor(() => {
        expect(screen.getByText(/Date must be between/)).toBeInTheDocument();
      });
    });

    it('should show error if POST fails on set dates', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'POST failed' }) });
      await renderAndWaitForLoad("1131");
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => { fireEvent.click(addButton); });
      const dateInput = screen.getByDisplayValue('');
      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-15' } }); });
      await waitFor(() => {
        expect(screen.getByText('Error: POST failed')).toBeInTheDocument();
      });
    });

    it('should show error if network fails on set dates', async () => {
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockRejectedValueOnce(new Error('Network error')); // POST
      await renderAndWaitForLoad("1131");
      const addButton = screen.getByText('➕ Add Date Field');
      await act(async () => { fireEvent.click(addButton); });
      const dateInput = screen.getByDisplayValue('');
      await act(async () => { fireEvent.change(dateInput, { target: { value: '2024-10-15' } }); });
      await waitFor(() => {
        expect(screen.getByText('Error setting dates: Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling for Toggle Attendance', () => {
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

    it('should show error if network fails on toggle attendance', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockRejectedValueOnce(new Error('Toggle network error'));
      await renderAndWaitForLoad("1131");
      const toggleButton = screen.getByTitle('Click to enable attendance submission');
      await act(async () => { fireEvent.click(toggleButton); });
    });
  });

    it('updates discussionDates when toggling attendance for a discussion date', async () => {
    const initialDates = [{ semester: '1141', actual_date: '2025-01-01', is_active: false }];
    const toggledDate = { semester: '1141', actual_date: '2025-01-01', is_active: true };
    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }); // lecture
    fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates }); // discussion
    fetch.mockResolvedValueOnce({ ok: true, json: async () => toggledDate }); // PATCH

    await renderAndWaitForLoad("1141");
    window.confirm = vi.fn(() => true);

    // Switch to discussion tab
    fireEvent.click(screen.getByText('討論課 (Discussion)'));

    // Wait for initial data to load
    await waitFor(() => screen.getByText(/Discussion Dates/i));
    expect(screen.getByText('🔴 關閉中 Closed')).toBeInTheDocument();

    // Click toggle button for discussion date
    fireEvent.click(screen.getByTitle('Click to enable attendance submission'));

    // Wait for updated attendance status and message
    await waitFor(() => {
      expect(screen.getByText('🟢 開放中 Open')).toBeInTheDocument();
      expect(screen.getByText('Attendance submission enabled for Session 2025-01-01')).toBeInTheDocument();
    });
  });

  describe('Validation Error Handling', () => {
    it('should show validation error when updating date to invalid value', async () => {
      const initialDates = [{ semester: '1131', actual_date: '2024-10-15', is_active: false }];
      fetch.mockClear();
      fetch.mockResolvedValueOnce({ ok: true, json: async () => initialDates });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await renderAndWaitForLoad("1131");
      const editButton = screen.getByText('Edit Date');
      await act(async () => { fireEvent.click(editButton); });
      const dateInput = screen.getByDisplayValue('2024-10-15');
      await act(async () => { fireEvent.change(dateInput, { target: { value: '1900-01-01' } }); });
      await act(async () => { fireEvent.click(screen.getByText('Save')); });
      await waitFor(() => {
        expect(screen.getByText(/Date must be between/)).toBeInTheDocument();
      });
    });
  });

  it('should show error if no dates are provided when setting dates', async () => {
    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await renderAndWaitForLoad("1131");
    const addButton = screen.getByText('➕ Add Date Field');
    await act(async () => { fireEvent.click(addButton); });
    const dateInput = screen.getByDisplayValue('');
    await act(async () => { fireEvent.change(dateInput, { target: { value: '' } }); });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Please enter a valid date');
    });
  });
});