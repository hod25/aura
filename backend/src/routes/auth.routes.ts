import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../validators/validateRequest';
import { signupSchema, loginSchema } from '../validators/auth.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/signup',
  authRateLimiter,
  validateBody(signupSchema),
  asyncHandler(authController.signup),
);
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.login),
);
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
