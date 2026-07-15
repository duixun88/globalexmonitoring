import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface HolidayRow {
  date: string;         // YYYY-MM-DD (exchange-local)
  event: string;
  settle: string;       // 'Yes' | 'No'
  trading: string;      // 'Full' | 'Partial' | 'No'
  iso: string;          // country alpha-2
  countryName: string;
  calendarName: string;
  region: string;       // Asia | Europe | Americas | Middle East | Africa
  displayName: string;  // resolved label (US 통합 / CN 본토·Stock Connect 구분)
}

/**
 * Hardcoded exceptions for display/dedup:
 * - US: NYSE/NASDAQ/US Exchanges 는 휴일 동일 → 'United States' 1건으로 통합.
 * - CN: 'Hong Kong Connect (Northbound)' → 'China (Stock Connect)',
 *       그 외(상하이/선전) → 'China (본토)' 1건으로 통합.
 */
function classifyRow(r: any): { displayName: string; dedupKey: string } {
  const iso = String(r.iso || '').toUpperCase();
  const cname = r.calendar_name || '';
  const { date, event, trading, settle } = r;
  if (iso === 'US') {
    return { displayName: 'United States', dedupKey: `${date}|US|${trading}|${settle}` };
  }
  if (iso === 'CN') {
    if (cname.includes('Hong Kong Connect (Northbound)')) {
      return { displayName: 'China (Stock Connect)', dedupKey: `${date}|CN-connect|${event}|${trading}|${settle}` };
    }
    return { displayName: 'China (본토)', dedupKey: `${date}|CN-mainland|${trading}|${settle}` };
  }
  const cn = String(r.country_name || '').trim() || iso;
  return { displayName: cn, dedupKey: `${date}|${iso}|${event}|${trading}|${settle}` };
}

/** Loads holiday_calendar rows for a date range (+ optional region). */
export function useHolidayCalendar(startDate: string, endDate: string, region: string) {
  const [rows, setRows] = useState<HolidayRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) { setRows([]); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      let q = supabase
        .from('holiday_calendar')
        .select('date, event, settle, trading, iso, country_name, calendar_name, region')
        .eq('type', 'Exchange')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      if (region !== 'all') q = q.eq('region', region);
      const { data, error } = await q.limit(3000);
      if (cancelled) return;
      if (error || !data) { setRows([]); setLoading(false); return; }
      const seen = new Set<string>();
      const deduped: HolidayRow[] = [];
      for (const r of data as any[]) {
        const { displayName, dedupKey } = classifyRow(r);
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);
        deduped.push({
          date: r.date,
          event: r.event ?? '',
          settle: r.settle ?? '',
          trading: r.trading ?? '',
          iso: r.iso ?? '',
          countryName: r.country_name ?? '',
          calendarName: r.calendar_name ?? '',
          region: r.region ?? '',
          displayName,
        });
      }
      setRows(deduped);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [startDate, endDate, region]);

  return { rows, loading };
}
