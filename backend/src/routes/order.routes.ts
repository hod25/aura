import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../validators/validateRequest';
import { checkoutSchema } from '../validators/order.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All order routes require an authenticated user.
router.use(authenticate);

router.post(
  '/',
  validateBody(checkoutSchema),
  asyncHandler(orderController.create),
);
router.get('/history', asyncHandler(orderController.history));

export default router;
