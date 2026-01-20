import express from 'express';
import * as ReviewController from '../controllers/ReviewController.js';

const router = express.Router();

router.get('/denominator/:semester', ReviewController.getDenominators);
router.put('/denominator', ReviewController.putDenominator);

router.get('/:semester/:studentId', ReviewController.getReviewInfo);

router.post('/intra', ReviewController.submitIntraReviews);
router.post('/inter', ReviewController.submitInterReviews);

router.get('/intra/summary/:semester', ReviewController.getIntraReviewSummary);
router.get('/inter/summary/:semester', ReviewController.getInterReviewSummary);

export default router;
