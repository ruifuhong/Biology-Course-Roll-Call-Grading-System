import * as StudentModel from '../models/StudentModel.js';

export async function createStudent(req, res) {
  try {
    const { student_id, semester, department, group_name, name } = req.body;
    if (!student_id || !semester || !department || !name) {
      return res.status(400).json({ 
        error: '缺少必要欄位：學號、學期、系級、姓名 student_id, semester, department, and name are required' 
      });
    }
    // Access control: Only allow TA to create students for assigned semesters
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const newStudent = await StudentModel.createStudent({
      student_id, semester, department, group_name, name
    });
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('新增學生失敗 StudentController createStudent error:', error);
    res.status(500).json({ error: '新增學生失敗 Failed to create student: ' + error.message });
  }
}

export async function getStudentsBySemester(req, res) {
  try {
    const { semester } = req.params;
    if (!semester) {
      return res.status(400).json({ error: '缺少學期參數 semester parameter is required' });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const students = await StudentModel.findStudentsBySemester(semester);
    res.json(students);
  } catch (error) {
    console.error('取得學生清單失敗 StudentController getStudents error:', error);
    res.status(500).json({ error: '取得學生清單失敗 Failed to get students: ' + error.message });
  }
}

export async function getStudentById(req, res) {
  try {
    const { semester, studentId } = req.params;
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無本學期操作權限 Access denied for this semester' });
      }
    }
    const student = await StudentModel.findStudentById(semester, studentId);
    if (!student) {
      return res.status(404).json({ error: '查無此學生 Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('查詢學生失敗 StudentController getStudentById error:', error);
    res.status(500).json({ error: '查詢學生失敗 Failed to get student: ' + error.message });
  }
}

export async function updateStudent(req, res) {
  try {
    const { semester, studentId } = req.params;
    const { student_id, department, group_name, name } = req.body;
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無本學期操作權限 Access denied for this semester' });
      }
    }
    const updatedStudent = await StudentModel.updateStudent(semester, studentId, {
      student_id, department, group_name, name
    });
    if (!updatedStudent) {
      return res.status(404).json({ error: '查無此學生 Student not found' });
    }
    res.json(updatedStudent);
  } catch (error) {
    console.error('更新學生失敗 StudentController updateStudent error:', error);
    res.status(500).json({ error: '更新學生失敗 Failed to update student: ' + error.message });
  }
}

export async function deleteStudent(req, res) {
  try {
    const { semester, studentId } = req.params;
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無本學期操作權限 Access denied for this semester' });
      }
    }
    const deletedStudent = await StudentModel.deleteStudent(semester, studentId);
    if (!deletedStudent) {
      return res.status(404).json({ error: '查無此學生 Student not found' });
    }
    res.json({ message: '學生刪除成功 Student deleted successfully', student: deletedStudent });
  } catch (error) {
    console.error('刪除學生失敗 StudentController deleteStudent error:', error);
    res.status(500).json({ error: '刪除學生失敗 Failed to delete student: ' + error.message });
  }
}

export async function uploadStudentsCSV(req, res) {
  try {
    const { csvData, semester } = req.body;
    if (!csvData || !semester) {
      return res.status(400).json({ 
        error: '缺少csv資料或學期 csvData and semester are required' 
      });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['student_id', 'name', 'department', 'group_name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return res.status(400).json({ 
        error: `缺少必要欄位 Missing required headers: ${missingHeaders.join(', ')}` 
      });
    }
    const students = [];
    const errors = [];
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
          errors.push({ 
            row: i + 1, 
            error: '欄位數不符 Column count mismatch', 
            data: lines[i] 
          });
          continue;
        }
        const studentData = { semester };
        headers.forEach((header, index) => {
          studentData[header] = values[index];
        });
        if (!studentData.student_id || !studentData.name || !studentData.department || !studentData.group_name) {
          errors.push({ 
            row: i + 1, 
            error: '缺少必要欄位（學號、姓名、系級、組別）Missing required fields (student_id, name, department, group_name)', 
            data: studentData 
          });
          continue;
        }
        students.push(studentData);
      } catch (error) {
        errors.push({ 
          row: i + 1, 
          error: error.message, 
          data: lines[i] 
        });
      }
    }
    const createdStudents = [];
    const dbErrors = [];
    for (let i = 0; i < students.length; i++) {
      try {
        const newStudent = await StudentModel.createStudent(students[i]);
        createdStudents.push(newStudent);
      } catch (error) {
        dbErrors.push({ 
          student: students[i], 
          error: error.message 
        });
      }
    }
    if (createdStudents.length === 0) {
      return res.status(400).json({
        error: '無有效學生資料 No valid student rows found',
        summary: {
          totalRows: lines.length - 1,
          parsed: students.length,
          created: createdStudents.length,
          parseErrors: errors.length,
          dbErrors: dbErrors.length
        },
        created: [],
        errors: {
          parseErrors: errors,
          dbErrors: dbErrors
        }
      });
    }
    res.status(201).json({
      message: 'CSV上傳處理完成 CSV upload processed',
      summary: {
        totalRows: lines.length - 1,
        parsed: students.length,
        created: createdStudents.length,
        parseErrors: errors.length,
        dbErrors: dbErrors.length
      },
      created: createdStudents,
      errors: {
        parseErrors: errors,
        dbErrors: dbErrors
      }
    });
  } catch (error) {
    console.error('CSV上傳失敗 StudentController uploadStudentsCSV error:', error);
    res.status(500).json({ error: 'CSV上傳失敗 Failed to upload CSV: ' + error.message });
  }
}

