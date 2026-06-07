import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { Product, ProductQuery } from '../types';

type ProductRow = Product & RowDataPacket;
type CountRow = RowDataPacket & { total: number };

/** Data-access layer for the `products` table. */
export const productRepository = {
  /**
   * Lists products with optional text search, category/price filtering,
   * sorting and pagination. All dynamic values are bound as parameters;
   * sort columns are mapped through an allow-list to avoid injection.
   */
  async search(
    query: ProductQuery,
  ): Promise<{ items: Product[]; total: number }> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (query.search) {
      // LIKE-based search keeps behaviour predictable across MySQL configs.
      where.push('(name LIKE ? OR description LIKE ?)');
      const like = `%${query.search}%`;
      params.push(like, like);
    }
    if (query.category) {
      where.push('category = ?');
      params.push(query.category);
    }
    if (query.minPrice !== undefined) {
      where.push('price >= ?');
      params.push(query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      where.push('price <= ?');
      params.push(query.maxPrice);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const orderByMap: Record<NonNullable<ProductQuery['sort']>, string> = {
      price_asc: 'price ASC',
      price_desc: 'price DESC',
      rating: 'rating DESC',
      newest: 'created_at DESC',
    };
    const orderBy = query.sort ? orderByMap[query.sort] : 'id ASC';

    const offset = (query.page - 1) * query.limit;

    const [rows] = await pool.query<ProductRow[]>(
      `SELECT * FROM products ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, query.limit, offset],
    );

    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM products ${whereClause}`,
      params,
    );

    return { items: rows, total: countRows[0]?.total ?? 0 };
  },

  async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<ProductRow[]>(
      'SELECT * FROM products WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ?? null;
  },
};
