import { useMemo } from 'react';
import { Exchange, ExchangeStatus, Holiday } from '../types/exchange';
import { computeExchangeStatus } from '../utils/timeUtils';

export function useExchangeStatuses(
  exchanges: Exchange[],
  tick: number, // from useClock — triggers recalc every second
  getHoliday?: (ex: Exchange) => Holiday | null,
): ExchangeStatus[] {
  return useMemo(
    () => exchanges.map(ex => computeExchangeStatus(ex, getHoliday?.(ex) ?? null)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exchanges, tick, getHoliday],
  );
}
