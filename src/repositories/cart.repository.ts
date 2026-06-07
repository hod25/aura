import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { CartItem, CartItemDetailed } from '../types';

type CartItemRow = CartItem & RowDataPacket;
type DetailedRow = CartItemDetailed & RowDataPacket;

/** Data-access layer for the `cart_items` table. */
export const cartRepository = {
  /** Returns the user's cart joined with product details. */
  async findDetailedByUser(userId: number): Promise<CartItemDetailed[]> {
    const [rows] = await pool.query<DetailedRow[]>(
      `SELECT
         ci.id            AS id,
         ci.product_id    AS product_id,
         p.name           AS name,
         p.price          AS price,
         p.image_url      AS image_url,
         ci.quantity      AS quantity,
         (p.price * ci.quantity) AS line_total
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at ASC`,
      [userId],
    );
    return rows;
  },

  async findItemById(id: number, userId: number): Promise<CartItem | null> {
    const [rows] = await pool.query<CartItemRow[]>(
      'SELECT * FROM cart_items WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId],
    );
    return rows[0] ?? null;
  },

  async findItemByProduct(
    userId: number,
    productId: number,
  ): Promise<CartItem | null> {
    const [rows] = await pool.query<CartItemRow[]>(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1',
      [userId, productId],
    );
    return rows[0] ?? null;
  },

  /** Inserts a new item or increments the quantity of an existing one. */
  async upsert(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<void> {
    await pool.query<ResultSetHeader>(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, productId, quantity],
    );
  },

  async updateQuantity(
    id: number,
    userId: number,
    quantity: number,
  ): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId],
    );
    return result.affectedRows > 0;
  },

  async deleteItem(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [id, userId],
    );
    return result.affectedRows > 0;
  },

  async clearForUser(userId: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId],
    );
  },
};
