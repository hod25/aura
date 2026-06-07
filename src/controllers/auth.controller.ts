import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import {
  requireString,
  requireEmail,
  requirePassword,
} from '../middleware/validate';

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    const body = req.body as Record<string, unknown>;
    const name = requireString(body.name, 'name', { min: 2, max: 120 });
    const email = requireEmail(body.email);
    const password = requirePassword(body.password);

    const result = await authService.signup({ name, email, password });
    res.status(201).json({ success: true, data: result });
  },

  async login(req: Request, res: Response): Promise<void> {
    const body = req.body as Record<string, unknown>;
    const email = requireEmail(body.email);
    const password = requireString(body.password, 'password', { max: 128 });

    const result = await authService.login({ email, password });
    res.status(200).json({ success: true, data: result });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const user = await authService.getProfile(req.user.sub);
    res.status(200).json({ success: true, data: { user } });
  },
};
