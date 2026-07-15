import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { exchanges as staticExchanges } from '../data/exchanges';
import { exchangePhases } from '../data/exchangePhases';
import { Exchange, Region } from '../types/exchange';

const CACHE_KEY = 'gem-exchanges-cache';

function parseTradingDays(v: any): number[] {
  if (!v) return [1, 2, 3, 4, 5];
  const arr = String(v).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0 && n <= 6);
  return arr.length ? arr : [1, 2, 3, 4, 5];
}

function rowToExchange(r: any): Exchange {
  return {
    id: r.id,
    name: r.name ?? r.id,
    nameKr: r.name_kr ?? r.id,
    country: r.country ?? '',
    flag: r.flag ?? '',
    cc: r.cc ?? '',
    timezone: r.timezone,
    gmtOffset: Number(r.gmt_offset),
    openTime: r.open_time,
    closeTime: r.close_time,
    lunchBreak: r.lunch_start && r.lunch_end ? { start: r.lunch_start, end: r.lunch_end } : undefined,
    region: r.region as Region,
    currency: r.currency ?? '',
    tradingDays: parseTradingDays(r.trading_days),
    tradingPhases: exchangePhases[r.id], // detailed sessions stay bundled, merged by id
  };
}

/**
 * Exchanges loaded from Supabase (editable / extensible), with the bundled
 * static list as the fallback and a localStorage cache for instant paint.
 */
export function useExchanges() {
  const [exchanges, setExchanges] = useState<Exchange[]>(() => {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) {
        const rows = JSON.parse(c);
        if (Array.isArray(rows) && rows.length) return rows.map(rowToExchange);
      }
    } catch { /* ignore */ }
    return staticExchanges;
  });
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (!supabase) { setReady(true); return; }
    (async () => {
      const { data, error } = await supabase
        .from('exchanges')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length) {
        setExchanges(data.map(rowToExchange));
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
      }
      setReady(true);
    })();
  }, []);

  return { exchanges, ready };
}
