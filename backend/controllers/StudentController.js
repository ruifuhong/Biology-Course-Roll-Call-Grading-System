import * as StudentModel from '../models/StudentModel.js';

export async function createStudent(req, res) {
  try {
    const { student_id, semester, department, group_name, name } = req.body;
    
    if (!student_id || !semester || !department || !name) {
      return res.status(400).json({ 
        error: 'student_id, semester, department, and name are required' 
      });
    }
    
    const newStudent = await StudentModel.createStudent({
      student_id, semester, department, group_name, name
    });
    
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('StudentController createStudent error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getStudentsBySemester(req, res) {
  try {
    const { semester } = req.params;

    if (!semester) {
      return res.status(400).json({ error: 'semester parameter is required' });
    }
    
    const students = await StudentModel.findStudentsBySemester(semester);
    res.json(students);
  } catch (error) {
    console.error('StudentController getStudents error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getStudentById(req, res) {
  try {
    const { semester, studentId } = req.params;
    
    const student = await StudentModel.findStudentById(semester, studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('StudentController getStudentById error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateStudent(req, res) {
  try {
    const { semester, studentId } = req.params;
    const { student_id, department, group_name, name } = req.body;
    
    const updatedStudent = await StudentModel.updateStudent(semester, studentId, {
      student_id, department, group_name, name
    });
    
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    console.error('StudentController updateStudent error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteStudent(req, res) {
  try {
    const { semester, studentId } = req.params;
    
    const deletedStudent = await StudentModel.deleteStudent(semester, studentId);
    
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully', student: deletedStudent });
  } catch (error) {
    console.error('StudentController deleteStudent error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function uploadStudentsCSV(req, res) {
  try {
    const { csvData, semester } = req.body;
    
    if (!csvData || !semester) {
      return res.status(400).json({ 
        error: 'csvData and semester are required' 
      });
    }
    
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const requiredHeaders = ['student_id', 'name', 'department', 'group_name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return res.status(400).json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}` 
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
            error: 'Column count mismatch', 
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
            error: 'Missing required fields (student_id, name, department, group_name)', 
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
        error: 'No valid student rows found',
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
      message: 'CSV upload processed',
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
    console.error('StudentController uploadStudentsCSV error:', error);
    res.status(500).json({ error: error.message });
  }
}

