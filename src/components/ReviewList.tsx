'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useT } from '@/context/LocaleContext';
import type { Review } from '@/types';
import RatingStars from './RatingStars';

interface Props {
  productId: string;
}

export default function ReviewList({ productId }: Props) {
  const t = useT();
  const { user } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await apiClient.get<Review[]>(`/reviews/product/${productId}`);
    setReviews(data);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('reviews.loginRequired'));
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(`/reviews/product/${productId}`, { rating, comment });
      setComment('');
      await load();
      toast.success(t('reviews.sent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('reviews.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-heading-xl">{t('reviews.title')}</h2>

      {user && (
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-hairline-light bg-canvas-light p-6">
          <p className="text-sm text-shade-50">
            {t('reviews.hint')}
          </p>
          <div>
            <p className="mb-2 text-sm text-shade-50">{t('reviews.stars')}</p>
            <RatingStars rating={rating} interactive onChange={setRating} />
          </div>
          <textarea
            className="input-field min-h-[100px]"
            placeholder={t('reviews.placeholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={5}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('reviews.sending') : t('reviews.submit')}
          </button>
        </form>
      )}

      <ul className="space-y-4">
        {reviews.length === 0 && (
          <li className="text-shade-50">{t('reviews.empty')}</li>
        )}
        {reviews.map((r) => (
          <li
            key={r._id}
            className="rounded-lg border border-hairline-light bg-canvas-light p-4"
          >
            <div className="mb-2 flex items-center gap-3">
              <span style={{ fontWeight: 550 }}>
                {typeof r.user === 'object' ? r.user.name : t('common.user')}
              </span>
              <RatingStars rating={r.rating} size="sm" />
            </div>
            <p className="text-base text-shade-60">{r.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
