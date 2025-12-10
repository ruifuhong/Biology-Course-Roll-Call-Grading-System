import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StudentList from '../../components/StudentList.jsx';

global.fetch = vi.fn();

const mockStudents = [
  { student_id: 'B100000001', name: 'John Doe', department: 'CS', group_name: '1' },
  { student_id: 'B100000002', name: 'Jane Smith', department: 'EE', group_name: '10' },
  { student_id: 'B100000003', name: 'Bob Johnson', department: 'ME', group_name: '2' }
];

describe('StudentList', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.confirm = vi.fn();
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Data Fetching and Display', () => {
    it('fetches and displays students on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/students/1131')
      );
    });

    it('displays loading state while fetching students', () => {
      fetch.mockImplementation(() => new Promise(() => {}));
    
      render(<StudentList semester="1131" />);
    
      expect(screen.getByText('Loading students... / 載入學生中...')).toBeInTheDocument();
    });

    it('displays empty state when no students found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
    
      render(<StudentList semester="1131" />);
    
      await waitFor(() => {
        expect(screen.getByText('No students found for this semester. / 本學期未找到學生。')).toBeInTheDocument();
      });
    });

    it('displays error message on fetch failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });
    
      render(<StudentList semester="1131" />);
    
      await waitFor(() => {
        expect(screen.getByText('Failed to load students / 載入學生失敗')).toBeInTheDocument();
      });
    });

    it('displays students sorted by natural sort', async () => {
      const unsortedStudents = [
        { student_id: 'B100000002', name: 'Jane Smith', department: 'EE', group_name: '10' },
        { student_id: 'B100000003', name: 'Bob Johnson', department: 'ME', group_name: '2' },
        { student_id: 'B100000001', name: 'John Doe', department: 'CS', group_name: '1' }
      ];
    
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => unsortedStudents
      });
    
      render(<StudentList semester="1131" />);
    
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const dataRows = rows.slice(1);
        
        expect(dataRows[0]).toHaveTextContent('John Doe'); // group 1
        expect(dataRows[1]).toHaveTextContent('Bob Johnson'); // group 2
        expect(dataRows[2]).toHaveTextContent('Jane Smith'); // group 10
      });
    });

    it('displays student count correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });
    
      render(<StudentList semester="1131" />);
    
      await waitFor(() => {
        expect(screen.getByText('Current Students (3) / 目前學生 (3)')).toBeInTheDocument();
      });
    });
  });

  describe('Semester Formatting', () => {
    it('formats semester correctly in headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        expect(screen.getByText('113-1 CSV Upload / CSV上傳')).toBeInTheDocument();
      });
    });
  });

  describe('Add Student Form', () => {
    it('shows add form when Add Student button is clicked', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Student / 新增學生'));
        expect(screen.getByText('113-1 Add New Student / 新增學生')).toBeInTheDocument();
        expect(screen.getByLabelText('Student ID / 學號 *')).toBeInTheDocument();
      });
    });

    it('hides add form when Cancel is clicked', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Student / 新增學生'));
        expect(screen.getByText('113-1 Add New Student / 新增學生')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByText('Cancel / 取消');
      
      await waitFor(() => {
        fireEvent.click(cancelButtons[0]);
        expect(screen.queryByText('113-1 Add New Student / 新增學生')).not.toBeInTheDocument();
      });
    });

    it('changes button text when form is shown', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      expect(screen.getByRole('button', { name: 'Add Student / 新增學生' })).toBeInTheDocument();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Add Student / 新增學生' }));

        const addButtons = screen.getAllByRole('button', { name: 'Add Student / 新增學生' });

        expect(addButtons).toHaveLength(1);
        expect(addButtons[0].type).toBe('submit');
      });
    });
  });

  describe('StudentForm Component', () => {
    it('submits form with valid data', async () => {
      const newStudent = { student_id: 'B100000004', name: 'New Student', department: 'Physics', group_name: '3' };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => newStudent
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Student / 新增學生'));
      });

      fireEvent.change(screen.getByLabelText('Student ID / 學號 *'), { target: { value: 'B100000004' } });
      fireEvent.change(screen.getByLabelText('Name / 姓名 *'), { target: { value: 'New Student' } });
      fireEvent.change(screen.getByLabelText('Department / 系別 *'), { target: { value: 'Physics' } });
      fireEvent.change(screen.getByLabelText('Group Name / 組別 *'), { target: { value: '3' } });

      const submitButton = screen.getByText('Add Student / 新增學生');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/students'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: 'B100000004',
              name: 'New Student',
              department: 'Physics',
              group_name: '3',
              semester: '1131'
            })
          })
        );
      });
    });

    it('shows success message after adding student', async () => {
      const newStudent = { student_id: 'B100000004', name: 'New Student', department: 'Physics', group_name: '3' };
      
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => newStudent
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Student / 新增學生'));
      });

      fireEvent.change(screen.getByLabelText('Student ID / 學號 *'), { target: { value: 'B100000004' } });
      fireEvent.change(screen.getByLabelText('Name / 姓名 *'), { target: { value: 'New Student' } });
      fireEvent.change(screen.getByLabelText('Department / 系別 *'), { target: { value: 'Physics' } });
      fireEvent.change(screen.getByLabelText('Group Name / 組別 *'), { target: { value: '3' } });

      const submitButton = screen.getByText('Add Student / 新增學生');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Student added successfully / 學生新增成功')).toBeInTheDocument();
      });
    });

    it('shows error message when add fails', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Student already exists' })
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Add Student / 新增學生'));
      });

      fireEvent.change(screen.getByLabelText('Student ID / 學號 *'), { target: { value: 'B100000004' } });
      fireEvent.change(screen.getByLabelText('Name / 姓名 *'), { target: { value: 'New Student' } });
      fireEvent.change(screen.getByLabelText('Department / 系別 *'), { target: { value: 'Physics' } });
      fireEvent.change(screen.getByLabelText('Group Name / 組別 *'), { target: { value: '3' } });

      const submitButton = screen.getByText('Add Student / 新增學生');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error: Student already exists / 錯誤: Student already exists')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Student', () => {
    it('enters edit mode when Edit button is clicked', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit / 編輯');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('B100000001')).toBeInTheDocument();
      expect(screen.getByText('Save / 儲存')).toBeInTheDocument();
    });

    it('shows Cancel Edit button when editing', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit / 編輯');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByText('Cancel Edit / 取消編輯')).toBeInTheDocument();
    });

    it('cancels edit mode when Cancel button is clicked', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit / 編輯');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel Edit / 取消編輯'));

      expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('disables other Edit/Delete buttons when editing', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit / 編輯');
        fireEvent.click(editButtons[0]);
      });

      const remainingEditButtons = screen.getAllByText('Edit / 編輯');
      const deleteButtons = screen.getAllByText('Delete / 刪除');
      
      remainingEditButtons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
      
      deleteButtons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });

    it('validates edit form before submission', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit / 編輯');
        fireEvent.click(editButtons[0]);
      });

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: '' } });

      fireEvent.click(screen.getByText('Save / 儲存'));

      expect(window.alert).toHaveBeenCalledWith(
        'Student ID, Name, Department, and Group Name are required / 學號、姓名、系別和組別為必填欄位'
      );
    });

    it('saves student changes successfully', async () => {
      const updatedStudent = { ...mockStudents[0], name: 'Updated Name' };
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => updatedStudent
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit / 編輯');
        fireEvent.click(editButtons[0]);
      });

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      fireEvent.click(screen.getByText('Save / 儲存'));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/students/1131/B100000001'),
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: 'B100000001',
              name: 'Updated Name',
              department: 'CS',
              group_name: '1'
            })
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Student updated successfully / 學生更新成功')).toBeInTheDocument();
      });
    });

    it('shows error message when edit fails', async () => {
      fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Edit failed' })
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
      const editButtons = screen.getAllByText('Edit / 編輯');
      fireEvent.click(editButtons[0]);
      });

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      fireEvent.click(screen.getByText('Save / 儲存'));

      await waitFor(() => {
      expect(screen.getByText('Error: Edit failed / 錯誤: Edit failed')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Student', () => {
    it('shows confirmation dialog when Delete button is clicked', async () => {

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete / 刪除');
        fireEvent.click(deleteButtons[0]);
      });

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this student? / 確定要刪除此學生嗎？'
      );
    });

    it('deletes student when confirmed', async () => {
      window.confirm.mockReturnValue(true);

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete / 刪除');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/students/1131/B100000001'),
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Student deleted successfully / 學生刪除成功')).toBeInTheDocument();
      });
    });

    it('shows error message when delete fails', async () => {
      window.confirm.mockReturnValue(true);

      fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Delete failed' })
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete / 刪除');
      fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
      expect(screen.getByText('Error: Delete failed / 錯誤: Delete failed')).toBeInTheDocument();
      });
    });

    it('does not delete when user cancels confirmation', async () => {
      window.confirm.mockReturnValue(false);

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete / 刪除');
        fireEvent.click(deleteButtons[0]);
      });

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSV Upload', () => {
    it('shows CSV upload section with proper formatting', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        expect(screen.getByText('113-1 CSV Upload / CSV上傳')).toBeInTheDocument();
        expect(screen.getByText('Format: student_id,name,department,group_name / 格式: 學號,姓名,系別,組別')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Paste CSV data here... / 在此貼上CSV資料...')).toBeInTheDocument();
      });
    });

    it('uploads CSV data successfully', async () => {
      const uploadResult = { 
        summary: { created: 2, parseErrors: 0, dbErrors: 0 } 
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => uploadResult
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [...mockStudents, { student_id: 'B100000004', name: 'Test User', department: 'CS', group_name: '3' }]
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const csvData = 'student_id,name,department,group_name\nB100000004,Test User,CS,3';
        fireEvent.change(screen.getByPlaceholderText('Paste CSV data here... / 在此貼上CSV資料...'), { target: { value: csvData } });
        fireEvent.click(screen.getByText('Upload CSV Data / 上傳CSV資料'));
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/students/upload-csv'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              csvData: 'student_id,name,department,group_name\nB100000004,Test User,CS,3',
              semester: '1131'
            })
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('CSV upload completed: 2 successful, 0 failed / CSV上傳完成: 2 成功, 0 失敗')).toBeInTheDocument();
      });
    });

    it('shows CSV upload errors', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Invalid CSV format' })
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const csvData = 'invalid,csv,format';
        fireEvent.change(screen.getByPlaceholderText('Paste CSV data here... / 在此貼上CSV資料...'), { target: { value: csvData } });
        fireEvent.click(screen.getByText('Upload CSV Data / 上傳CSV資料'));
      });

      await waitFor(() => {
        expect(screen.getByText('Error: Invalid CSV format / 錯誤: Invalid CSV format')).toBeInTheDocument();
      });
    });

    it('disables upload button when no CSV data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents
      });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        const uploadButton = screen.getByText('Upload CSV Data / 上傳CSV資料');
        expect(uploadButton).toBeDisabled();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('refreshes data when Refresh button is clicked', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStudents
        });

      render(<StudentList semester="1131" />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Refresh / 重新整理'));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});