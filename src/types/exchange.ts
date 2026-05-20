export type Region = 'asia' | 'europe' | 'americas';

export type PhaseType =
  | 'preopening'
  | 'opening_auction'
  | 'continuous'
  | 'lunch'
  | 'closing_auction'
  | 'trade_at_close'
  | 'after_hours'
  | 'block_trade'
  | 'negotiated'
  | 'odd_lot'
  | 'mid_day_auction';

export interface TradingPhase {
  type: PhaseType;
  nameEn: string;
  nameKr: string;
  startKST: string; // "HH:MM" KST (Bloomberg-verified)
  endKST: string;   // "HH:MM" KST (may be numerically < startKST for cross-midnight phases)
  note?: string;
}

export interface BTIGInfo {
  settlement: string;    // "T+1", "T+2"
  minLot?: number;
  orderTypes: string[];  // ["CARE","DMA","SOR","VWAP","TWAP","POV","SNIPER"]
  transactionCost?: string;
  notes?: string;
}

export interface LunchBreak {
  start: string; // "HH:MM" local time
  end: string;
}

export interface Exchange {
  id: string;
  name: string;
  nameKr: string;
  country: string;
  flag: string;
  timezone: string;   // IANA timezone
  gmtOffset: number;  // base (non-DST) UTC offset in hours
  openTime: string;   // "HH:MM" local time
  closeTime: string;
  lunchBreak?: LunchBreak;
  region: Region;
  currency: string;
  tradingPhases?: TradingPhase[];
  btigInfo?: BTIGInfo;
}

export type MarketStatus = 'open' | 'lunch' | 'closed';

export interface TimeSegment {
  startMin: number; // 0–1439 KST minutes
  endMin: number;
  type: 'open' | 'lunch';
}

export interface ExchangeStatus {
  exchange: Exchange;
  status: MarketStatus;
  localTimeStr: string;   // current local time "HH:MM:SS"
  kstOpenStr: string;     // KST open "HH:MM"
  kstCloseStr: string;    // KST close "HH:MM" (may include "+1")
  localOpenStr: string;   // local open "HH:MM"
  localCloseStr: string;  // local close "HH:MM"
  gmtOffsetNow: number;   // real-time offset incl. DST
  isDST: boolean;
  secondsToNext: number;  // seconds until next event
  nextEvent: 'open' | 'close' | 'lunch_end';
  timelineSegments: TimeSegment[];
}
