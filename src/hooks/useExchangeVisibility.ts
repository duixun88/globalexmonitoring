import { useState, useCallback } from 'react';

const KEY = 'gem-hidden';

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function persist(s: Set<string>) {
  try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* ignore */ }
}

/** Which exchanges are hidden from the monitor (timeline / cards / summary). */
export function useExchangeVisibility() {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(load()));

  const toggle = useCallback((id: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persist(next);
      return next;
    });
  }, []);

  const showAll = useCallback(() => { const s = new Set<string>(); persist(s); setHidden(s); }, []);
  const setAllHidden = useCallback((ids: string[]) => { const s = new Set(ids); persist(s); setHidden(s); }, []);

  return { hidden, toggle, showAll, setAllHidden };
}
