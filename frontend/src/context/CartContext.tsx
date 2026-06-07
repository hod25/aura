import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cartApi } from '@/api/cart';
import type { CartItem, Product } from '@/types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  itemCount: number;
  subtotal: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: Product['id']) => void;
  updateQuantity: (productId: Product['id'], quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const GUEST_CART_KEY = 'aura.cart';

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]): void {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => readGuestCart());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const hasSyncedRef = useRef(false);

  // Persist guest cart locally whenever it changes.
  useEffect(() => {
    writeGuestCart(items);
  }, [items]);

  // On login, pull the server cart and merge it with any guest items.
  useEffect(() => {
    if (!isAuthenticated || hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    let active = true;
    (async () => {
      try {
        const serverItems = await cartApi.get();
        if (!active) return;
        setItems((local) => mergeCarts(local, serverItems));
      } catch {
        /* backend cart unavailable — keep local cart */
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // Reset the sync guard on logout so a future login re-syncs.
  useEffect(() => {
    if (!isAuthenticated) hasSyncedRef.current = false;
  }, [isAuthenticated]);

  const syncAdd = useCallback(
    (productId: Product['id'], quantity: number) => {
      if (!isAuthenticated) return;
      cartApi.add(productId, quantity).catch(() => undefined);
    },
    [isAuthenticated],
  );

  const syncUpdate = useCallback(
    (productId: Product['id'], quantity: number) => {
      if (!isAuthenticated) return;
      cartApi.update(productId, quantity).catch(() => undefined);
    },
    [isAuthenticated],
  );

  const syncRemove = useCallback(
    (productId: Product['id']) => {
      if (!isAuthenticated) return;
      cartApi.remove(productId).catch(() => undefined);
    },
    [isAuthenticated],
  );

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [
          ...prev,
          { id: product.id, product, quantity },
        ];
      });
      syncAdd(product.id, quantity);
    },
    [syncAdd],
  );

  const removeItem = useCallback(
    (productId: Product['id']) => {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      syncRemove(productId);
    },
    [syncRemove],
  );

  const updateQuantity = useCallback(
    (productId: Product['id'], quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
        syncRemove(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i,
        ),
      );
      syncUpdate(productId, quantity);
    },
    [syncRemove, syncUpdate],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (isAuthenticated) cartApi.clear().catch(() => undefined);
  }, [isAuthenticated]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((v) => !v), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isDrawerOpen,
      itemCount,
      subtotal,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      isDrawerOpen,
      itemCount,
      subtotal,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Merges a guest cart with the server cart, summing quantities by product. */
function mergeCarts(local: CartItem[], server: CartItem[]): CartItem[] {
  const byId = new Map<string, CartItem>();
  for (const item of server) {
    if (item?.product?.id == null) continue;
    byId.set(String(item.product.id), { ...item });
  }
  for (const item of local) {
    const key = String(item.product.id);
    const existing = byId.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      byId.set(key, { ...item });
    }
  }
  return Array.from(byId.values());
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
