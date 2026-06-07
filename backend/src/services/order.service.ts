import { cartRepository } from '../repositories/cart.repository';
import { orderRepository } from '../repositories/order.repository';
import { AppError } from '../utils/AppError';
import { OrderWithItems } from '../types';

export const orderService = {
  /** Converts the authenticated user's cart into a paid order. */
  async checkout(userId: number): Promise<OrderWithItems> {
    const cartItems = await cartRepository.findDetailedByUser(userId);
    if (cartItems.length === 0) {
      throw AppError.badRequest('Your cart is empty');
    }

    const totalAmount = Number(
      cartItems.reduce((sum, item) => sum + Number(item.line_total), 0).toFixed(2),
    );

    const lines = cartItems.map((item) => ({
      productId: item.product_id,
      productName: item.name,
      unitPrice: Number(item.price),
      quantity: item.quantity,
    }));

    let orderId: number;
    try {
      orderId = await orderRepository.createOrder({ userId, totalAmount, lines });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
        const productId = error.message.split(':')[1];
        throw AppError.conflict(
          `Insufficient stock for product ${productId}; please update your cart`,
        );
      }
      throw error;
    }

    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) {
      throw AppError.internal('Order was created but could not be loaded');
    }
    return order;
  },

  /** Returns the user's order history with line items attached. */
  async history(userId: number): Promise<OrderWithItems[]> {
    const orders = await orderRepository.findByUser(userId);
    if (orders.length === 0) {
      return [];
    }

    const items = await orderRepository.findItemsForOrders(
      orders.map((order) => order.id),
    );

    return orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.order_id === order.id),
    }));
  },
};
