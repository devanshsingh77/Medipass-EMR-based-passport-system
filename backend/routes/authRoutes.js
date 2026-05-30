import express from 'express';
import { registerUser, loginUser, verifyOTP, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.put('/profile', protect, updateUserProfile);

export default router;
