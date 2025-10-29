import { Router } from 'express';
import {
    getDashboardStats,
    getUsers,
    updateUser,
    getResourcesForModeration,
    moderateResource,
    getReports,
    requireAdmin
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth middleware and admin check to all routes
router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard', getDashboardStats); // Alias for frontend compatibility

// User management routes
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);

// Resource moderation routes
router.get('/resources/moderation', getResourcesForModeration);
router.patch('/resources/:id/moderate', moderateResource);
router.post('/moderate/:id', moderateResource); // Alias for frontend compatibility

// Reports route
router.get('/reports', getReports);

export default router;