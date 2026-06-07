/**
 * Public type barrel for the Aura backend.
 *
 * Architecture:
 *   - `db.ts`     — raw database row interfaces (persistence layer).
 *   - `domain.ts` — application/domain & transport entities.
 *
 * The aliases below preserve the historical type names used throughout the
 * codebase (which map to raw rows) so existing imports remain stable while
 * the row/entity separation is made explicit.
 */

export * from './db';
export * from './domain';

// Backward-compatible aliases: legacy names → raw database rows.
export type {
  UserRow as User,
  ProductRow as Product,
  CartItemRow as CartItem,
  OrderRow as Order,
  OrderItemRow as OrderItem,
} from './db';

