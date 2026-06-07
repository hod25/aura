import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { AppError } from '../utils/AppError';
import { Cart } from '../types';

function buildCart(items: Awaited<ReturnType<typeof cartRepository.findDetailedByUser>>): Cart {
  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    items,
    total: Number(total.toFixed(2)),
    item_count: itemCount,
  };
}

export const cartService = {
  async getCart(userId: number): Promise<Cart> {
    const items = await cartRepository.findDetailedByUser(userId);
    return buildCart(items);
  },

  async addItem(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const existing = await cartRepository.findItemByProduct(userId, productId);
    const desiredQty = (existing?.quantity ?? 0) + quantity;
    if (desiredQty > product.stock) {
      throw AppError.badRequest(
        `Only ${product.stock} unit(s) of "${product.name}" are available`,
      );
    }

    await cartRepository.upsert(userId, productId, quantity);
    return this.getCart(userId);
  },

  async updateItem(
    userId: number,
    itemId: number,
    quantity: number,
  ): Promise<Cart> {
    const item = await cartRepository.findItemById(itemId, userId);
    if (!item) {
      throw AppError.notFound('Cart item not found');
    }

    const product = await productRepository.findById(item.product_id);
    if (!product) {
      throw AppError.notFound('Product no longer exists');
    }
    if (quantity > product.stock) {
      throw AppError.badRequest(
        `Only ${product.stock} unit(s) of "${product.name}" are available`,
      );
    }

    await cartRepository.updateQuantity(itemId, userId, quantity);
    return this.getCart(userId);
  },

  async removeItem(userId: number, itemId: number): Promise<Cart> {
    const removed = await cartRepository.deleteItem(itemId, userId);
    if (!removed) {
      throw AppError.notFound('Cart item not found');
    }
    return this.getCart(userId);
  },
};
