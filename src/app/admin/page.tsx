'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient, formatVnd } from '@/lib/apiClient';
import type { AdminStats } from '@/types';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types';
import { pickLocale } from '@/lib/localized';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    void apiClient.get<AdminStats>('/orders/admin/stats').then((res) => {
      setStats(res.data);
    });
  }, []);

  if (!stats) {
    return <p className="text-shade-50">Đang tải thống kê...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-display-md max-md:text-4xl">Tổng quan</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-aloe-10 p-6">
          <p className="text-xs uppercase tracking-[0.72px]">Doanh thu</p>
          <p className="mt-2 font-display text-heading-xl">
            {formatVnd(stats.revenue)}
          </p>
        </div>
        <div className="rounded-lg border border-hairline-light bg-canvas-light p-6 shadow-card-light">
          <p className="text-xs uppercase tracking-[0.72px]">Đơn thanh toán</p>
          <p className="mt-2 font-display text-heading-xl">{stats.orderCount}</p>
        </div>
        <div className="rounded-lg border border-hairline-light bg-canvas-light p-6 shadow-card-light">
          <p className="text-xs uppercase tracking-[0.72px]">AOV</p>
          <p className="mt-2 font-display text-heading-xl">
            {formatVnd(stats.avgOrderValue || 0)}
          </p>
        </div>
        <div className="rounded-lg border border-hairline-light bg-canvas-light p-6 shadow-card-light">
          <p className="text-xs uppercase tracking-[0.72px]">Người dùng</p>
          <p className="mt-2 font-display text-heading-xl">{stats.totalUsers}</p>
        </div>
      </div>

      {stats.statusBreakdown && (
        <div className="mt-8 flex flex-wrap gap-2">
          {Object.entries(stats.statusBreakdown).map(([status, count]) => (
            <span key={status} className="pill-shade">
              {ORDER_STATUS_LABELS[status as OrderStatus] || status}: {count}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-heading-xl">Sắp hết hàng</h2>
          <ul className="mt-4 space-y-3">
            {stats.lowStock.length === 0 && (
              <li className="text-sm text-shade-50">Không có sản phẩm nào.</li>
            )}
            {stats.lowStock.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between rounded-md border border-hairline-light bg-canvas-light px-4 py-3 text-sm"
              >
                <span>{pickLocale(p.name, 'vi')}</span>
                <span className="pill-shade">Còn {p.stock}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-heading-xl">Bán chạy</h2>
          <ul className="mt-4 space-y-3">
            {stats.topProducts.map((p) => (
              <li
                key={p._id}
                className="flex items-center gap-3 rounded-md border border-hairline-light bg-canvas-light px-4 py-3"
              >
                {p.image && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-sm bg-canvas-night">
                    <Image src={p.image} alt="" fill className="object-contain" sizes="40px" />
                  </div>
                )}
                <div className="flex-1 text-sm">
                  <p style={{ fontWeight: 550 }}>{pickLocale(p.name, 'vi')}</p>
                  <p className="text-shade-50">
                    Đã bán {p.sold} · {formatVnd(p.revenue)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-heading-xl">Đơn gần đây</h2>
            <Link href="/admin/orders" className="text-sm underline">
              Tất cả
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {stats.recentOrders.map((o) => (
              <li
                key={o._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-hairline-light bg-canvas-light px-4 py-3 text-sm"
              >
                <span>
                  {o.orderNumber} ·{' '}
                  {typeof o.user === 'object' ? o.user.name : ''}
                </span>
                <span>
                  {ORDER_STATUS_LABELS[o.status]} · {formatVnd(o.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
