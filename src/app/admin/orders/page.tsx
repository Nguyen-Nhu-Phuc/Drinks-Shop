'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { apiClient, formatVnd } from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminCheckbox from '@/components/admin/AdminCheckbox';
import AdminIconButton from '@/components/admin/AdminIconButton';
import BulkActionBar from '@/components/admin/BulkActionBar';
import { useSelection } from '@/hooks/useSelection';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';

const STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'preparing',
  'delivering',
  'delivered',
  'cancelled',
];

export default function AdminOrdersPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('preparing');
  const [busy, setBusy] = useState(false);

  const allIds = useMemo(() => orders.map((o) => o._id), [orders]);
  const selection = useSelection(allIds);

  const load = async (s?: string) => {
    const { data } = await apiClient.get<Order[]>('/orders/admin/all', {
      params: s ? { status: s } : {},
    });
    setOrders(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (id: string, next: OrderStatus, prev: OrderStatus) => {
    if (next === prev) return;

    if (next === 'cancelled') {
      const ok = await confirm({
        title: 'Huỷ đơn hàng này?',
        description: `Đơn sẽ chuyển sang trạng thái "${ORDER_STATUS_LABELS.cancelled}".`,
        confirmLabel: 'Huỷ đơn',
        cancelLabel: 'Không',
        variant: 'danger',
      });
      if (!ok) {
        setOrders((list) => [...list]);
        return;
      }
    }

    try {
      await apiClient.patch(`/orders/${id}/status`, { status: next });
      toast.success(`Đã cập nhật: ${ORDER_STATUS_LABELS[next]}`);
      await load(status || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật đơn');
      setOrders((list) => [...list]);
    }
  };

  const applyBulkStatus = async () => {
    const ids = selection.selectedIds;
    if (ids.length === 0) return;

    const ok = await confirm({
      title: `Cập nhật ${ids.length} đơn → ${ORDER_STATUS_LABELS[bulkStatus]}?`,
      description:
        bulkStatus === 'cancelled'
          ? 'Các đơn đã chọn sẽ bị huỷ. Thao tác cần cân nhắc kỹ.'
          : `Trạng thái mới: ${ORDER_STATUS_LABELS[bulkStatus]}.`,
      confirmLabel: 'Cập nhật',
      cancelLabel: 'Huỷ',
      variant: bulkStatus === 'cancelled' ? 'danger' : 'default',
    });
    if (!ok) return;

    setBusy(true);
    try {
      await apiClient.post('/orders/admin/bulk-status', {
        ids,
        status: bulkStatus,
      });
      toast.success(`Đã cập nhật ${ids.length} đơn`);
      selection.clear();
      await load(status || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật hàng loạt');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-display-md max-md:text-4xl">Đơn hàng</h1>
      <div className="mt-6">
        <select
          className="input-field max-w-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            selection.clear();
            void load(e.target.value || undefined);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <BulkActionBar
        count={selection.count}
        allSelected={selection.allSelected}
        someSelected={selection.someSelected}
        onToggleAll={selection.toggleAll}
        onClear={selection.clear}
      >
        <select
          className="input-field !min-h-[36px] !py-1.5 text-sm"
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <AdminIconButton
          label="Áp dụng trạng thái"
          variant={bulkStatus === 'cancelled' ? 'danger' : 'primary'}
          disabled={busy}
          onClick={() => void applyBulkStatus()}
        >
          {bulkStatus === 'cancelled' ? (
            <IconTrash size={18} stroke={1.5} />
          ) : null}
          <span>Áp dụng</span>
        </AdminIconButton>
      </BulkActionBar>

      <ul className="mt-4 space-y-4">
        {orders.map((o) => (
          <li
            key={o._id}
            className={`rounded-lg border bg-canvas-light p-6 ${
              selection.isSelected(o._id)
                ? 'border-ink/30 bg-pistachio-10/40'
                : 'border-hairline-light'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <AdminCheckbox
                  checked={selection.isSelected(o._id)}
                  onChange={() => selection.toggle(o._id)}
                  label={`Chọn đơn ${o.orderNumber}`}
                />
                <div>
                  <p className="font-display text-heading-md">{o.orderNumber}</p>
                  <p className="text-sm text-shade-50">
                    {typeof o.user === 'object'
                      ? `${o.user.name} · ${o.user.email}`
                      : o.user}
                  </p>
                  <p className="mt-1 text-sm">{formatVnd(o.total)}</p>
                </div>
              </div>
              <select
                className="input-field max-w-[180px]"
                value={o.status}
                onChange={(e) =>
                  void updateStatus(o._id, e.target.value as OrderStatus, o.status)
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <ul className="mt-3 text-sm text-shade-60">
              {o.items.map((item, i) => (
                <li key={i}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
