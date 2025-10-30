import express from 'express';
import * as SubmissionController from '../controllers/SubmissionController.js';

const router = express.Router();

router.get('/', SubmissionController.getAllSubmissions);
router.post('/', SubmissionController.createSubmission);

export default router;