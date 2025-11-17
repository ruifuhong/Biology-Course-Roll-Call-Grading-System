import AttendanceModel from '../models/AttendanceModel.js';
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
      const { semester, studentId, sessionOrder, status = 'present' } = req.body;

      if (!semester || !studentId || !sessionOrder) {
        return res.status(400).json({ 
          error: 'Semester, student ID, and session order are required' 
        });
      }

      const student = await StudentModel.findStudentById(semester, studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      if (sessionOrder < 1 || sessionOrder > 18) {
        return res.status(400).json({ 
          error: 'Session order must be between 1 and 18' 
        });
      }

      const attendance = await AttendanceModel.markDiscussionAttendance(
        semester, 
        studentId, 
        sessionOrder, 
        status
      );

      res.status(200).json({
        message: 'Discussion attendance recorded successfully',
        attendance,
        student: {
          student_id: student.student_id,
          name: student.name
        }
      });

  } catch (error) {
    console.error('Error submitting discussion attendance:', error);
    res.status(500).json({ error: 'Failed to submit discussion attendance' });
  }
};

export const getStudentLectureAttendance = async (req, res) => {
    try {
      const { semester, studentId } = req.params;

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

      const attendance = await AttendanceModel.getAllDiscussionAttendance(semester);
      
      res.status(200).json(attendance);

  } catch (error) {
    console.error('Error getting all discussion attendance:', error);
    res.status(500).json({ error: 'Failed to get all discussion attendance' });
  }
};