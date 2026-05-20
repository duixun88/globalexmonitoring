import { useMemo } from 'react';
import { Exchange, ExchangeStatus } from '../types/exchange';
import { computeExchangeStatus } from '../utils/timeUtils';

export function useExchangeStatuses(
  exchanges: Exchange[],
  tick: number, // from useClock — triggers recalc every second
): ExchangeStatus[] {
  return useMemo(
    () => exchanges.map(computeExchangeStatus),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exchanges, tick],
  );
}
