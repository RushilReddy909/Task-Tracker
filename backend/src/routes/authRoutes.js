import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { signupRules, loginRules } from '../middleware/validators.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);

export default router;
