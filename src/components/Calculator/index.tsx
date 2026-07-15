import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Exchange, ExchangeStatus } from '../../types/exchange';
import { formatGMT } from '../../utils/timeUtils';
import { Flag } from '../Flag';

interface CalculatorProps {
  exchanges: Exchange[];
  statuses: ExchangeStatus[];
  tick: number;
}

// ── Utility ──────────────────────────────────────────────────────────

function hhmmToMin(hhmm: string): number {
  const clean = hhmm.replace('+1', '').trim();
  const [h, m] = clean.split(':').map(Number);
  return h * 60 + m;
}

function minToHHMM(min: number): string {
  const w = ((min % 1440) + 1440) % 1440;
  return `${Math.floor(w / 60).toString().padStart(2, '0')}:${(w % 60).toString().padStart(2, '0')}`;
}

function getCurrentKSTMinutes(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0');
  const m = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0');
  return (h === 24 ? 0 : h) * 60 + m;
}

function getCurrentKSTSeconds(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => {
    const v = parseInt(parts.find(p => p.type === t)?.value ?? '0');
    return t === 'hour' && v === 24 ? 0 : v;
  };
  return get('hour') * 3600 + get('minute') * 60 + get('second');
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

// Returns remaining seconds until a given KST time (handles cross-midnight).
function remainingSecondsTo(deadlineKSTMin: number): number {
  const nowSec = getCurrentKSTSeconds();
  const deadlineSec = deadlineKSTMin * 60;
  let diff = deadlineSec - nowSec;
  if (diff < 0) diff += 86400;
  return diff;
}

// KST time → local exchange time string
function kstToLocalStr(kstMin: number, gmtOffsetHours: number): string {
  return minToHHMM(kstMin - 9 * 60 + gmtOffsetHours * 60);
}

// ── Event option definition ───────────────────────────────────────────

interface EventOption {
  label: string;
  kstMin: number;  // deadline KST minute (0–1439)
}

function buildEventOptions(exchange: Exchange, status: ExchangeStatus): EventOption[] {
  const opts: EventOption[] = [];

  // Primary open/close from exchange status
  const openMin = hhmmToMin(status.kstOpenStr);
  const closeMin = hhmmToMin(status.kstCloseStr.replace('+1', ''));

  opts.push({ label: '정규장 개장', kstMin: openMin });
  opts.push({ label: '정규장 마감', kstMin: closeMin });

  // Phases: deduplicate by type+end
  if (exchange.tradingPhases) {
    const seen = new Set<string>();
    exchange.tradingPhases.forEach(phase => {
      const key = `${phase.type}:${phase.endKST}`;
      if (seen.has(key)) return;
      seen.add(key);

      const endMin = hhmmToMin(phase.endKST);
      let label = '';
      switch (phase.type) {
        case 'preopening':      label = `${phase.nameKr} 종료 (${phase.endKST} KST)`; break;
        case 'opening_auction': label = `${phase.nameKr} 종료 (${phase.endKST} KST)`; break;
        case 'continuous':      label = `${phase.nameKr} 마감 (${phase.endKST} KST)`; break;
        case 'lunch':           label = `${phase.nameKr} 종료 (${phase.endKST} KST)`; break;
        case 'closing_auction': label = `${phase.nameKr} (${phase.endKST} KST)`; break;
        case 'trade_at_close':  label = `${phase.nameKr} (${phase.endKST} KST)`; break;
        case 'after_hours':     label = `${phase.nameKr} 종료 (${phase.endKST} KST)`; break;
        default:                label = `${phase.nameKr} (${phase.endKST} KST)`;
      }
      if (!opts.find(o => o.kstMin === endMin)) {
        opts.push({ label, kstMin: endMin });
      }
    });
  }

  return opts;
}

// ── Quick Preset definition ───────────────────────────────────────────

interface Preset {
  label: string;
  exchangeId: string;
  kstMin: number;
  offsetMin: number;
  color: string;
}

const PRESETS: Preset[] = [
  { label: '🇺🇸 US 정규장 마감',     exchangeId: 'nyse',   kstMin: 300,  offsetMin: 0,   color: 'bg-blue-800/50 hover:bg-blue-700/50 text-blue-300' },
  { label: '🇬🇧 런던 장 종료',        exchangeId: 'lse',    kstMin: 30,   offsetMin: 0,   color: 'bg-purple-800/50 hover:bg-purple-700/50 text-purple-300' },
  { label: '🇮🇳 인도 장마감 -30분',   exchangeId: 'bse',    kstMin: 1140, offsetMin: -30, color: 'bg-orange-800/50 hover:bg-orange-700/50 text-orange-300' },
  { label: '🇰🇷 한국 정규장 마감',    exchangeId: 'krx',    kstMin: 920,  offsetMin: 0,   color: 'bg-emerald-800/50 hover:bg-emerald-700/50 text-emerald-300' },
  { label: '🇯🇵 도쿄 오전장 마감',    exchangeId: 'tse',    kstMin: 690,  offsetMin: 0,   color: 'bg-rose-800/50 hover:bg-rose-700/50 text-rose-300' },
  { label: '🇭🇰 홍콩 오전장 마감',    exchangeId: 'hkex',   kstMin: 780,  offsetMin: 0,   color: 'bg-amber-800/50 hover:bg-amber-700/50 text-amber-300' },
];

// ── World Clock row ───────────────────────────────────────────────────

function WorldClockRow({ status }: { status: ExchangeStatus }) {
  const { exchange, localTimeStr, status: mktStatus } = status;
  const dotColor = mktStatus === 'open' ? 'bg-emerald-400 animate-pulse' :
    mktStatus === 'lunch' ? 'bg-amber-400' :
    mktStatus === 'holiday' ? 'bg-rose-400' : 'bg-gray-600';
  const statusText = mktStatus === 'open' ? 'OPEN' :
    mktStatus === 'lunch' ? 'LUNCH' :
    mktStatus === 'holiday' ? 'HOLIDAY' : 'CLOSED';
  const statusColor = mktStatus === 'open' ? 'text-emerald-400' :
    mktStatus === 'lunch' ? 'text-amber-400' :
    mktStatus === 'holiday' ? 'text-rose-400' : 'text-gray-500';

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
      <div className="flex items-center gap-2 w-40 shrink-0">
        <Flag cc={exchange.cc} className="w-5 h-3.5" />
        <div>
          <div className="text-[11px] font-bold text-gray-200 uppercase">{exchange.id}</div>
          <div className="text-[9px] text-gray-600">{exchange.country}</div>
        </div>
      </div>
      <div className={`text-[10px] font-bold w-14 shrink-0 flex items-center gap-1 ${statusColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {statusText}
      </div>
      <div className="text-[11px] font-mono text-sky-400 tabular-nums">{localTimeStr}</div>
      <div className="text-[10px] font-mono text-gray-600 w-16 text-right">
        {formatGMT(status.gmtOffsetNow)}
      </div>
    </div>
  );
}

// ── Main Calculator component ─────────────────────────────────────────

export function Calculator({ exchanges, statuses, tick }: CalculatorProps) {
  const [selectedId, setSelectedId] = useState<string>('nyse');
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(1); // index into eventOptions
  const [offsetMin, setOffsetMin] = useState<number>(0);
  const [customKST, setCustomKST] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);

  const selectedStatus = useMemo(
    () => statuses.find(s => s.exchange.id === selectedId),
    [statuses, selectedId],
  );
  const selectedExchange = useMemo(
    () => exchanges.find(e => e.id === selectedId),
    [exchanges, selectedId],
  );

  const eventOptions = useMemo(() => {
    if (!selectedExchange || !selectedStatus) return [];
    return buildEventOptions(selectedExchange, selectedStatus);
  }, [selectedExchange, selectedStatus]);

  // Reset event selector when market changes (skip on mount)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    setSelectedEventIdx(1);
    setUseCustom(false);
  }, [selectedId]);

  // Deadline calculation
  const deadlineKSTMin = useMemo(() => {
    if (useCustom && customKST.match(/^\d{2}:\d{2}$/)) {
      return hhmmToMin(customKST);
    }
    const evt = eventOptions[selectedEventIdx];
    if (!evt) return null;
    return ((evt.kstMin + offsetMin) % 1440 + 1440) % 1440;
  }, [eventOptions, selectedEventIdx, offsetMin, useCustom, customKST]);

  const [remainingSec, setRemainingSec] = useState(0);
  useEffect(() => {
    if (deadlineKSTMin === null) return;
    setRemainingSec(remainingSecondsTo(deadlineKSTMin));
  }, [tick, deadlineKSTMin]);

  const localTime = useMemo(() => {
    if (deadlineKSTMin === null || !selectedStatus) return '';
    return kstToLocalStr(deadlineKSTMin, selectedStatus.gmtOffsetNow);
  }, [deadlineKSTMin, selectedStatus]);

  function applyPreset(preset: Preset) {
    setSelectedId(preset.exchangeId);
    setUseCustom(false);
    setOffsetMin(preset.offsetMin);
    // Set deadline via custom KST to avoid eventOptions index issues
    const adjusted = ((preset.kstMin + preset.offsetMin) % 1440 + 1440) % 1440;
    setCustomKST(minToHHMM(adjusted));
    setUseCustom(true);
  }

  const urgencyColor =
    remainingSec < 300 ? 'text-red-400' :
    remainingSec < 1800 ? 'text-amber-400' :
    'text-emerald-400';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ── Left: Calculator ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
            마감시간 계산기
          </h2>

          {/* Quick presets */}
          <div className="mb-4">
            <div className="text-[9px] text-gray-600 mb-1.5">빠른 선택</div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => applyPreset(p)}
                  className={`text-[10px] font-medium px-2 py-1.5 rounded-lg transition-colors text-left ${p.color}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            {/* Market selector */}
            <div>
              <label className="text-[9px] text-gray-500 block mb-1">마켓</label>
              <select
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setUseCustom(false); }}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              >
                {exchanges.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.flag} {ex.nameKr} ({ex.id.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setUseCustom(false)}
                className={`text-[10px] px-3 py-1 rounded-lg transition-colors ${!useCustom ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                세션 선택
              </button>
              <button
                onClick={() => setUseCustom(true)}
                className={`text-[10px] px-3 py-1 rounded-lg transition-colors ${useCustom ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                KST 직접 입력
              </button>
            </div>

            {/* Event selector or custom input */}
            {!useCustom ? (
              <div>
                <label className="text-[9px] text-gray-500 block mb-1">이벤트</label>
                <select
                  value={selectedEventIdx}
                  onChange={e => setSelectedEventIdx(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                >
                  {eventOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[9px] text-gray-500 block mb-1">마감 KST 시간 (HH:MM)</label>
                <input
                  type="time"
                  value={customKST}
                  onChange={e => setCustomKST(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            )}

            {/* Offset */}
            <div>
              <label className="text-[9px] text-gray-500 block mb-1">
                오프셋 (분) — 음수 = 마감 N분 전
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffsetMin(o => o - 5)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
                >
                  −5
                </button>
                <input
                  type="number"
                  value={offsetMin}
                  onChange={e => setOffsetMin(Number(e.target.value))}
                  className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 text-center font-mono focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => setOffsetMin(o => o + 5)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
                >
                  +5
                </button>
                <button
                  onClick={() => setOffsetMin(0)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-500 rounded-lg px-2 py-1.5 text-xs transition-colors"
                >
                  0
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result panel */}
        {deadlineKSTMin !== null && selectedExchange && selectedStatus && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-3">결과</div>

            {/* Countdown — big */}
            <div className="text-center mb-4">
              <div className="text-[10px] text-gray-500 mb-1">
                {offsetMin < 0 ? `마감 ${Math.abs(offsetMin)}분 전까지` :
                 offsetMin > 0 ? `마감 ${offsetMin}분 후까지` : '마감까지'} 남은 시간
              </div>
              <div className={`text-4xl font-bold font-mono tabular-nums ${urgencyColor}`}>
                {formatCountdown(remainingSec)}
              </div>
            </div>

            {/* Time details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-[9px] text-gray-500 mb-0.5">마감 KST</div>
                <div className="text-lg font-bold font-mono text-gray-100 tabular-nums">
                  {minToHHMM(deadlineKSTMin)}
                </div>
                <div className="text-[9px] text-gray-600">KST (UTC+9)</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-[9px] text-gray-500 mb-0.5">마감 현지시간</div>
                <div className="text-lg font-bold font-mono text-sky-300 tabular-nums">
                  {localTime}
                </div>
                <div className="text-[9px] text-gray-600">
                  {selectedExchange.flag} {formatGMT(selectedStatus.gmtOffsetNow)}
                </div>
              </div>
            </div>

            {/* TWAP hint */}
            {remainingSec > 0 && (
              <div className="mt-3 bg-amber-900/20 border border-amber-700/30 rounded-lg p-2.5 text-[10px] text-amber-300">
                <span className="font-bold">TWAP 참고:</span>{' '}
                {remainingSec < 3600
                  ? `${Math.floor(remainingSec / 60)}분 내 주문 완료 권장`
                  : `마감 ${Math.floor(remainingSec / 3600)}h ${Math.floor((remainingSec % 3600) / 60)}m 전부터 분할 집행 가능`}
              </div>
            )}
          </div>
        )}

        {/* Current KST */}
        <div className="text-[10px] text-gray-700 text-center font-mono">
          현재 KST: {minToHHMM(getCurrentKSTMinutes())} (1초 자동 업데이트)
        </div>
      </div>

      {/* ── Right: World Clock ───────────────────────────────────── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
          글로벌 마켓 현재시간
        </h2>

        {/* Asia */}
        <div className="mb-3">
          <div className="text-[9px] font-bold text-sky-500 uppercase tracking-widest mb-1">
            Asia Pacific
          </div>
          <div className="space-y-0">
            {statuses
              .filter(s => s.exchange.region === 'asia')
              .map(s => <WorldClockRow key={s.exchange.id} status={s} />)}
          </div>
        </div>

        {/* Europe */}
        <div className="mb-3">
          <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-1">
            Europe
          </div>
          <div className="space-y-0">
            {statuses
              .filter(s => s.exchange.region === 'europe')
              .map(s => <WorldClockRow key={s.exchange.id} status={s} />)}
          </div>
        </div>

        {/* Americas */}
        <div>
          <div className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">
            Americas
          </div>
          <div className="space-y-0">
            {statuses
              .filter(s => s.exchange.region === 'americas')
              .map(s => <WorldClockRow key={s.exchange.id} status={s} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
