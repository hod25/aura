import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { User } from '../types';

type UserRow = User & RowDataPacket;

/** Data-access layer for the `users` table. Parameterized queries only. */
export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    return rows[0] ?? null;
  },

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ?? null;
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [input.name, input.email, input.passwordHash],
    );
    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error('Failed to load user immediately after creation');
    }
    return created;
  },
};
