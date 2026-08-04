'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { apiClient, formatVnd } from '@/lib/apiClient';
import type { Coupon } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminLangTabs from '@/components/AdminLangTabs';
import AdminCheckbox from '@/components/admin/AdminCheckbox';
import AdminIconButton from '@/components/admin/AdminIconButton';
import AdminField from '@/components/admin/AdminField';
import BulkActionBar from '@/components/admin/BulkActionBar';
import { useSelection } from '@/hooks/useSelection';
import {
  emptyLocalized,
  fillLocalized,
  localeField,
  toLocalizedRaw,
  type LocaleCode,
  type LocalizedString,
} from '@/lib/localized';

const empty = {
  code: '',
  description: emptyLocalized(),
  type: 'percent' as 'percent' | 'fixed',
  value: 10,
  minOrder: 0,
  maxDiscount: undefined as number | undefined,
  usageLimit: undefined as number | undefined,
  isActive: true,
};

export default function AdminCouponsPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [lang, setLang] = useState<LocaleCode>('vi');
  const [busy, setBusy] = useState(false);

  const allIds = useMemo(() => coupons.map((c) => c._id), [coupons]);
  const selection = useSelection(allIds);

  const load = async () => {
    const { data } = await apiClient.get<Coupon[]>('/coupons');
    setCoupons(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const setDescription = (value: string) => {
    setForm((f) => ({
      ...f,
      description: { ...f.description, [lang]: value } as LocalizedString,
    }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        description: fillLocalized(form.description),
        maxDiscount: form.maxDiscount || undefined,
        usageLimit: form.usageLimit || undefined,
      };
      if (editingId) {
        await apiClient.put(`/coupons/${editingId}`, payload);
        toast.success('Đã cập nhật mã giảm giá');
      } else {
        await apiClient.post('/coupons', payload);
        toast.success('Đã tạo mã giảm giá');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(empty);
      setLang('vi');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu mã');
    }
  };

  const startEdit = (c: Coupon) => {
    setEditingId(c._id);
    setLang('vi');
    setForm({
      code: c.code,
      description: toLocalizedRaw(c.description),
      type: c.type,
      value: c.value,
      minOrder: c.minOrder,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      isActive: c.isActive,
    });
    setShowForm(true);
  };

  const removeOne = async (id: string) => {
    const ok = await confirm({
      title: 'Xoá vĩnh viễn mã giảm giá?',
      description: 'Mã sẽ bị xoá khỏi database và không thể khôi phục.',
      confirmLabel: 'Xoá vĩnh viễn',
      cancelLabel: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      toast.success('Đã xoá vĩnh viễn mã');
      selection.clear();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xoá mã');
    }
  };

  const removeSelected = async () => {
    const ids = selection.selectedIds;
    if (ids.length === 0) return;
    const ok = await confirm({
      title: `Xoá vĩnh viễn ${ids.length} mã giảm giá?`,
      description: 'Các mã đã chọn sẽ bị xoá khỏi database. Không thể hoàn tác.',
      confirmLabel: 'Xoá vĩnh viễn',
      cancelLabel: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await apiClient.post('/coupons/bulk-delete', { ids });
      toast.success(`Đã xoá ${ids.length} mã`);
      selection.clear();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xoá hàng loạt');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md max-md:text-4xl">
          Mã giảm giá
        </h1>
        <AdminIconButton
          label="Thêm mã"
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setForm(empty);
            setLang('vi');
            setShowForm(true);
          }}
        >
          <IconPlus size={18} stroke={1.5} />
          <span className="pr-1">Thêm</span>
        </AdminIconButton>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="mt-8 space-y-3 rounded-lg border border-hairline-light bg-canvas-light p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-heading-xl">
              {editingId ? 'Sửa mã' : 'Thêm mới'}
            </h2>
            <AdminLangTabs value={lang} onChange={setLang} />
          </div>
          <p className="text-xs text-shade-50">
            Đang nhập bản {lang === 'vi' ? 'Tiếng Việt' : 'English'}. Nên điền đủ
            cả hai ngôn ngữ cho mô tả.
          </p>

          <AdminField
            label="Mã giảm giá"
            hint="Khách nhập ở checkout. Tự viết hoa (VD: DRINKS10)."
          >
            <input
              className="input-field"
              placeholder="DRINKS10"
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              required
            />
          </AdminField>

          <AdminField
            label="Mô tả mã"
            hint="Hiện kèm mã trên banner / danh sách mã công khai (nếu dùng)."
          >
            <input
              className="input-field"
              placeholder={
                lang === 'vi' ? 'Giảm 10% đơn từ 100k' : '10% off from 100k'
              }
              value={form.description[lang]}
              onChange={(e) => setDescription(e.target.value)}
            />
          </AdminField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <AdminField
              label="Loại giảm"
              hint="Phần trăm (%) hoặc số tiền cố định (đ)."
            >
              <select
                className="input-field"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as 'percent' | 'fixed',
                  }))
                }
              >
                <option value="percent">Phần trăm</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </AdminField>
            <AdminField
              label="Giá trị"
              hint={
                form.type === 'percent'
                  ? 'VD: 10 = giảm 10% trên tạm tính.'
                  : 'Số tiền trừ thẳng (đ).'
              }
            >
              <input
                type="number"
                className="input-field"
                placeholder={form.type === 'percent' ? '10' : '20000'}
                value={form.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: Number(e.target.value) }))
                }
              />
            </AdminField>
            <AdminField
              label="Đơn tối thiểu (đ)"
              hint="Tạm tính phải ≥ mức này mới áp dụng mã. 0 = không giới hạn."
            >
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={form.minOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrder: Number(e.target.value) }))
                }
              />
            </AdminField>
            <AdminField
              label="Giảm tối đa (đ)"
              hint="Chỉ hữu ích với loại % — trần số tiền được giảm. Để trống = không trần."
            >
              <input
                type="number"
                className="input-field"
                placeholder="Tuỳ chọn"
                value={form.maxDiscount ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxDiscount: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </AdminField>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Lưu
            </button>
            <button
              type="button"
              className="btn-outline-light"
              onClick={() => setShowForm(false)}
            >
              Huỷ
            </button>
          </div>
        </form>
      )}

      <BulkActionBar
        count={selection.count}
        allSelected={selection.allSelected}
        someSelected={selection.someSelected}
        onToggleAll={selection.toggleAll}
        onClear={selection.clear}
      >
        <AdminIconButton
          label="Xoá đã chọn"
          variant="danger"
          disabled={busy}
          onClick={() => void removeSelected()}
        >
          <IconTrash size={18} stroke={1.5} />
          <span>Xoá</span>
        </AdminIconButton>
      </BulkActionBar>

      <ul className="mt-4 space-y-3">
        {coupons.map((c) => {
          const descVi = localeField(c.description, 'vi');
          const descEn = localeField(c.description, 'en');
          return (
            <li
              key={c._id}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-canvas-light p-4 ${
                selection.isSelected(c._id)
                  ? 'border-ink/30 bg-pistachio-10/40'
                  : 'border-hairline-light'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <AdminCheckbox
                  checked={selection.isSelected(c._id)}
                  onChange={() => selection.toggle(c._id)}
                  label={`Chọn ${c.code}`}
                />
                <div>
                  <p style={{ fontWeight: 550 }}>
                    {c.code}{' '}
                    {!c.isActive && (
                      <span className="text-xs text-shade-40">(tắt)</span>
                    )}
                  </p>
                  <p className="text-sm text-shade-50">
                    {c.type === 'percent' ? `${c.value}%` : formatVnd(c.value)}
                    {c.minOrder > 0 ? ` · min ${formatVnd(c.minOrder)}` : ''}
                    {` · đã dùng ${c.usedCount}${c.usageLimit ? `/${c.usageLimit}` : ''}`}
                  </p>
                  {descVi && (
                    <p className="text-sm text-shade-60">
                      {descVi}
                      {descEn && descEn !== descVi && (
                        <span className="text-shade-40"> / {descEn}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <AdminIconButton label="Sửa" onClick={() => startEdit(c)}>
                  <IconPencil size={18} stroke={1.5} />
                </AdminIconButton>
                <AdminIconButton
                  label="Xoá"
                  variant="danger"
                  onClick={() => void removeOne(c._id)}
                >
                  <IconTrash size={18} stroke={1.5} />
                </AdminIconButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
