import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All cart routes require an authenticated user.
router.use(authenticate);

router.get('/', asyncHandler(cartController.get));
router.post('/items', asyncHandler(cartController.addItem));
router.put('/items/:id', asyncHandler(cartController.updateItem));
router.delete('/items/:id', asyncHandler(cartController.removeItem));

export default router;
