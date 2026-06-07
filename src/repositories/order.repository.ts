import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool, withTransaction } from '../config/db';
import { Order, OrderItem, OrderWithItems } from '../types';

type OrderRow = Order & RowDataPacket;
type OrderItemRow = OrderItem & RowDataPacket;

interface OrderLineInput {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

/** Data-access layer for the `orders` and `order_items` tables. */
export const orderRepository = {
  /**
   * Atomically creates an order and its line items, clears the user's cart,
   * and decrements product stock — all inside a single transaction.
   */
  async createOrder(input: {
    userId: number;
    totalAmount: number;
    lines: OrderLineInput[];
  }): Promise<number> {
    return withTransaction(async (connection) => {
      const [orderResult] = await connection.query<ResultSetHeader>(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [input.userId, input.totalAmount, 'paid'],
      );
      const orderId = orderResult.insertId;

      for (const line of input.lines) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO order_items
             (order_id, product_id, product_name, unit_price, quantity)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, line.productId, line.productName, line.unitPrice, line.quantity],
        );

        // Guard against overselling: only decrement when enough stock exists.
        const [stockResult] = await connection.query<ResultSetHeader>(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [line.quantity, line.productId, line.quantity],
        );
        if (stockResult.affectedRows === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${line.productId}`);
        }
      }

      await connection.query<ResultSetHeader>(
        'DELETE FROM cart_items WHERE user_id = ?',
        [input.userId],
      );

      return orderId;
    });
  },

  async findByUser(userId: number): Promise<Order[]> {
    const [rows] = await pool.query<OrderRow[]>(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    );
    return rows;
  },

  async findItemsForOrders(orderIds: number[]): Promise<OrderItem[]> {
    if (orderIds.length === 0) return [];
    const placeholders = orderIds.map(() => '?').join(', ');
    const [rows] = await pool.query<OrderItemRow[]>(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`,
      orderIds,
    );
    return rows;
  },

  async findByIdForUser(
    orderId: number,
    userId: number,
  ): Promise<OrderWithItems | null> {
    const [orderRows] = await pool.query<OrderRow[]>(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1',
      [orderId, userId],
    );
    const order = orderRows[0];
    if (!order) return null;

    const [itemRows] = await pool.query<OrderItemRow[]>(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
      [orderId],
    );
    return { ...order, items: itemRows };
  },
};
