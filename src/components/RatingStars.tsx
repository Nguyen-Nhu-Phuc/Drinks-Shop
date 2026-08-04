'use client';

interface Props {
  rating: number;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export default function RatingStars({
  rating,
  size = 'md',
  interactive = false,
  onChange,
}: Props) {
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <span className={`inline-flex gap-0.5 ${textSize}`} aria-label={`${rating} sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`${
            star <= Math.round(rating) ? 'text-ink' : 'text-shade-30'
          } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
