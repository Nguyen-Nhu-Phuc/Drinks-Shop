'use client';

import { useCallback, useMemo, useState } from 'react';

/** Multi-select checkbox state for admin lists */
export function useSelection<T extends string = string>(allIds: T[]) {
  const [selected, setSelected] = useState<Set<T>>(new Set());

  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const count = selected.size;
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = count > 0 && !allSelected;

  const toggle = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const every = allIds.length > 0 && allIds.every((id) => prev.has(id));
      return every ? new Set() : new Set(allIds);
    });
  }, [allIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback((id: T) => selected.has(id), [selected]);

  return {
    selectedIds,
    count,
    allSelected,
    someSelected,
    toggle,
    toggleAll,
    clear,
    isSelected,
  };
}
