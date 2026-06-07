import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateParams } from '../validators/validateRequest';
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
} from '../validators/cart.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All cart routes require an authenticated user.
router.use(authenticate);

router.get('/', asyncHandler(cartController.get));
router.post(
  '/items',
  validateBody(addCartItemSchema),
  asyncHandler(cartController.addItem),
);
router.put(
  '/items/:id',
  validateParams(cartItemParamsSchema),
  validateBody(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
);
router.delete(
  '/items/:id',
  validateParams(cartItemParamsSchema),
  asyncHandler(cartController.removeItem),
);

export default router;
