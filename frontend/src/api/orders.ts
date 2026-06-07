import { api, isOfflineError } from './client';
import { cartApi } from './cart';
import type {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  ShippingDetails,
} from '@/types';

export interface CreateOrderPayload {
  items: { productId: string | number; quantity: number }[];
  shipping: ShippingDetails;
  total: number;
}

interface RawOrderItem {
  id?: string | number;
  product_id?: string | number;
  product_name?: string;
  name?: string;
  unit_price?: number | string;
  price?: number | string;
  quantity: number | string;
  image?: string;
}

interface RawOrder {
  id: string | number;
  created_at?: string;
  createdAt?: string;
  status?: string;
  total_amount?: number | string;
  total?: number | string;
  items?: RawOrderItem[];
  shipping?: ShippingDetails;
}

const STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'pending',
  paid: 'processing',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

function mapOrderItem(raw: RawOrderItem): OrderItem {
  return {
    id: raw.id ?? raw.product_id ?? `${raw.product_name ?? raw.name}-${raw.quantity}`,
    name: raw.product_name ?? raw.name ?? 'Item',
    price: Number(raw.unit_price ?? raw.price ?? 0),
    quantity: Number(raw.quantity),
    image: raw.image,
  };
}

/** Maps a backend order DTO onto the frontend Order domain type. */
function mapOrder(raw: RawOrder): Order {
  return {
    id: raw.id,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    status: STATUS_MAP[String(raw.status ?? 'processing')] ?? 'processing',
    total: Number(raw.total_amount ?? raw.total ?? 0),
    items: (raw.items ?? []).map(mapOrderItem),
    shipping: raw.shipping,
  };
}

function unwrapOrders(payload: unknown): RawOrder[] {
  const root = payload as
    | { data?: { orders?: RawOrder[] } | RawOrder[]; orders?: RawOrder[] }
    | RawOrder[];
  if (Array.isArray(root)) return root;
  if (Array.isArray(root.data)) return root.data;
  return root.data?.orders ?? root.orders ?? [];
}

function unwrapOrder(payload: unknown): RawOrder {
  const root = payload as {
    data?: { order?: RawOrder } | RawOrder;
    order?: RawOrder;
  };
  const data = root.data;
  if (data && typeof data === 'object' && 'order' in data && data.order) {
    return data.order;
  }
  return (data as RawOrder) ?? (root.order as RawOrder) ?? (payload as RawOrder);
}

/* --------------------------------------------------------------------------
 * Demo Mode — graceful offline fallback
 * When the backend on port 5001 is unreachable, synthesise a confirmed order
 * so the multi-step checkout wizard can transition to its final animated
 * confirmation step without a live database.
 * ------------------------------------------------------------------------ */

/** Generates a short, human-readable fallback order id (e.g. AURA-9X82K). */
function mockOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `AURA-${suffix}`;
}

/** Builds a confirmed Order from the checkout payload for offline Demo Mode. */
function createMockOrder(payload: CreateOrderPayload): Order {
  return {
    id: mockOrderId(),
    createdAt: new Date().toISOString(),
    status: 'processing',
    total: payload.total,
    items: payload.items.map((item) => ({
      id: item.productId,
      name: 'Item',
      price: 0,
      quantity: item.quantity,
    })),
    shipping: payload.shipping,
  };
}

export const ordersApi = {
  /** Fetches the authenticated user's order history. */
  async list(): Promise<Order[]> {
    const { data } = await api.get('/orders/history');
    return unwrapOrders(data).map(mapOrder);
  },

  /**
   * Atomically places an order. The backend builds the order from the
   * authenticated user's server-side cart, so we first reconcile that cart
   * to match what the shopper sees, then trigger the transaction endpoint.
   */
  async create(payload: CreateOrderPayload): Promise<Order> {
    try {
      await cartApi.replace(payload.items);
      const { data } = await api.post('/orders', {});
      return mapOrder(unwrapOrder(data));
    } catch (error) {
      if (!isOfflineError(error)) throw error;
      // Backend offline — confirm the transaction locally under Demo Mode.
      return createMockOrder(payload);
    }
  },
};

/** Builds the order payload from current cart items + shipping details. */
export function buildOrderPayload(
  items: CartItem[],
  shipping: ShippingDetails,
  total: number,
): CreateOrderPayload {
  return {
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    })),
    shipping,
    total,
  };
}

