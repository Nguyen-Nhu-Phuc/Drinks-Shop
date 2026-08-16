'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiClient } from '@/lib/apiClient';
import { useSite } from '@/context/SiteContext';
import type {
  PageSection,
  SectionType,
  SiteSettings,
} from '@/types/site';
import { SECTION_TYPE_LABELS } from '@/types/site';
import SitePreviewDialog from '@/components/cms/SitePreviewDialog';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import AdminLangTabs from '@/components/AdminLangTabs';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { getLocField, setLocField } from '@/lib/cmsConfig';
import {
  emptyLocalized,
  localeField,
  toLocalizedRaw,
  type LocaleCode,
} from '@/lib/localized';

type Tab = 'layout' | 'brand' | 'nav' | 'footer' | 'ai';

function SortableRow({
  section,
  selected,
  onSelect,
  onToggle,
}: {
  section: PageSection;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-3 py-3 ${
        selected
          ? 'border-ink bg-aloe-10'
          : 'border-hairline-light bg-canvas-light'
      }`}
    >
      <button
        type="button"
        className="cursor-grab px-1 text-shade-40 active:cursor-grabbing"
        aria-label="Kéo"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={onSelect}
      >
        <p className="truncate text-sm font-medium">
          {section.title || SECTION_TYPE_LABELS[section.type]}
        </p>
        <p className="text-[11px] text-shade-50">
          {SECTION_TYPE_LABELS[section.type]}
        </p>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className={`rounded-pill px-3 py-1 text-[11px] font-medium ${
          section.enabled ? 'bg-ink text-on-primary' : 'bg-shade-30 text-shade-60'
        }`}
      >
        {section.enabled ? 'Bật' : 'Tắt'}
      </button>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-shade-50">
        {label}
      </span>
      {hint ? (
        <span className="mt-0.5 block text-[12px] leading-snug text-shade-40">
          {hint}
        </span>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SectionConfigEditor({
  section,
  onChange,
}: {
  section: PageSection;
  onChange: (config: Record<string, unknown>, title?: string) => void;
}) {
  const [lang, setLang] = useState<LocaleCode>('vi');
  const cfg = section.config;
  const set = (key: string, value: unknown) =>
    onChange({ ...cfg, [key]: value });
  const setText = (key: string, value: string) =>
    onChange(setLocField(cfg, key, lang, value));
  const text = (key: string) => getLocField(cfg, key, lang);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Field
          label="Tên section (admin)"
          hint="Chỉ hiện trong admin để nhận biết khối — không lên storefront."
        >
          <input
            className="input-field"
            value={section.title || ''}
            onChange={(e) => onChange(cfg, e.target.value)}
          />
        </Field>
        <AdminLangTabs value={lang} onChange={setLang} />
      </div>

      {(section.type === 'hero' ||
        section.type === 'categories' ||
        section.type === 'productGrid' ||
        section.type === 'ctaBand' ||
        section.type === 'richText' ||
        section.type === 'couponBanner') && (
        <Field
          label="Eyebrow"
          hint="Dòng chữ nhỏ phía trên tiêu đề (trang chủ)."
        >
          <input
            className="input-field"
            value={text('eyebrow')}
            onChange={(e) => setText('eyebrow', e.target.value)}
          />
        </Field>
      )}

      {section.type === 'hero' && (
        <>
          <Field
            label="Tiêu đề brand (lớn)"
            hint="Headline chính vùng hero trang chủ."
          >
            <input
              className="input-field"
              value={text('brandTitle')}
              onChange={(e) => setText('brandTitle', e.target.value)}
            />
          </Field>
          <Field label="Mô tả" hint="Câu hỗ trợ dưới tiêu đề hero.">
            <textarea
              className="input-field min-h-[80px]"
              value={text('subtitle')}
              onChange={(e) => setText('subtitle', e.target.value)}
            />
          </Field>
          <Field label="Nút CTA" hint="Chữ trên nút gọi hành động hero.">
            <input
              className="input-field"
              value={text('ctaLabel')}
              onChange={(e) => setText('ctaLabel', e.target.value)}
            />
          </Field>
          <Field label="Link CTA" hint="Đường dẫn khi bấm nút (VD: /products).">
            <input
              className="input-field"
              value={String(cfg.ctaHref ?? '')}
              onChange={(e) => set('ctaHref', e.target.value)}
            />
          </Field>
          <CloudinaryUpload
            label="Ảnh hero — nền/ảnh chiếm vùng đầu trang chủ"
            max={1}
            images={cfg.imageUrl ? [String(cfg.imageUrl)] : []}
            onChange={(imgs) => set('imageUrl', imgs[0] || '')}
          />
        </>
      )}

      {section.type === 'marquee' && (
        <>
          <Field
            label="Nguồn"
            hint="Chạy chữ tùy chỉnh hoặc lấy nội dung từ mã giảm giá đang mở."
          >
            <select
              className="input-field"
              value={String(cfg.mode ?? 'custom')}
              onChange={(e) => set('mode', e.target.value)}
            >
              <option value="custom">Chữ tùy chỉnh</option>
              <option value="coupons">Lấy từ voucher public</option>
            </select>
          </Field>
          <Field
            label={`Các dòng ${lang.toUpperCase()} (mỗi dòng 1 mục)`}
            hint="Mỗi dòng là một cụm chữ chạy ngang trên trang chủ."
          >
            <textarea
              className="input-field min-h-[100px]"
              value={
                Array.isArray(cfg.items)
                  ? (cfg.items as unknown[])
                      .map((item) => localeField(item, lang))
                      .join('\n')
                  : ''
              }
              onChange={(e) => {
                const lines = e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const prev = Array.isArray(cfg.items)
                  ? (cfg.items as unknown[])
                  : [];
                const next = lines.map((line, i) => {
                  const cur = toLocalizedRaw(prev[i]);
                  return { ...cur, [lang]: line };
                });
                set('items', next);
              }}
            />
          </Field>
        </>
      )}

      {(section.type === 'categories' ||
        section.type === 'couponBanner') && (
        <Field label="Tiêu đề" hint="Heading khối danh mục hoặc banner voucher.">
          <input
            className="input-field"
            value={text('heading')}
            onChange={(e) => setText('heading', e.target.value)}
          />
        </Field>
      )}

      {section.type === 'productGrid' && (
        <>
          <Field label="Tiêu đề" hint="Heading lưới sản phẩm trên trang chủ.">
            <input
              className="input-field"
              value={text('heading')}
              onChange={(e) => setText('heading', e.target.value)}
            />
          </Field>
          <Field label="Phụ đề" hint="Một dòng mô tả dưới tiêu đề lưới SP.">
            <input
              className="input-field"
              value={text('subtitle')}
              onChange={(e) => setText('subtitle', e.target.value)}
            />
          </Field>
          <Field
            label="Nguồn sản phẩm"
            hint="Bộ lọc lấy SP từ database để hiển thị trong khối."
          >
            <select
              className="input-field"
              value={String(cfg.source ?? 'featured')}
              onChange={(e) => set('source', e.target.value)}
            >
              <option value="featured">Nổi bật</option>
              <option value="sale">Đang giảm</option>
              <option value="bestseller">Bán chạy</option>
              <option value="newest">Mới nhất</option>
            </select>
          </Field>
          <Field label="Số lượng" hint="Tối đa bao nhiêu thẻ SP trong khối.">
            <input
              type="number"
              className="input-field"
              value={Number(cfg.limit ?? 6)}
              onChange={(e) => set('limit', Number(e.target.value))}
            />
          </Field>
          <Field label="Nền" hint="Màu nền section trên trang chủ.">
            <select
              className="input-field"
              value={String(cfg.canvas ?? 'cream')}
              onChange={(e) => set('canvas', e.target.value)}
            >
              <option value="cream">Cream</option>
              <option value="light">Light</option>
              <option value="pistachio">Pistachio</option>
              <option value="night">Night</option>
            </select>
          </Field>
          <Field label="Nút CTA" hint="Chữ nút xem thêm cuối khối.">
            <input
              className="input-field"
              value={text('ctaLabel')}
              onChange={(e) => setText('ctaLabel', e.target.value)}
            />
          </Field>
          <Field label="Link CTA" hint="Link nút xem thêm (thường /products).">
            <input
              className="input-field"
              value={String(cfg.ctaHref ?? '')}
              onChange={(e) => set('ctaHref', e.target.value)}
            />
          </Field>
        </>
      )}

      {(section.type === 'ctaBand' || section.type === 'richText') && (
        <>
          <Field label="Tiêu đề" hint="Heading dải CTA / khối văn bản.">
            <input
              className="input-field"
              value={text('heading')}
              onChange={(e) => setText('heading', e.target.value)}
            />
          </Field>
          <Field label="Nội dung" hint="Đoạn văn hiển thị dưới tiêu đề.">
            <textarea
              className="input-field min-h-[80px]"
              value={text('body')}
              onChange={(e) => setText('body', e.target.value)}
            />
          </Field>
          {section.type === 'ctaBand' && (
            <>
              <Field label="Nền" hint="Màu nền dải kêu gọi hành động.">
                <select
                  className="input-field"
                  value={String(cfg.canvas ?? 'night')}
                  onChange={(e) => set('canvas', e.target.value)}
                >
                  <option value="night">Night</option>
                  <option value="cream">Cream</option>
                  <option value="pistachio">Pistachio</option>
                </select>
              </Field>
              <Field label="Nút CTA" hint="Chữ trên nút trong dải CTA.">
                <input
                  className="input-field"
                  value={text('ctaLabel')}
                  onChange={(e) => setText('ctaLabel', e.target.value)}
                />
              </Field>
              <Field label="Link CTA" hint="Đích đến khi bấm nút CTA.">
                <input
                  className="input-field"
                  value={String(cfg.ctaHref ?? '')}
                  onChange={(e) => set('ctaHref', e.target.value)}
                />
              </Field>
            </>
          )}
        </>
      )}

      {section.type === 'couponBanner' && (
        <Field
          label="Tiêu đề phụ"
          hint="Heading phụ cạnh danh sách mã trên trang chủ."
        >
          <input
            className="input-field"
            value={text('heading')}
            onChange={(e) => setText('heading', e.target.value)}
          />
        </Field>
      )}
    </div>
  );
}


export default function AdminSitePage() {
  const { refresh: refreshPublic } = useSite();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<Tab>('layout');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addType, setAddType] = useState<SectionType>('productGrid');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [contentLang, setContentLang] = useState<LocaleCode>('vi');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const load = useCallback(async () => {
    const { data } = await apiClient.get<SiteSettings>('/site/admin');
    setSettings({
      ...data,
      aiWidget: {
        enabled: data.aiWidget?.enabled !== false,
        title: data.aiWidget?.title ?? { vi: 'Drinks AI', en: 'Drinks AI' },
        subtitle:
          data.aiWidget?.subtitle ?? {
            vi: 'Gợi ý đồ uống',
            en: 'Drink suggestions',
          },
        buttonLabel:
          data.aiWidget?.buttonLabel ?? { vi: '✦ Ask AI', en: '✦ Ask AI' },
        welcomeMessage:
          data.aiWidget?.welcomeMessage ?? {
            vi: 'Xin chào! Mình có thể gợi ý đồ uống...',
            en: 'Hi! I can suggest drinks for you...',
          },
      },
    });
    if (!selectedId && data.homeSections[0]) {
      setSelectedId(data.homeSections[0].id);
    }
  }, [selectedId]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = settings?.homeSections.find((s) => s.id === selectedId);

  const persist = async (next: SiteSettings) => {
    setSaving(true);
    try {
      const { data } = await apiClient.put<SiteSettings>('/site/admin', next);
      setSettings(data);
      await refreshPublic();
      toast.success('Đã lưu');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu');
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    if (!settings) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = settings.homeSections.map((s) => s.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const ordered = arrayMove(settings.homeSections, oldIndex, newIndex);
    setSettings({ ...settings, homeSections: ordered });
    try {
      await apiClient.put('/site/admin/home/reorder', {
        orderedIds: ordered.map((s) => s.id),
      });
      await refreshPublic();
      toast.success('Đã cập nhật thứ tự');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi reorder');
      await load();
    }
  };

  const toggleSection = async (id: string) => {
    if (!settings) return;
    const section = settings.homeSections.find((s) => s.id === id);
    if (!section) return;
    const { data } = await apiClient.put<PageSection>(
      `/site/admin/home/sections/${id}`,
      { enabled: !section.enabled }
    );
    setSettings({
      ...settings,
      homeSections: settings.homeSections.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    });
    await refreshPublic();
  };

  const saveSectionLocal = async (
    config: Record<string, unknown>,
    title?: string
  ) => {
    if (!settings || !selectedId) return;
    try {
      const { data } = await apiClient.put<PageSection>(
        `/site/admin/home/sections/${selectedId}`,
        { config, title }
      );
      setSettings({
        ...settings,
        homeSections: settings.homeSections.map((s) =>
          s.id === selectedId ? { ...s, ...data } : s
        ),
      });
      await refreshPublic();
      toast.success('Đã cập nhật section');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu section');
    }
  };

  const addSection = async () => {
    try {
      const { data } = await apiClient.post<PageSection>(
        '/site/admin/home/sections',
        { type: addType, title: SECTION_TYPE_LABELS[addType] }
      );
      await load();
      setSelectedId(data.id);
      await refreshPublic();
      toast.success('Đã thêm section');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi thêm section');
    }
  };

  const removeSection = async () => {
    if (!selectedId) return;
    const ok = await confirm({
      title: 'Xoá vĩnh viễn section?',
      description: 'Khối sẽ bị xoá khỏi cấu hình trang chủ. Không thể hoàn tác (trừ khi Reset layout mặc định).',
      confirmLabel: 'Xoá vĩnh viễn',
      cancelLabel: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/site/admin/home/sections/${selectedId}`);
      setSelectedId(null);
      await load();
      await refreshPublic();
      toast.success('Đã xoá section');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xoá section');
    }
  };

  const resetLayout = async () => {
    const ok = await confirm({
      title: 'Reset layout về mặc định?',
      description: 'Toàn bộ cấu hình section trang chủ hiện tại sẽ bị thay bằng layout mặc định.',
      confirmLabel: 'Reset',
      cancelLabel: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiClient.post('/site/admin/home/reset');
      await load();
      await refreshPublic();
      toast.success('Đã reset layout');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi reset');
    }
  };

  if (!settings) {
    return <p className="text-shade-50">Đang tải CMS...</p>;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'layout', label: 'Layout trang chủ' },
    { id: 'brand', label: 'Thương hiệu' },
    { id: 'nav', label: 'Menu' },
    { id: 'footer', label: 'Footer' },
    { id: 'ai', label: 'Chatbot' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md max-md:text-4xl">
            Giao diện
          </h1>
          <p className="mt-2 text-sm text-shade-50">
            Kéo thả section, chỉnh nội dung — thay đổi hiện ngay trên storefront.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-aloe !py-2 !px-4 text-sm"
            onClick={() => setPreviewOpen(true)}
          >
            Xem trước
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="btn-outline-light !py-2 !px-4 text-sm"
          >
            Trang chủ ↗
          </a>
        </div>
      </div>

      {settings && (
        <SitePreviewDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          settings={settings}
        />
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-pill px-4 py-2 text-sm ${
              tab === t.id ? 'bg-ink text-on-primary' : 'bg-shade-30 text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'layout' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Sections</p>
              <button
                type="button"
                className="text-xs underline"
                onClick={() => void resetLayout()}
              >
                Reset
              </button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => void onDragEnd(e)}
            >
              <SortableContext
                items={settings.homeSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {settings.homeSections.map((s) => (
                    <SortableRow
                      key={s.id}
                      section={s}
                      selected={s.id === selectedId}
                      onSelect={() => setSelectedId(s.id)}
                      onToggle={() => void toggleSection(s.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex gap-2 pt-2">
              <select
                className="input-field flex-1"
                value={addType}
                onChange={(e) => setAddType(e.target.value as SectionType)}
              >
                {(Object.keys(SECTION_TYPE_LABELS) as SectionType[]).map((t) => (
                  <option key={t} value={t}>
                    {SECTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-primary !px-4" onClick={() => void addSection()}>
                Thêm
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-hairline-light bg-canvas-light p-6">
            {selected ? (
              <>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="font-display text-heading-xl">
                    {SECTION_TYPE_LABELS[selected.type]}
                  </h2>
                  <button
                    type="button"
                    className="text-sm text-shade-50 underline"
                    onClick={() => void removeSection()}
                  >
                    Xoá
                  </button>
                </div>
                <SectionConfigEditor
                  section={selected}
                  onChange={(config, title) => {
                    setSettings({
                      ...settings,
                      homeSections: settings.homeSections.map((s) =>
                        s.id === selected.id
                          ? {
                              ...s,
                              config,
                              title: title !== undefined ? title : s.title,
                            }
                          : s
                      ),
                    });
                  }}
                />
                <button
                  type="button"
                  className="btn-primary mt-6"
                  disabled={saving}
                  onClick={() => {
                    const cur = settings.homeSections.find(
                      (s) => s.id === selected.id
                    );
                    if (cur) void saveSectionLocal(cur.config, cur.title);
                  }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu section'}
                </button>
              </>
            ) : (
              <p className="text-shade-50">Chọn một section bên trái để chỉnh.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'brand' && (
        <div className="mt-8 max-w-xl space-y-4 rounded-xl border border-hairline-light bg-canvas-light p-6">
          <CloudinaryUpload
            label="Logo thương hiệu — hiện trên navbar / footer"
            max={1}
            images={settings.logoUrl ? [settings.logoUrl] : []}
            onChange={(imgs) =>
              setSettings({ ...settings, logoUrl: imgs[0] || '' })
            }
          />
          <AdminLangTabs value={contentLang} onChange={setContentLang} />
          <Field
            label="Tên thương hiệu"
            hint="Chữ brand cạnh logo trên navbar (khi không dùng logo ảnh)."
          >
            <input
              className="input-field"
              value={localeField(settings.brandName, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.brandName);
                setSettings({
                  ...settings,
                  brandName: { ...cur, [contentLang]: e.target.value },
                });
              }}
            />
          </Field>
          <Field
            label="Tagline"
            hint="Slogan ngắn có thể hiện kèm thương hiệu / footer."
          >
            <input
              className="input-field"
              value={localeField(settings.tagline, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.tagline);
                setSettings({
                  ...settings,
                  tagline: { ...cur, [contentLang]: e.target.value },
                });
              }}
            />
          </Field>
          <Field
            label="Email liên hệ"
            hint="Hiện ở footer / dòng thông tin liên hệ."
          >
            <input
              className="input-field"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
            />
          </Field>
          <Field label="Hotline" hint="Số điện thoại hiện ở footer / preview.">
            <input
              className="input-field"
              value={settings.contactPhone}
              onChange={(e) =>
                setSettings({ ...settings, contactPhone: e.target.value })
              }
            />
          </Field>
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() => void persist(settings)}
          >
            Lưu thương hiệu
          </button>
        </div>
      )}

      {tab === 'nav' && (
        <div className="mt-8 max-w-2xl space-y-4 rounded-xl border border-hairline-light bg-canvas-light p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-shade-50">
              Menu trên navbar. Bật/tắt hoặc đổi nhãn & link.
            </p>
            <AdminLangTabs value={contentLang} onChange={setContentLang} />
          </div>
          {settings.navLinks.map((link, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-lg border border-hairline-light p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
            >
              <Field label="Nhãn menu" hint="Chữ hiện trên thanh navbar.">
                <input
                  className="input-field"
                  placeholder="Nhãn"
                  value={localeField(link.label, contentLang)}
                  onChange={(e) => {
                    const navLinks = [...settings.navLinks];
                    const cur = toLocalizedRaw(link.label);
                    navLinks[i] = {
                      ...link,
                      label: { ...cur, [contentLang]: e.target.value },
                    };
                    setSettings({ ...settings, navLinks });
                  }}
                />
              </Field>
              <Field label="Đường dẫn" hint="URL nội bộ, VD: /products.">
                <input
                  className="input-field"
                  placeholder="/products"
                  value={link.href}
                  onChange={(e) => {
                    const navLinks = [...settings.navLinks];
                    navLinks[i] = { ...link, href: e.target.value };
                    setSettings({ ...settings, navLinks });
                  }}
                />
              </Field>              <button
                type="button"
                className={`rounded-pill px-3 text-xs ${
                  link.enabled ? 'bg-ink text-on-primary' : 'bg-shade-30'
                }`}
                onClick={() => {
                  const navLinks = [...settings.navLinks];
                  navLinks[i] = { ...link, enabled: !link.enabled };
                  setSettings({ ...settings, navLinks });
                }}
              >
                {link.enabled ? 'Bật' : 'Tắt'}
              </button>
              <button
                type="button"
                className="text-xs underline"
                onClick={() => {
                  setSettings({
                    ...settings,
                    navLinks: settings.navLinks.filter((_, idx) => idx !== i),
                  });
                }}
              >
                Xoá
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-outline-light"
            onClick={() =>
              setSettings({
                ...settings,
                navLinks: [
                  ...settings.navLinks,
                  { label: emptyLocalized('Link mới', 'New link'), href: '/products', enabled: true },
                ],
              })
            }
          >
            + Thêm link
          </button>
          <button
            type="button"
            className="btn-primary ml-3"
            disabled={saving}
            onClick={() => void persist(settings)}
          >
            Lưu menu
          </button>
        </div>
      )}

      {tab === 'footer' && (
        <div className="mt-8 max-w-2xl space-y-4 rounded-xl border border-hairline-light bg-canvas-light p-6">
          <AdminLangTabs value={contentLang} onChange={setContentLang} />
          <Field
            label="Mô tả footer"
            hint="Đoạn giới thiệu ngắn cột trái / khối about footer."
          >
            <textarea
              className="input-field min-h-[80px]"
              value={localeField(settings.footerAbout, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.footerAbout);
                setSettings({
                  ...settings,
                  footerAbout: { ...cur, [contentLang]: e.target.value },
                });
              }}
            />
          </Field>
          <Field
            label="Ghi chú cuối trang"
            hint="Dòng copyright / ghi chú nhỏ dưới cùng footer."
          >
            <input
              className="input-field"
              value={localeField(settings.footerNote, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.footerNote);
                setSettings({
                  ...settings,
                  footerNote: { ...cur, [contentLang]: e.target.value },
                });
              }}
            />
          </Field>
          {settings.footerColumns.map((col, ci) => (
            <div
              key={ci}
              className="space-y-2 rounded-lg border border-hairline-light p-4"
            >
              <Field
                label="Tiêu đề cột footer"
                hint="Heading cột liên kết ở chân trang."
              >
                <input
                  className="input-field"
                  value={localeField(col.title, contentLang)}
                  onChange={(e) => {
                    const footerColumns = [...settings.footerColumns];
                    const cur = toLocalizedRaw(col.title);
                    footerColumns[ci] = {
                      ...col,
                      title: { ...cur, [contentLang]: e.target.value },
                    };
                    setSettings({ ...settings, footerColumns });
                  }}
                />
              </Field>
              <Field
                label="Link cột (mỗi dòng: Nhãn|đường dẫn)"
                hint="VD: Menu|/products — hiện danh sách link trong cột footer."
              >
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Menu|/products"
                  value={col.links
                    .map(
                      (l) =>
                        `${localeField(l.label, contentLang)}|${l.href}`
                    )
                    .join('\n')}
                  onChange={(e) => {
                    const links = e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, idx) => {
                        const [label, href] = line.split('|');
                        const cur = toLocalizedRaw(col.links[idx]?.label);
                        return {
                          label: {
                            ...cur,
                            [contentLang]: (label || '').trim(),
                          },
                          href: (href || '/').trim(),
                        };
                      });
                    const footerColumns = [...settings.footerColumns];
                    footerColumns[ci] = { ...col, links };
                    setSettings({ ...settings, footerColumns });
                  }}
                />
              </Field>
            </div>
          ))}
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() => void persist(settings)}
          >
            Lưu footer
          </button>
        </div>
      )}

      {tab === 'ai' && (
        <div className="mt-8 max-w-xl space-y-6">
          <div className="rounded-xl border border-hairline-light bg-canvas-light p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-heading-xl">Chatbot trên cửa hàng</p>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-shade-50">
                  {settings.aiWidget.enabled
                    ? 'Nút chat đang hiện góc phải màn hình với khách (trừ trang admin).'
                    : 'Nút chat đang ẩn trên toàn bộ cửa hàng.'}
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void persist({
                    ...settings,
                    aiWidget: {
                      ...settings.aiWidget,
                      enabled: !settings.aiWidget.enabled,
                    },
                  })
                }
                className={`rounded-pill px-4 py-2 text-sm font-medium ${
                  settings.aiWidget.enabled
                    ? 'bg-ink text-on-primary'
                    : 'bg-shade-30 text-shade-60'
                }`}
              >
                {settings.aiWidget.enabled ? 'Đang hiện' : 'Đang ẩn'}
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-hairline-light bg-canvas-light p-6">
          <AdminLangTabs value={contentLang} onChange={setContentLang} />
          <Field
            label="Tiêu đề"
            hint="Chữ lớn trên đầu hộp chat AI."
          >
            <input
              className="input-field"
              value={localeField(settings.aiWidget.title, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.aiWidget.title);
                setSettings({
                  ...settings,
                  aiWidget: {
                    ...settings.aiWidget,
                    title: { ...cur, [contentLang]: e.target.value },
                  },
                });
              }}
            />
          </Field>
          <Field
            label="Phụ đề"
            hint="Dòng nhỏ dưới tiêu đề trong hộp chat."
          >
            <input
              className="input-field"
              value={localeField(settings.aiWidget.subtitle, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.aiWidget.subtitle);
                setSettings({
                  ...settings,
                  aiWidget: {
                    ...settings.aiWidget,
                    subtitle: { ...cur, [contentLang]: e.target.value },
                  },
                });
              }}
            />
          </Field>
          <Field
            label="Nút mở chat"
            hint="Chữ trên nút nổi góc phải trước khi mở hộp thoại."
          >
            <input
              className="input-field"
              value={localeField(settings.aiWidget.buttonLabel, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.aiWidget.buttonLabel);
                setSettings({
                  ...settings,
                  aiWidget: {
                    ...settings.aiWidget,
                    buttonLabel: { ...cur, [contentLang]: e.target.value },
                  },
                });
              }}
            />
          </Field>
          <Field
            label="Tin nhắn chào"
            hint="Tin nhắn AI gửi trước khi khách chat — hiện trong khung hội thoại."
          >
            <textarea
              className="input-field min-h-[100px]"
              value={localeField(settings.aiWidget.welcomeMessage, contentLang)}
              onChange={(e) => {
                const cur = toLocalizedRaw(settings.aiWidget.welcomeMessage);
                setSettings({
                  ...settings,
                  aiWidget: {
                    ...settings.aiWidget,
                    welcomeMessage: { ...cur, [contentLang]: e.target.value },
                  },
                });
              }}
            />
          </Field>
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() => void persist(settings)}
          >
            Lưu nội dung chatbot
          </button>
          </div>
        </div>
      )}
    </div>
  );
}

