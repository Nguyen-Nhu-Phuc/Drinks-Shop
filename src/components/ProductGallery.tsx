'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [];

  useEffect(() => {
    setActive(0);
  }, [images]);

  if (list.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-canvas-night">
        <div className="relative aspect-square">
          <Image
            src={list[active]}
            alt={`${name} ${active + 1}`}
            fill
            className="object-contain animate-fade-in"
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-canvas-night ${
                i === active ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" fill className="object-contain" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
