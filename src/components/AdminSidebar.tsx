'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/site', label: 'Giao diện' },
  { href: '/admin/products', label: 'Sản phẩm' },
  { href: '/admin/orders', label: 'Đơn hàng' },
  { href: '/admin/coupons', label: 'Voucher' },
  { href: '/admin/users', label: 'Người dùng' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-hairline-light bg-canvas-light md:w-56 md:border-b-0 md:border-r">
      <div className="p-6">
        <p className="font-display text-heading-sm">Admin</p>
        <nav className="mt-6 flex flex-row gap-2 overflow-x-auto md:flex-col">
          {links.map((l) => {
            const active =
              l.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-pill px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-ink text-on-primary'
                    : 'text-shade-60 hover:bg-shade-30'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
