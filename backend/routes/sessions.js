import express from 'express';
import * as SessionController from '../controllers/SessionController.js';

const router = express.Router();

// LECTURE OPERATIONS (ACTIVE)
router.post('/lecture-dates', SessionController.setLectureDates);
router.get('/lecture-dates/:semester', SessionController.getLectureDates);
router.put('/lecture-dates/:semester/:oldDate', SessionController.updateLectureDate);
router.delete('/lecture-dates/:semester/:actualDate', SessionController.deleteLectureDate);

// DISCUSSION OPERATIONS (TEMPORARILY DISABLED - UI PRESERVED)
// router.post('/discussion-dates', SessionController.setDiscussionDates);
// router.get('/discussion-dates/:semester', SessionController.getDiscussionDates);
// router.put('/discussion-dates/:semester/:sessionOrder', SessionController.updateDiscussionDate);
// router.delete('/discussion-dates/:semester/:sessionOrder', SessionController.deleteDiscussionDate);

// STILL COMMENTED OUT - TOGGLE OPERATIONS
// router.patch('/lecture-dates/:semester/:sessionOrder/toggle', SessionController.toggleLectureAttendance);
// router.patch('/discussion-dates/:semester/:sessionOrder/toggle', SessionController.toggleDiscussionAttendance);

export default router;