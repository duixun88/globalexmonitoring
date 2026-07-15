import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ExchangeInfo {
  settlement?: string; // 결제 주기
  taxes?: string;      // 제세금
  notes?: string;      // 비고
}

/**
 * Editable per-exchange info (settlement / taxes / notes).
 * Public read; upsert requires Supabase Auth (editor).
 */
export function useExchangeInfo() {
  const [map, setMap] = useState<Record<string, ExchangeInfo>>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) { setReady(true); return; }
    const { data, error } = await supabase
      .from('exchange_info')
      .select('exchange_id, settlement, taxes, notes');
    if (!error && data) {
      const m: Record<string, ExchangeInfo> = {};
      data.forEach((r: any) => {
        m[r.exchange_id] = {
          settlement: r.settlement ?? undefined,
          taxes: r.taxes ?? undefined,
          notes: r.notes ?? undefined,
        };
      });
      setMap(m);
    }
    setReady(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const getInfo = useCallback((id: string): ExchangeInfo => map[id] ?? {}, [map]);

  const saveInfo = useCallback(
    async (id: string, info: ExchangeInfo) => {
      if (!supabase) return { error: 'Supabase 미설정' };
      const { error } = await supabase.from('exchange_info').upsert({
        exchange_id: id,
        settlement: info.settlement ?? null,
        taxes: info.taxes ?? null,
        notes: info.notes ?? null,
      });
      if (!error) await refresh();
      return { error: error?.message };
    },
    [refresh],
  );

  return { getInfo, saveInfo, ready, refresh };
}
