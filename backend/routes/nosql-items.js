import express from 'express';
import * as FeedbackController from '../controllers/FeedbackController.js';

const router = express.Router();

router.get('/', FeedbackController.getAllFeedback);
router.post('/', FeedbackController.createFeedback);

export default router;
