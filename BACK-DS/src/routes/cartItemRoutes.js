import express from 'express';
import CartItemController from '../controllers/cartItemController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for cart items
router.post('/', authMiddleware, CartItemController.addItem);
router.put('/:id', authMiddleware, CartItemController.updateItem);
router.delete('/:id', authMiddleware, CartItemController.removeItem);

export default router;