'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminCheckbox from '@/components/admin/AdminCheckbox';
import AdminIconButton from '@/components/admin/AdminIconButton';
import BulkActionBar from '@/components/admin/BulkActionBar';
import { useSelection } from '@/hooks/useSelection';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(false);

  const selectableIds = useMemo(
    () => users.filter((u) => u.role !== 'admin').map((u) => u._id),
    [users]
  );
  const selection = useSelection(selectableIds);

  const load = async () => {
    const { data } = await apiClient.get<AdminUser[]>('/auth/users');
    setUsers(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = async (u: AdminUser) => {
    const locking = u.isActive;
    const ok = await confirm({
      title: locking ? `Khoá tài khoản ${u.name}?` : `Mở khoá tài khoản ${u.name}?`,
      description: locking
        ? 'Người dùng sẽ không đăng nhập được cho đến khi được mở khoá.'
        : 'Người dùng sẽ đăng nhập và sử dụng cửa hàng bình thường trở lại.',
      confirmLabel: locking ? 'Khoá' : 'Mở khoá',
      cancelLabel: 'Huỷ',
      variant: locking ? 'danger' : 'default',
    });
    if (!ok) return;
    try {
      await apiClient.patch(`/auth/users/${u._id}/toggle-active`);
      toast.success('Đã cập nhật trạng thái người dùng');
      selection.clear();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật');
    }
  };

  const bulkSetActive = async (isActive: boolean) => {
    const ids = selection.selectedIds;
    if (ids.length === 0) return;
    const ok = await confirm({
      title: isActive
        ? `Mở khoá ${ids.length} tài khoản?`
        : `Khoá ${ids.length} tài khoản?`,
      description: isActive
        ? 'Các tài khoản đã chọn sẽ đăng nhập được trở lại.'
        : 'Các tài khoản đã chọn sẽ không đăng nhập được.',
      confirmLabel: isActive ? 'Mở khoá' : 'Khoá',
      cancelLabel: 'Huỷ',
      variant: isActive ? 'default' : 'danger',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await apiClient.post('/auth/users/bulk-active', { ids, isActive });
      toast.success(
        isActive
          ? `Đã mở khoá ${ids.length} tài khoản`
          : `Đã khoá ${ids.length} tài khoản`
      );
      selection.clear();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật hàng loạt');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-display-md max-md:text-4xl">Người dùng</h1>

      <BulkActionBar
        count={selection.count}
        allSelected={selection.allSelected}
        someSelected={selection.someSelected}
        onToggleAll={selection.toggleAll}
        onClear={selection.clear}
      >
        <AdminIconButton
          label="Khoá đã chọn"
          variant="danger"
          disabled={busy}
          onClick={() => void bulkSetActive(false)}
        >
          <IconLock size={18} stroke={1.5} />
          <span>Khoá</span>
        </AdminIconButton>
        <AdminIconButton
          label="Mở khoá đã chọn"
          disabled={busy}
          onClick={() => void bulkSetActive(true)}
        >
          <IconLockOpen size={18} stroke={1.5} />
          <span>Mở khoá</span>
        </AdminIconButton>
      </BulkActionBar>

      <ul className="mt-4 space-y-3">
        {users.map((u) => (
          <li
            key={u._id}
            className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-canvas-light p-4 ${
              selection.isSelected(u._id)
                ? 'border-ink/30 bg-pistachio-10/40'
                : 'border-hairline-light'
            }`}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {u.role !== 'admin' ? (
                <AdminCheckbox
                  checked={selection.isSelected(u._id)}
                  onChange={() => selection.toggle(u._id)}
                  label={`Chọn ${u.name}`}
                />
              ) : (
                <span className="inline-block w-[22px]" aria-hidden />
              )}
              <div>
                <p style={{ fontWeight: 550 }}>
                  {u.name}{' '}
                  {u.role === 'admin' && (
                    <span className="pill-mint ml-2">Admin</span>
                  )}
                </p>
                <p className="text-sm text-shade-50">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={u.isActive ? 'pill-mint' : 'pill-shade'}>
                {u.isActive ? 'Hoạt động' : 'Đã khoá'}
              </span>
              {u.role !== 'admin' && (
                <AdminIconButton
                  label={u.isActive ? 'Khoá' : 'Mở khoá'}
                  variant={u.isActive ? 'danger' : 'default'}
                  onClick={() => void toggle(u)}
                >
                  {u.isActive ? (
                    <IconLock size={18} stroke={1.5} />
                  ) : (
                    <IconLockOpen size={18} stroke={1.5} />
                  )}
                </AdminIconButton>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
