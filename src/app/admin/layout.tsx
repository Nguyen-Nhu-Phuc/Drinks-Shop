'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/login?redirect=/admin');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="section-pad text-center text-shade-50">
        Đang kiểm tra quyền...
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 bg-canvas-cream p-6 md:p-10">{children}</div>
    </div>
  );
}
