import express from 'express';
import { generateToken, scanToken, revokeAllTokens, getAccessLogs } from '../controllers/consentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, authorize('Patient'), generateToken);
router.post('/scan', protect, authorize('Doctor'), scanToken);
router.post('/revoke', protect, authorize('Patient'), revokeAllTokens);
router.get('/logs', protect, authorize('Patient'), getAccessLogs);

export default router;
