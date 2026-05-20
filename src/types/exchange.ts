export type Region = 'asia' | 'europe' | 'americas';

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
  timezone: string; // IANA timezone
  gmtOffset: number; // base (non-DST)
  openTime: string; // "HH:MM" local time
  closeTime: string;
  lunchBreak?: LunchBreak;
  region: Region;
  currency: string;
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
  localTimeStr: string;    // current local time "HH:MM:SS"
  kstOpenStr: string;      // KST open "HH:MM"
  kstCloseStr: string;     // KST close "HH:MM"
  localOpenStr: string;    // local open "HH:MM"
  localCloseStr: string;   // local close "HH:MM"
  gmtOffsetNow: number;    // real-time offset incl. DST
  isDST: boolean;
  secondsToNext: number;   // seconds until next event
  nextEvent: 'open' | 'close' | 'lunch_end';
  timelineSegments: TimeSegment[];
}
