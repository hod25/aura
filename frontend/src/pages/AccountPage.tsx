import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Package, ShoppingBag, User as UserIcon } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { OrderHistorySkeleton } from '@/components/features/account';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/api/orders';
import { cn, formatCurrency, formatDate, initials } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-gold-50 text-gold-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-50 text-red-600',
};

export function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    ordersApi
      .list()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch(() => {
        if (active) setOrders([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900 text-xl font-semibold text-white">
              {user ? initials(user.name) : <UserIcon className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink-900">
                {user?.name ?? 'Your account'}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-ink-500">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
            </div>
          </div>
          <Link to="/catalog">
            <Button variant="outline">
              <ShoppingBag className="h-4 w-4" />
              Continue shopping
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total orders', value: orders.length, icon: Package },
            {
              label: 'Total spent',
              value: formatCurrency(totalSpent),
              icon: ShoppingBag,
            },
            {
              label: 'Member since',
              value: user?.createdAt ? formatDate(user.createdAt) : '—',
              icon: UserIcon,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-ink-200/60 bg-white p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-50 text-ink-600">
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-400">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-ink-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order history */}
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Order history
          </h2>

          {isLoading ? (
            <OrderHistorySkeleton />
          ) : orders.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
                <Package className="h-6 w-6 text-ink-300" />
              </span>
              <p className="mt-4 font-medium text-ink-900">No orders yet</p>
              <p className="mt-1 max-w-sm text-sm text-ink-500">
                When you place an order, it will appear here with full details.
              </p>
              <Link to="/catalog" className="mt-6">
                <Button>Start shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-3xl border border-ink-200/60 bg-white">
              {/* Desktop table */}
              <table className="hidden w-full text-left text-sm sm:table">
                <thead>
                  <tr className="border-b border-ink-200/70 text-xs uppercase tracking-wide text-ink-400">
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Items</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-ink-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-ink-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-ink-500">
                        {order.items.reduce((n, it) => n + it.quantity, 0)} items
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize',
                            statusStyles[order.status] ??
                              'bg-ink-100 text-ink-600',
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-ink-900">
                        {formatCurrency(order.total)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="divide-y divide-ink-100 sm:hidden">
                {orders.map((order) => (
                  <div key={order.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-ink-900">
                        #{order.id}
                      </span>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize',
                          statusStyles[order.status] ??
                            'bg-ink-100 text-ink-600',
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-ink-500">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-semibold text-ink-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
