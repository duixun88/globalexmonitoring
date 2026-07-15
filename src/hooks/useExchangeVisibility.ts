import { useState, useCallback } from 'react';

const KEY = 'gem-hidden';

// 첫 방문 시 기본 숨김(사용자가 한 번이라도 변경하면 개인 설정이 우선).
const DEFAULT_HIDDEN = [
  'set', 'pse', 'kse', 'dfm', 'qse', 'bist', 'tad',
  'bcs', 'bvc', 'six', 'ise', 'wbag', 'bux', 'gpw', 'ase',
];

function load(): string[] {
  try {
    const v = localStorage.getItem(KEY);
    if (v === null) return DEFAULT_HIDDEN; // 저장값 없음 = 첫 방문 → 기본 숨김
    return JSON.parse(v);
  } catch { return DEFAULT_HIDDEN; }
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
