import express from 'express';
import {
  submitLectureAttendance,
  submitDiscussionAttendance,
  getStudentLectureAttendance,
  getStudentDiscussionAttendance,
  getAllLectureAttendance,
  getAllDiscussionAttendance
} from '../controllers/AttendanceController.js';

const router = express.Router();

router.post('/lecture', submitLectureAttendance);
router.post('/discussion', submitDiscussionAttendance);

router.get('/lecture/:semester/:studentId', getStudentLectureAttendance);
router.get('/discussion/:semester/:studentId', getStudentDiscussionAttendance);

router.get('/lecture/:semester', getAllLectureAttendance);
router.get('/discussion/:semester', getAllDiscussionAttendance);

export default router;