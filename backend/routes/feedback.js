import express from 'express';
import * as FeedbackController from '../controllers/FeedbackController.js';

const router = express.Router();

router.get('/', FeedbackController.getAllLectureFeedback);
router.post('/', FeedbackController.createLectureFeedback);

router.get('/discussion', FeedbackController.getAllDiscussionFeedback);
router.post('/discussion', FeedbackController.createDiscussionFeedback);

export default router;
