'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  label?: string;
  /** Khi max=1, upload mới sẽ thay ảnh cũ */
  replace?: boolean;
}

export default function CloudinaryUpload({
  images,
  onChange,
  max = 5,
  label = 'Ảnh (Cloudinary)',
  replace = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const canReplace = replace && max === 1;
    const remaining = canReplace ? 1 : max - images.length;
    if (remaining <= 0) {
      toast.error(`Tối đa ${max} ảnh. Xoá ảnh cũ trước khi thêm.`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    const formData = new FormData();
    selected.forEach((file) => formData.append('images', file));

    setUploading(true);
    try {
      const { data } = await apiClient.post<{ images: string[] }>(
        '/upload',
        formData
      );
      if (canReplace) {
        onChange(data.images.slice(0, 1));
      } else {
        onChange([...images, ...data.images].slice(0, max));
      }
      toast.success(
        data.images.length > 1
          ? `Đã upload ${data.images.length} ảnh`
          : 'Đã upload ảnh'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = async (index: number) => {
    const ok = await confirm({
      title: 'Xoá ảnh này?',
      description: 'Ảnh sẽ bị loại khỏi danh sách. Nhớ nhấn Lưu để áp dụng thay đổi.',
      confirmLabel: 'Xoá ảnh',
      cancelLabel: 'Huỷ',
      variant: 'danger',
    });
    if (!ok) return;
    onChange(images.filter((_, i) => i !== index));
  };

  const isSingle = max === 1;

  return (
    <div className="space-y-3">
      {label ? (
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-shade-50">
          {label}
        </p>
      ) : null}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className={`group relative overflow-hidden rounded-md bg-canvas-night ${
                isSingle ? 'w-full max-w-md' : 'h-24 w-24'
              }`}
            >
              <Image
                src={url}
                alt={`Ảnh ${i + 1}`}
                {...(isSingle
                  ? {
                      width: 800,
                      height: 450,
                      className: 'h-auto w-full',
                      style: { width: '100%', height: 'auto' },
                      sizes: '400px',
                    }
                  : {
                      fill: true,
                      className: 'object-contain',
                      sizes: '96px',
                    })}
              />
              <button
                type="button"
                onClick={() => void removeAt(i)}
                className="absolute right-2 top-2 rounded-pill bg-ink/80 px-2.5 py-1 text-xs text-on-primary opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
              >
                Xoá
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-outline-light !py-2 !px-4 text-sm"
          disabled={uploading || (!replace && images.length >= max)}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? 'Đang upload...'
            : isSingle && images.length > 0
              ? 'Đổi ảnh'
              : 'Chọn ảnh từ máy'}
        </button>
        <span className="text-xs text-shade-50">
          JPG/PNG/WebP · tối đa 5MB · upload Cloudinary · {images.length}/{max}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!isSingle}
        className="hidden"
        onChange={(e) => void upload(e.target.files)}
      />
    </div>
  );
}
