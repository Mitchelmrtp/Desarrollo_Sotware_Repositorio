import { Router } from 'express';
import {
    getResources,
    getFeaturedResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    toggleResourceLike,
    getUserResources
} from '../controllers/resourceController.js';
import authMiddleware, { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, getResources);
router.get('/featured', getFeaturedResources);
router.get('/:id', optionalAuth, getResourceById);

// Protected routes
router.post('/', authMiddleware, createResource);
router.put('/:id', authMiddleware, updateResource);
router.delete('/:id', authMiddleware, deleteResource);
router.post('/:id/like', authMiddleware, toggleResourceLike);
router.get('/my/resources', authMiddleware, getUserResources);

export default router;