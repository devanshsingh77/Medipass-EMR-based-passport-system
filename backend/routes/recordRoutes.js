import express from 'express';
import { getMyRecords, seedRecords } from '../controllers/recordController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Patient'), getMyRecords);

router.post('/seed', protect, authorize('Patient'), seedRecords);

export default router;
