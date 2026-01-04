import * as AttendanceModel from '../models/AttendanceModel.js';
import * as StudentModel from '../models/StudentModel.js';

export const submitLectureAttendance = async (req, res) => {
  try {
    const { semester, studentId, actual_date, status = 'present' } = req.body;
    console.log('Lecture attendance request:', { semester, studentId, actual_date, status });
    if (!semester || !studentId || !actual_date) {
      return res.status(400).json({ 
        error: 'Semester, student ID, and actual_date are required' 
      });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: 'Access denied for this semester' });
      }
    }
    const student = await StudentModel.findStudentById(semester, studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('Student found:', student);
    console.log('About to mark attendance...');
    const attendance = await AttendanceModel.markLectureAttendance(
      semester,
      studentId,
      actual_date,
      status
    );
    console.log('Attendance marked successfully:', attendance);
    res.status(200).json({
      message: 'Lecture attendance recorded successfully',
      attendance,
      student: {
        student_id: student.student_id,
        name: student.name
      }
    });
  } catch (error) {
    console.error('Error submitting lecture attendance:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to submit lecture attendance', details: error.message });
  }
};

export const submitDiscussionAttendance = async (req, res) => {
  try {
    const { semester, studentId, actual_date, status = 'present' } = req.body;

     console.log('Discussion attendance request:', { semester, studentId, actual_date, status });
    
    if (!semester || !studentId || !actual_date) {
      return res.status(400).json({ 
        error: 'Semester, student ID, and actual_date are required' 
      });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: 'Access denied for this semester' });
      }
    }
    const student = await StudentModel.findStudentById(semester, studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('Student found:', student);
    console.log('About to mark attendance...');
    const attendance = await AttendanceModel.markDiscussionAttendance(
      semester,
      studentId,
      actual_date,
      status
    );
    console.log('Attendance marked successfully:', attendance);
    res.status(200).json({
      message: 'Lecture attendance recorded successfully',
      attendance,
      student: {
        student_id: student.student_id,
        name: student.name
      }
    });
  } catch (error) {
    console.error('Error submitting lecture attendance:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to submit lecture attendance', details: error.message });
  }
};

export const getStudentLectureAttendance = async (req, res) => {
    try {
      const { semester, studentId } = req.params;
      
      if (req.user && req.user.role === 'ta') {
        if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
          return res.status(403).json({ error: 'Access denied for this semester' });
        }
      }
      const attendance = await AttendanceModel.getLectureAttendance(semester, studentId);
      res.status(200).json(attendance || {});
  } catch (error) {
    console.error('Error getting student lecture attendance:', error);
    res.status(500).json({ error: 'Failed to get student lecture attendance' });
  }
};

export const getStudentDiscussionAttendance = async (req, res) => {
    try {
      const { semester, studentId } = req.params;
      
      if (req.user && req.user.role === 'ta') {
        if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
          return res.status(403).json({ error: 'Access denied for this semester' });
        }
      }
      const attendance = await AttendanceModel.getDiscussionAttendance(semester, studentId);
      res.status(200).json(attendance || {});
  } catch (error) {
    console.error('Error getting student discussion attendance:', error);
    res.status(500).json({ error: 'Failed to get student discussion attendance' });
  }
};

export const getAllLectureAttendance = async (req, res) => {
    try {
      const { semester } = req.params;
      
      if (req.user && req.user.role === 'ta') {
        if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
          return res.status(403).json({ error: 'Access denied for this semester' });
        }
      }
      const attendance = await AttendanceModel.getAllLectureAttendance(semester);
      res.status(200).json(attendance);
  } catch (error) {
    console.error('Error getting all lecture attendance:', error);
    res.status(500).json({ error: 'Failed to get all lecture attendance' });
  }
};

export const getAllDiscussionAttendance = async (req, res) => {
    try {
      const { semester } = req.params;
      
      if (req.user && req.user.role === 'ta') {
        if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
          return res.status(403).json({ error: 'Access denied for this semester' });
        }
      }
      const attendance = await AttendanceModel.getAllDiscussionAttendance(semester);
      res.status(200).json(attendance);
  } catch (error) {
    console.error('Error getting all discussion attendance:', error);
    res.status(500).json({ error: 'Failed to get all discussion attendance' });
  }
};