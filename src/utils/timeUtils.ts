import { Exchange, ExchangeStatus, MarketStatus, TimeSegment } from '../types/exchange';

// ── Core timezone utilities (Intl-based, DST automatic) ──────────

/** Returns the real UTC offset in minutes for a timezone at this instant (DST included). */
export function getTZOffsetMinutes(timezone: string): number {
  const now = new Date();
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return (local.getTime() - utc.getTime()) / 60000;
}

/** Returns the real UTC offset in hours (may be fractional, e.g. 5.5 for IST). */
export function getTZOffsetHours(timezone: string): number {
  return getTZOffsetMinutes(timezone) / 60;
}

/** "HH:MM" local time → KST minutes (0–1439), wraps across midnight. */
export function localTimeToKSTMinutes(hhmm: string, timezone: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  const localMin = h * 60 + m;
  const offsetMin = getTZOffsetMinutes(timezone);
  const kst = localMin - offsetMin + 9 * 60;
  return ((kst % 1440) + 1440) % 1440;
}

/** KST minutes → "HH:MM" string. Optionally marks +1 day. */
export function kstMinutesToStr(min: number, showNextDay = false): string {
  const wrapped = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60).toString().padStart(2, '0');
  const m = (wrapped % 60).toString().padStart(2, '0');
  const suffix = showNextDay && min >= 1440 ? '+1' : '';
  return `${h}:${m}${suffix}`;
}

/** Current local time string for a given IANA timezone. */
export function getLocalTimeStr(timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

/** Current KST time string. */
export function getKSTTimeStr(): string {
  return getLocalTimeStr('Asia/Seoul');
}

/** Is DST currently active for the given timezone?
 *  Compares current offset to the non-DST (winter) offset. */
export function isDSTActive(timezone: string, baseGmtOffset: number): boolean {
  const current = getTZOffsetMinutes(timezone);
  return current !== baseGmtOffset * 60;
}

// ── Exchange status calculation ───────────────────────────────────

/** Current local time in minutes (0–1439) for a given IANA timezone. */
function getLocalMinutesNow(timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => {
    const v = parseInt(parts.find(p => p.type === type)?.value ?? '0');
    return type === 'hour' && v === 24 ? 0 : v; // midnight edge case
  };
  return get('hour') * 60 + get('minute');
}

function getLocalSecondsNow(timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => {
    const v = parseInt(parts.find(p => p.type === type)?.value ?? '0');
    return type === 'hour' && v === 24 ? 0 : v;
  };
  return get('hour') * 3600 + get('minute') * 60 + get('second');
}

function parseHHMM(hhmm: string): { h: number; m: number; total: number } {
  const [h, m] = hhmm.split(':').map(Number);
  return { h, m, total: h * 60 + m };
}

/** Build KST timeline segments for a single exchange. */
function buildTimelineSegments(exchange: Exchange): TimeSegment[] {
  const { openTime, closeTime, lunchBreak, timezone } = exchange;

  const openKST = localTimeToKSTMinutes(openTime, timezone);
  const closeKST = localTimeToKSTMinutes(closeTime, timezone);

  const segments: TimeSegment[] = [];

  if (!lunchBreak) {
    if (closeKST > openKST) {
      segments.push({ startMin: openKST, endMin: closeKST, type: 'open' });
    } else {
      // crosses midnight in KST
      segments.push({ startMin: openKST, endMin: 1440, type: 'open' });
      segments.push({ startMin: 0, endMin: closeKST, type: 'open' });
    }
  } else {
    const lunchStartKST = localTimeToKSTMinutes(lunchBreak.start, timezone);
    const lunchEndKST = localTimeToKSTMinutes(lunchBreak.end, timezone);

    segments.push({ startMin: openKST, endMin: lunchStartKST, type: 'open' });
    segments.push({ startMin: lunchStartKST, endMin: lunchEndKST, type: 'lunch' });
    segments.push({ startMin: lunchEndKST, endMin: closeKST, type: 'open' });
  }

  return segments;
}

export function computeExchangeStatus(exchange: Exchange): ExchangeStatus {
  const { timezone, openTime, closeTime, lunchBreak, gmtOffset } = exchange;

  const nowLocalMin = getLocalMinutesNow(timezone);
  const nowLocalSec = getLocalSecondsNow(timezone);

  const open = parseHHMM(openTime);
  const close = parseHHMM(closeTime);

  const isInRange = (min: number, startMin: number, endMin: number) =>
    min >= startMin && min < endMin;

  let status: MarketStatus = 'closed';
  let nextEvent: ExchangeStatus['nextEvent'] = 'open';
  let secondsToNext = 0;

  const inMainSession =
    isInRange(nowLocalMin, open.total, close.total);

  if (lunchBreak) {
    const lunch = {
      start: parseHHMM(lunchBreak.start),
      end: parseHHMM(lunchBreak.end),
    };

    if (inMainSession && isInRange(nowLocalMin, lunch.start.total, lunch.end.total)) {
      status = 'lunch';
      nextEvent = 'lunch_end';
      const lunchEndSec = lunch.end.total * 60;
      secondsToNext = lunchEndSec - nowLocalSec;
    } else if (inMainSession) {
      status = 'open';
      if (nowLocalMin < lunch.start.total) {
        nextEvent = 'close';
        // next event is actually lunch start — show until lunch
        const lunchStartSec = lunch.start.total * 60;
        secondsToNext = lunchStartSec - nowLocalSec;
        nextEvent = 'close'; // simplified: show countdown to close only
        secondsToNext = close.total * 60 - nowLocalSec;
      } else {
        nextEvent = 'close';
        secondsToNext = close.total * 60 - nowLocalSec;
      }
    } else {
      status = 'closed';
      nextEvent = 'open';
      if (nowLocalMin < open.total) {
        secondsToNext = open.total * 60 - nowLocalSec;
      } else {
        secondsToNext = (24 * 3600) - nowLocalSec + open.total * 60;
      }
    }
  } else {
    if (inMainSession) {
      status = 'open';
      nextEvent = 'close';
      secondsToNext = close.total * 60 - nowLocalSec;
    } else {
      status = 'closed';
      nextEvent = 'open';
      if (nowLocalMin < open.total) {
        secondsToNext = open.total * 60 - nowLocalSec;
      } else {
        secondsToNext = (24 * 3600) - nowLocalSec + open.total * 60;
      }
    }
  }

  const gmtOffsetNow = getTZOffsetHours(timezone);
  const isDST = isDSTActive(timezone, gmtOffset);

  const openKSTMin = localTimeToKSTMinutes(openTime, timezone);
  const closeKSTMin = localTimeToKSTMinutes(closeTime, timezone);

  // show +1 on closeKSTStr only when close is next day
  const crossesMidnight = closeKSTMin < openKSTMin;

  return {
    exchange,
    status,
    localTimeStr: getLocalTimeStr(timezone),
    kstOpenStr: kstMinutesToStr(openKSTMin),
    kstCloseStr: kstMinutesToStr(closeKSTMin) + (crossesMidnight ? '+1' : ''),
    localOpenStr: openTime,
    localCloseStr: closeTime,
    gmtOffsetNow,
    isDST,
    secondsToNext: Math.max(0, secondsToNext),
    nextEvent,
    timelineSegments: buildTimelineSegments(exchange),
  };
}

/** Format seconds to "Xh Ym" or "Ym Zs". */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

/** Format GMT offset as "+9:00" / "-5:00" / "+5:30". */
export function formatGMT(offset: number): string {
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const h = Math.floor(abs).toString().padStart(2, '0');
  const m = Math.round((abs % 1) * 60).toString().padStart(2, '0');
  return `GMT${sign}${h}:${m}`;
}
