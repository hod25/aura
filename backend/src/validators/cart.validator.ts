import { v } from './schema';

const MAX_QUANTITY = 99;

/** Schema for `POST /api/cart/items` — add a product to the cart. */
export const addCartItemSchema = v.object({
  product_id: v.number().int().min(1),
  quantity: v.number().int().min(1).max(MAX_QUANTITY).default(1),
});

/** Schema for `PUT /api/cart/items/:id` — set a line's quantity. */
export const updateCartItemSchema = v.object({
  quantity: v.number().int().min(1).max(MAX_QUANTITY),
});

/** Schema for the `:id` route param on cart item mutations. */
export const cartItemParamsSchema = v.object({
  id: v.number().int().min(1),
});
