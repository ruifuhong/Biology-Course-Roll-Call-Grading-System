import express from 'express';
import * as FeedbackController from '../controllers/FeedbackController.js';

const router = express.Router();

router.get('/lecture/:semester', FeedbackController.getAllLectureFeedback);
router.post('/lecture', FeedbackController.createLectureFeedback);

router.get('/discussion/:semester', FeedbackController.getAllDiscussionFeedback);
router.post('/discussion', FeedbackController.createDiscussionFeedback);

export default router;
