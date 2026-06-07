import { v } from './schema';

const MAX_QUANTITY = 99;

/**
 * Schema for `POST /api/orders` (checkout).
 *
 * The checkout transaction is built server-side from the authenticated
 * user's persisted cart, so the request body is optional. When a client
 * does include an `items` array (type/quantity/structure), it is validated
 * defensively before the order is processed.
 */
export const checkoutSchema = v.object({
  items: v
    .array(
      v.objectField({
        product_id: v.number().int().min(1),
        quantity: v.number().int().min(1).max(MAX_QUANTITY),
      }),
    )
    .min(1)
    .max(100)
    .optional(),
});
