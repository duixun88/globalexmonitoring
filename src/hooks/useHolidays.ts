import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Exchange, Holiday, HolidayType } from '../types/exchange';
import { getLocalDateStr } from '../utils/timeUtils';

type Entry = { name: string; type: HolidayType };
type Lookup = Record<string, Record<string, Entry>>; // [ISO][YYYY-MM-DD] -> entry
const CACHE_KEY = 'gem-holcal-cache';

/** trading: 'No' → 종일휴장, 'Partial' → 반장, else (Full 등) → 거래일(휴장 아님). */
function tradingToType(trading: string): HolidayType | null {
  const t = (trading || '').trim().toLowerCase();
  if (t === 'no') return 'full_close';
  if (t === 'partial') return 'early_close';
  return null;
}

function buildLookup(rows: any[]): Lookup {
  const m: Lookup = {};
  for (const r of rows) {
    const type = tradingToType(r.trading);
    if (!type) continue;
    const iso = String(r.iso || '').toUpperCase();
    const date = r.date;
    if (!iso || !date) continue;
    if (!m[iso]) m[iso] = {};
    const existing = m[iso][date];
    // Dedup: full_close wins over early_close for the same ISO+date.
    if (!existing || (existing.type === 'early_close' && type === 'full_close')) {
      m[iso][date] = { name: r.event || '휴장', type };
    }
  }
  return m;
}

/**
 * Exchange holidays sourced from the uploaded `holiday_calendar` table,
 * mapped by country ISO (= exchange.cc). Re-uploading the CSV updates the web.
 * Public read; localStorage-cached for instant paint / offline.
 */
export function useHolidays() {
  const [lookup, setLookup] = useState<Lookup>(() => {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) return JSON.parse(c) as Lookup;
    } catch { /* ignore */ }
    return {};
  });
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (!supabase) { setReady(true); return; }
    (async () => {
      // From ~2 days ago onward: covers every timezone's "today" + upcoming.
      const cutoff = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('holiday_calendar')
        .select('date, iso, event, trading, type')
        .eq('type', 'Exchange')
        .in('trading', ['No', 'Partial'])
        .gte('date', cutoff)
        .limit(3000);
      if (!error && data) {
        const lk = buildLookup(data);
        setLookup(lk);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(lk)); } catch { /* ignore */ }
      }
      setReady(true);
    })();
  }, []);

  const getHoliday = useCallback(
    (ex: Exchange): Holiday | null => {
      const iso = (ex.cc || '').toUpperCase();
      const date = getLocalDateStr(ex.timezone);
      const e = lookup[iso]?.[date];
      if (!e) return null;
      return { exchangeId: ex.id, date, name: e.name, type: e.type };
    },
    [lookup],
  );

  return { getHoliday, ready };
}
