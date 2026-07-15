import { useState, useCallback } from 'react';

const KEY = 'gem-pins';

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

/** Watchlist of pinned exchange ids, persisted to localStorage. */
export function usePins() {
  const [pins, setPins] = useState<Set<string>>(() => new Set(load()));

  const toggle = useCallback((id: string) => {
    setPins(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { pins, toggle };
}
