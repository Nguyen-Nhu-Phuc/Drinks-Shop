'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { apiClient, formatVnd } from '@/lib/apiClient';
import type { Product, ProductCategory, ProductSize } from '@/types';
import { PRODUCT_CATEGORIES } from '@/types';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import AdminLangTabs from '@/components/AdminLangTabs';
import AdminCheckbox from '@/components/admin/AdminCheckbox';
import AdminIconButton from '@/components/admin/AdminIconButton';
import AdminField from '@/components/admin/AdminField';
import BulkActionBar from '@/components/admin/BulkActionBar';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useSelection } from '@/hooks/useSelection';
import { defaultProductSizes } from '@/lib/productSizes';
import {
  emptyLocalized,
  fillLocalized,
  localeField,
  pickLocale,
  toLocalizedRaw,
  type LocaleCode,
  type LocalizedString,
} from '@/lib/localized';

const emptyForm = {
  name: emptyLocalized(),
  description: emptyLocalized(),
  category: 'Cà phê' as ProductCategory,
  volumeMl: 350,
  sizes: defaultProductSizes(350) as ProductSize[],
  price: 0,
  salePrice: undefined as number | undefined,
  images: [] as string[],
  stock: 0,
  nutrition: { calo: 0, đường: 0, caffeine: 0 },
};

export default function AdminProductsPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [lang, setLang] = useState<LocaleCode>('vi');
  const [busy, setBusy] = useState(false);

  const allIds = useMemo(() => products.map((p) => p._id), [products]);
  const selection = useSelection(allIds);

  const load = async () => {
    const { data } = await apiClient.get<Product[]>('/products/admin/all');
    setProducts(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const setLoc = (field: 'name' | 'description', value: string) => {
    setForm((f) => ({
      ...f,
      [field]: { ...f[field], [lang]: value } as LocalizedString,
    }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error('Cần upload ít nhất 1 ảnh lên Cloudinary');
      return;
    }
    if (!form.name.vi.trim() && !form.name.en.trim()) {
      toast.error('Nhập tên sản phẩm (VI hoặc EN)');
      return;
    }
    const payload = {
      ...form,
      name: fillLocalized(form.name),
      description: fillLocalized(form.description),
      images: form.images.filter(Boolean),
      salePrice: form.salePrice || undefined,
      sizes: form.sizes.filter((s) => s.label.trim() && s.volumeMl > 0),
    };
    try {
      if (editingId) {
        await apiClient.put(`/products/${editingId}`, payload);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await apiClient.post('/products', payload);
        toast.success('Đã thêm sản phẩm');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setLang('vi');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu sản phẩm');
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p._id);
    setLang('vi');
    setForm({
      name: toLocalizedRaw(p.name),
      description: toLocalizedRaw(p.description),
      category: p.category,
      volumeMl: p.volumeMl,
      sizes:
        p.sizes && p.sizes.length > 0
          ? p.sizes.map((s) => ({
              label: s.label,
              volumeMl: s.volumeMl,
              priceExtra: s.priceExtra ?? 0,
            }))
          : defaultProductSizes(p.volumeMl),
      price: p.price,
      salePrice: p.salePrice,
      images: p.images,
      stock: p.stock,
      nutrition: {
        calo: Number((p.nutrition as Record<string, number>)?.calo ?? 0),
        đường: Number((p.nutrition as Record<string, number>)?.đường ?? 0),
        caffeine: Number((p.nutrition as Record<string, number>)?.caffeine ?? 0),
      },
    });
    setShowForm(true);
  };

  const removeOne = async (id: string) => {
    const ok = await confirm({
      title: 'Xoá vĩnh viễn sản phẩm?',
      description:
        'Sản phẩm sẽ bị xoá khỏi database. Đánh giá liên quan cũng bị xoá. Không thể hoàn tác.',
      confirmLabel: 'Xoá vĩnh viễn',
      cancelLabel: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Đã xoá vĩnh viễn sản phẩm');
      selection.clear();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xoá sản phẩm');
    }
  };

  const removeSelected = async () => {
    const ids = selection.selectedIds;
    if (ids.length === 0) return;
    const ok = await confirm({
      title: `Xoá vĩnh viễn ${ids.length} sản phẩm?`,
      description:
        'Các sản phẩm đã chọn sẽ bị xoá khỏi database kèm đánh giá liên quan. Không thể hoàn tác.',
      confirmLabel: 'Xoá vĩnh viễn',
      cancelLabel: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await apiClient.post('/products/bulk-delete', { ids });
      toast.success(`Đã xoá ${ids.length} sản phẩm`);
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
        <h1 className="font-display text-display-md max-md:text-4xl">Sản phẩm</h1>
        <AdminIconButton
          label="Thêm sản phẩm"
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
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
          className="mt-8 space-y-4 rounded-lg border border-hairline-light bg-canvas-light p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-heading-xl">
              {editingId ? 'Sửa sản phẩm' : 'Thêm mới'}
            </h2>
            <AdminLangTabs value={lang} onChange={setLang} />
          </div>
          <p className="text-xs text-shade-50">
            Đang nhập bản {lang === 'vi' ? 'Tiếng Việt' : 'English'}. Nên điền đủ cả hai
            ngôn ngữ.
          </p>

          <AdminField
            label="Tên sản phẩm"
            hint="Hiện trên thẻ sản phẩm, trang chi tiết, giỏ hàng và kết quả tìm kiếm."
          >
            <input
              className="input-field"
              placeholder={lang === 'vi' ? 'VD: Matcha Latte' : 'e.g. Matcha Latte'}
              value={form.name[lang]}
              onChange={(e) => setLoc('name', e.target.value)}
              required={lang === 'vi'}
            />
          </AdminField>

          <AdminField
            label="Mô tả"
            hint="Đoạn giới thiệu trên trang chi tiết sản phẩm; dùng cho tư vấn AI."
          >
            <textarea
              className="input-field min-h-[80px]"
              placeholder={
                lang === 'vi'
                  ? 'Mô tả hương vị, cách thưởng thức…'
                  : 'Taste notes, how to enjoy…'
              }
              value={form.description[lang]}
              onChange={(e) => setLoc('description', e.target.value)}
              required={lang === 'vi'}
            />
          </AdminField>

          <AdminField
            label="Danh mục"
            hint="Pill phân loại trên thẻ SP và bộ lọc trang /products."
          >
            <select
              className="input-field"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as ProductCategory,
                }))
              }
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </AdminField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <AdminField
              label="Dung tích gốc (ml)"
              hint="Size S mặc định; hiện 'Từ … ml' trên thẻ SP."
            >
              <input
                type="number"
                className="input-field"
                placeholder="350"
                value={form.volumeMl}
                onChange={(e) => {
                  const volumeMl = Number(e.target.value);
                  setForm((f) => ({
                    ...f,
                    volumeMl,
                    sizes: f.sizes.map((s) =>
                      s.label === 'S'
                        ? { ...s, volumeMl: Math.max(1, volumeMl) }
                        : s
                    ),
                  }));
                }}
              />
            </AdminField>
            <AdminField
              label="Giá gốc (đ)"
              hint="Giá niêm yết trước khuyến mãi; dùng tính giá size."
            >
              <input
                type="number"
                className="input-field"
                placeholder="55000"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
              />
            </AdminField>
            <AdminField
              label="Giá khuyến mãi (đ)"
              hint="Để trống nếu không giảm. Hiện giá gạch ngang trên storefront."
            >
              <input
                type="number"
                className="input-field"
                placeholder="Tuỳ chọn"
                value={form.salePrice ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    salePrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </AdminField>
            <AdminField
              label="Tồn kho"
              hint="Số lượng còn bán; hết hàng sẽ khoá nút thêm giỏ."
            >
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                }
              />
            </AdminField>
          </div>

          <div className="space-y-3 rounded-lg border border-hairline-light p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-shade-50">
                  Size (S / M / L)
                </p>
                <p className="mt-1 text-[12px] text-shade-40">
                  Khách chọn trên trang chi tiết. Giá bán = giá SP + phụ thu size.
                </p>
              </div>
              <button
                type="button"
                className="text-xs text-shade-50 underline"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    sizes: defaultProductSizes(f.volumeMl || 350),
                  }))
                }
              >
                Reset S/M/L mặc định
              </button>
            </div>
            <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[11px] uppercase tracking-[0.06em] text-shade-40 md:grid">
              <span>Nhãn (hiện nút chọn)</span>
              <span>Dung tích ml</span>
              <span>Phụ thu (đ)</span>
              <span />
            </div>
            <div className="space-y-2">
              {form.sizes.map((s, idx) => (
                <div
                  key={`${s.label}-${idx}`}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <AdminField label="Nhãn size" className="md:[&>span:first-child]:hidden">
                    <input
                      className="input-field"
                      placeholder="S / M / L"
                      value={s.label}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sizes: f.sizes.map((row, i) =>
                            i === idx ? { ...row, label: e.target.value } : row
                          ),
                        }))
                      }
                    />
                  </AdminField>
                  <AdminField label="ml" className="md:[&>span:first-child]:hidden">
                    <input
                      type="number"
                      className="input-field"
                      placeholder="350"
                      value={s.volumeMl}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sizes: f.sizes.map((row, i) =>
                            i === idx
                              ? { ...row, volumeMl: Number(e.target.value) }
                              : row
                          ),
                        }))
                      }
                    />
                  </AdminField>
                  <AdminField
                    label="Phụ thu"
                    className="md:[&>span:first-child]:hidden"
                  >
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      value={s.priceExtra}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sizes: f.sizes.map((row, i) =>
                            i === idx
                              ? { ...row, priceExtra: Number(e.target.value) }
                              : row
                          ),
                        }))
                      }
                    />
                  </AdminField>
                  <button
                    type="button"
                    className="text-sm text-shade-50 underline md:self-end md:px-2 md:pb-3"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        sizes: f.sizes.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    Xoá
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="text-sm text-ink underline"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  sizes: [
                    ...f.sizes,
                    {
                      label: 'XL',
                      volumeMl: Math.round(f.volumeMl * 1.75),
                      priceExtra: 15000,
                    },
                  ],
                }))
              }
            >
              + Thêm size
            </button>
          </div>

          <div className="space-y-3 rounded-lg border border-hairline-light p-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-shade-50">
                Dinh dưỡng
              </p>
              <p className="mt-1 text-[12px] text-shade-40">
                Hiện khối “DINH DƯỠNG” trên trang chi tiết sản phẩm (calo, đường, caffeine).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <AdminField
                label="Calo"
                hint="Năng lượng (kcal) mỗi size tiêu chuẩn — hiện cột Calo."
              >
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  placeholder="0"
                  value={form.nutrition.calo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      nutrition: {
                        ...f.nutrition,
                        calo: Number(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </AdminField>
              <AdminField
                label="Đường"
                hint="Lượng đường (g) — hiện cột Đường trên trang SP."
              >
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  placeholder="0"
                  value={form.nutrition.đường}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      nutrition: {
                        ...f.nutrition,
                        đường: Number(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </AdminField>
              <AdminField
                label="Caffeine"
                hint="Hàm lượng caffeine (mg) — hiện cột Caffeine trên trang SP."
              >
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  placeholder="0"
                  value={form.nutrition.caffeine}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      nutrition: {
                        ...f.nutrition,
                        caffeine: Number(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </AdminField>
            </div>
          </div>

          <AdminField
            label="Ảnh sản phẩm"
            hint="Ảnh đầu tiên là ảnh chính trên thẻ SP, giỏ hàng và gallery."
          >
            <CloudinaryUpload
              label=""
              images={form.images}
              onChange={(images) => setForm((f) => ({ ...f, images }))}
              max={5}
              replace={false}
            />
          </AdminField>          <div className="flex gap-3">
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
        {products.map((p) => (
          <li
            key={p._id}
            className={`flex flex-wrap items-center gap-4 rounded-lg border bg-canvas-light p-4 ${
              selection.isSelected(p._id)
                ? 'border-ink/30 bg-pistachio-10/40'
                : 'border-hairline-light'
            }`}
          >
            <AdminCheckbox
              checked={selection.isSelected(p._id)}
              onChange={() => selection.toggle(p._id)}
              label={`Chọn ${pickLocale(p.name, 'vi')}`}
            />
            <div className="relative h-14 w-14 overflow-hidden rounded-sm bg-canvas-night">
              <Image src={p.images[0]} alt="" fill className="object-contain" sizes="56px" />
            </div>
            <div className="min-w-0 flex-1">
              <p style={{ fontWeight: 550 }}>
                {pickLocale(p.name, 'vi')}
                {localeField(p.name, 'en') &&
                  localeField(p.name, 'en') !== localeField(p.name, 'vi') && (
                    <span className="ml-2 text-xs font-normal text-shade-40">
                      / {localeField(p.name, 'en')}
                    </span>
                  )}{' '}
                {!p.isActive && (
                  <span className="text-xs text-shade-40">(đã ẩn)</span>
                )}
              </p>
              <p className="text-sm text-shade-50">
                {p.category} · {formatVnd(p.salePrice ?? p.price)} · Kho {p.stock}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AdminIconButton label="Sửa" onClick={() => startEdit(p)}>
                <IconPencil size={18} stroke={1.5} />
              </AdminIconButton>
              <AdminIconButton
                label="Xoá"
                variant="danger"
                onClick={() => void removeOne(p._id)}
              >
                <IconTrash size={18} stroke={1.5} />
              </AdminIconButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
