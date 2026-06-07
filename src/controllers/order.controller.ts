import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { AppError } from '../utils/AppError';

function userId(req: Request): number {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user.sub;
}

export const orderController = {
  async create(req: Request, res: Response): Promise<void> {
    const order = await orderService.checkout(userId(req));
    res.status(201).json({ success: true, data: { order } });
  },

  async history(req: Request, res: Response): Promise<void> {
    const orders = await orderService.history(userId(req));
    res.status(200).json({ success: true, data: { orders } });
  },
};
