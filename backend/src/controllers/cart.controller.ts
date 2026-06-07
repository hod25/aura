import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { requirePositiveInt } from '../middleware/validate';
import { AppError } from '../utils/AppError';

function userId(req: Request): number {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user.sub;
}

export const cartController = {
  async get(req: Request, res: Response): Promise<void> {
    const cart = await cartService.getCart(userId(req));
    res.status(200).json({ success: true, data: cart });
  },

  async addItem(req: Request, res: Response): Promise<void> {
    const body = req.body as Record<string, unknown>;
    const productId = requirePositiveInt(body.product_id, 'product_id');
    const quantity = requirePositiveInt(body.quantity ?? 1, 'quantity');

    const cart = await cartService.addItem(userId(req), productId, quantity);
    res.status(201).json({ success: true, data: cart });
  },

  async updateItem(req: Request, res: Response): Promise<void> {
    const itemId = requirePositiveInt(req.params.id, 'cart item id');
    const body = req.body as Record<string, unknown>;
    const quantity = requirePositiveInt(body.quantity, 'quantity');

    const cart = await cartService.updateItem(userId(req), itemId, quantity);
    res.status(200).json({ success: true, data: cart });
  },

  async removeItem(req: Request, res: Response): Promise<void> {
    const itemId = requirePositiveInt(req.params.id, 'cart item id');
    const cart = await cartService.removeItem(userId(req), itemId);
    res.status(200).json({ success: true, data: cart });
  },
};
