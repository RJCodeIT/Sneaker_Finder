import express from 'express';
import { createCheckoutSession } from '../controllers/checkoutController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected checkout route
router.post('/create-checkout-session', protect, createCheckoutSession);

export default router;
