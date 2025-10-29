import { Router } from 'express';
import { 
    register, 
    login, 
    getProfile, 
    logout, 
    refreshToken, 
    forgotPassword, 
    resetPassword 
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Logout route - public (no authentication required)
router.post('/logout', logout);

// Protected routes
router.use(authMiddleware);
router.get('/profile', getProfile);

export default router;