import * as AttendanceModel from '../models/AttendanceModel.js';
import * as StudentModel from '../models/StudentModel.js';

export const submitLectureAttendance = async (req, res) => {
  try {
    const { semester, studentId, actual_date, status = 'present' } = req.body;
    console.log('正課點名請求 Lecture attendance request:', { semester, studentId, actual_date, status });
    if (!semester || !studentId || !actual_date) {
      return res.status(400).json({ 
        error: '缺少學期、學號或日期 Semester, student ID, and actual_date are required' 
      });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const student = await StudentModel.findStudentById(semester, studentId);
    if (!student) {
      return res.status(404).json({ error: '查無此學生 Student not found' });
    }
    console.log('找到學生 Student found:', student);
    console.log('即將標記出席 About to mark attendance...');
    const attendance = await AttendanceModel.markLectureAttendance(
      semester,
      studentId,
      actual_date,
      status
    );
    console.log('出席標記成功 Attendance marked successfully:', attendance);
    res.status(200).json({
      message: '正課出席紀錄成功 Lecture attendance recorded successfully',
      attendance,
      student: {
        student_id: student.student_id,
        name: student.name
      }
    });
  } catch (error) {
    console.error('提交正課出席失敗 Error submitting lecture attendance:', error);
    console.error('錯誤堆疊 Error stack:', error.stack);
    res.status(500).json({ error: '提交正課出席失敗 Failed to submit lecture attendance', details: error.message });
  }
};

export const submitDiscussionAttendance = async (req, res) => {
  try {
    const { semester, studentId, actual_date, status = 'present' } = req.body;

    console.log('討論課點名請求 Discussion attendance request:', { semester, studentId, actual_date, status });
    
    if (!semester || !studentId || !actual_date) {
      return res.status(400).json({ 
        error: '缺少學期、學號或日期 Semester, student ID, and actual_date are required' 
      });
    }
    
    if (req.user && req.user.role === 'ta') {
      if (!req.user.assignedSemesters || !req.user.assignedSemesters.includes(semester)) {
        return res.status(403).json({ error: '無權限存取此學期 Access denied for this semester' });
      }
    }
    const student = await StudentModel.findStudentById(semester, studentId);
    if (!student) {
      return res.status(404).json({ error: '查無此學生 Student not found' });
    }
    console.log('找到學生 Student found:', student);
    console.log('即將標記出席 About to mark attendance...');
    const attendance = await AttendanceModel.markDiscussionAttendance(
      semester,
      studentId,
      actual_date,
      status
    );
    console.log('出席標記成功 Attendance marked successfully:', attendance);
    res.status(200).json({
      message: '討論課出席紀錄成功 Discussion attendance recorded successfully',
      attendance,
      student: {
        student_id: student.student_id,
        name: student.name
      }
    });
  } catch (error) {
    console.error('提交討論課出席失敗 Error submitting discussion attendance:', error);
    console.error('錯誤堆疊 Error stack:', error.stack);
    res.status(500).json({ error: '提交討論課出席失敗 Failed to submit discussion attendance', details: error.message });
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
    console.error('取得正課出席失敗 Error getting student lecture attendance:', error);
    res.status(500).json({ error: '取得正課出席失敗 Failed to get student lecture attendance' });
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
    console.error('取得討論課出席失敗 Error getting student discussion attendance:', error);
    res.status(500).json({ error: '取得討論課出席失敗 Failed to get student discussion attendance' });
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
    console.error('取得所有正課出席失敗 Error getting all lecture attendance:', error);
    res.status(500).json({ error: '取得所有正課出席失敗 Failed to get all lecture attendance' });
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
    console.error('取得所有討論課出席失敗 Error getting all discussion attendance:', error);
    res.status(500).json({ error: '取得所有討論課出席失敗 Failed to get all discussion attendance' });
  }
};