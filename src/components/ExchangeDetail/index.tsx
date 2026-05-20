import React, { useEffect, useCallback } from 'react';
import { Exchange, TradingPhase, PhaseType } from '../../types/exchange';
import { getTZOffsetHours } from '../../utils/timeUtils';

interface ExchangeDetailProps {
  exchange: Exchange;
  onClose: () => void;
}

// ── Phase styling ────────────────────────────────────────────────────

const PHASE_COLORS: Record<PhaseType, { bg: string; text: string; bar: string; dot: string }> = {
  preopening:      { bg: 'bg-slate-800',   text: 'text-slate-300',   bar: 'bg-slate-500',   dot: '⬜' },
  opening_auction: { bg: 'bg-amber-900/40',text: 'text-amber-300',   bar: 'bg-amber-500',   dot: '🟡' },
  continuous:      { bg: 'bg-emerald-900/30', text: 'text-emerald-300', bar: 'bg-emerald-500', dot: '🟢' },
  lunch:           { bg: 'bg-orange-900/30',  text: 'text-orange-300',  bar: 'bg-orange-400',  dot: '🟠' },
  closing_auction: { bg: 'bg-yellow-900/30',  text: 'text-yellow-300',  bar: 'bg-yellow-500',  dot: '🟡' },
  trade_at_close:  { bg: 'bg-teal-900/30',    text: 'text-teal-300',    bar: 'bg-teal-500',    dot: '🔵' },
  after_hours:     { bg: 'bg-indigo-900/30',  text: 'text-indigo-300',  bar: 'bg-indigo-500',  dot: '🔵' },
  block_trade:     { bg: 'bg-purple-900/30',  text: 'text-purple-300',  bar: 'bg-purple-500',  dot: '🟣' },
  negotiated:      { bg: 'bg-pink-900/30',    text: 'text-pink-300',    bar: 'bg-pink-500',    dot: '🟣' },
  odd_lot:         { bg: 'bg-gray-800/50',    text: 'text-gray-400',    bar: 'bg-gray-500',    dot: '⬛' },
  mid_day_auction: { bg: 'bg-cyan-900/30',    text: 'text-cyan-300',    bar: 'bg-cyan-500',    dot: '🔵' },
};

const PHASE_LABEL: Record<PhaseType, string> = {
  preopening:      '프리오픈',
  opening_auction: '시초가 경매',
  continuous:      '정규장',
  lunch:           '점심시간',
  closing_auction: '마감 경매',
  trade_at_close:  '종가 거래',
  after_hours:     '시간외',
  block_trade:     '대량 거래',
  negotiated:      '협의 거래',
  odd_lot:         '단주 거래',
  mid_day_auction: '중간 경매',
};

// ── Utility ──────────────────────────────────────────────────────────

function hhmmToMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function kstToLocalStr(kstHHMM: string, gmtOffsetHours: number): string {
  const kstMin = hhmmToMin(kstHHMM);
  // local = kst - 9*60 + offset*60
  let localMin = kstMin - 9 * 60 + gmtOffsetHours * 60;
  localMin = ((localMin % 1440) + 1440) % 1440;
  const h = Math.floor(localMin / 60).toString().padStart(2, '0');
  const m = (localMin % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function crossesMidnight(startKST: string, endKST: string): boolean {
  return hhmmToMin(endKST) < hhmmToMin(startKST);
}

function phaseSpanMinutes(startKST: string, endKST: string): number {
  const s = hhmmToMin(startKST);
  let e = hhmmToMin(endKST);
  if (e < s) e += 1440;
  return e - s;
}

// ── Mini timeline bar (KST 0–24h) ───────────────────────────────────

function MiniTimeline({ phases, gmtOffsetHours }: { phases: TradingPhase[]; gmtOffsetHours: number }) {
  const totalMin = 1440;

  function pct(min: number) {
    return `${((min / totalMin) * 100).toFixed(3)}%`;
  }

  // Hour tick marks
  const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div className="mt-3 mb-1">
      {/* Bar */}
      <div className="relative h-7 bg-gray-800 rounded overflow-hidden">
        {phases.map((phase, i) => {
          const startMin = hhmmToMin(phase.startKST);
          let endMin = hhmmToMin(phase.endKST);
          const cross = endMin < startMin;
          const color = PHASE_COLORS[phase.type]?.bar ?? 'bg-gray-500';

          if (cross) {
            return (
              <React.Fragment key={i}>
                <div
                  className={`absolute top-0 h-full ${color} opacity-80`}
                  style={{ left: pct(startMin), width: pct(totalMin - startMin) }}
                />
                <div
                  className={`absolute top-0 h-full ${color} opacity-80`}
                  style={{ left: '0%', width: pct(endMin) }}
                />
              </React.Fragment>
            );
          }

          return (
            <div
              key={i}
              className={`absolute top-0 h-full ${color} opacity-80`}
              style={{ left: pct(startMin), width: pct(Math.max(endMin - startMin, 2)) }}
            />
          );
        })}
      </div>
      {/* Hour labels */}
      <div className="relative h-4 mt-0.5">
        {ticks.map(h => (
          <span
            key={h}
            className="absolute text-[9px] text-gray-600 font-mono -translate-x-1/2"
            style={{ left: pct(h * 60) }}
          >
            {h === 24 ? '24' : h.toString().padStart(2, '0')}
          </span>
        ))}
      </div>
      <div className="text-[9px] text-gray-600 text-center">KST 기준 24h 타임라인</div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function ExchangeDetail({ exchange, onClose }: ExchangeDetailProps) {
  const { tradingPhases, btigInfo, timezone } = exchange;
  const gmtOffsetNow = getTZOffsetHours(timezone);
  const gmtLabel = gmtOffsetNow >= 0 ? `GMT+${gmtOffsetNow}` : `GMT${gmtOffsetNow}`;

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{exchange.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-100">{exchange.name}</h2>
                <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded uppercase">
                  {exchange.id}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-0.5">
                {exchange.nameKr} · {exchange.country} · {exchange.currency}
              </div>
              <div className="text-xs text-sky-400 font-mono mt-1">
                {gmtLabel} (실시간 · DST 자동)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors text-xl font-light leading-none p-1"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Mini timeline */}
          {tradingPhases && tradingPhases.length > 0 && (
            <MiniTimeline phases={tradingPhases} gmtOffsetHours={gmtOffsetNow} />
          )}

          {/* Phase legend dots */}
          {tradingPhases && tradingPhases.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Array.from(new Set(tradingPhases.map(p => p.type))).map(type => (
                <span key={type} className="text-[10px] text-gray-400 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-sm inline-block ${PHASE_COLORS[type]?.bar}`} />
                  {PHASE_LABEL[type]}
                </span>
              ))}
            </div>
          )}

          {/* Trading Phases table */}
          {tradingPhases && tradingPhases.length > 0 ? (
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                거래 세션 (Bloomberg · KST 기준)
              </h3>
              <div className="space-y-1">
                {tradingPhases.map((phase, i) => {
                  const style = PHASE_COLORS[phase.type];
                  const cross = crossesMidnight(phase.startKST, phase.endKST);
                  const span = phaseSpanMinutes(phase.startKST, phase.endKST);
                  const localStart = kstToLocalStr(phase.startKST, gmtOffsetNow);
                  const localEnd = kstToLocalStr(phase.endKST, gmtOffsetNow);
                  const localCross = hhmmToMin(localEnd) < hhmmToMin(localStart);

                  return (
                    <div
                      key={i}
                      className={`${style.bg} rounded-lg px-3 py-2 flex items-center justify-between gap-4`}
                    >
                      {/* Left: type label + name */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text} border border-current/20 whitespace-nowrap`}>
                          {PHASE_LABEL[phase.type]}
                        </span>
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold ${style.text} truncate`}>
                            {phase.nameKr}
                          </div>
                          <div className="text-[9px] text-gray-500 truncate">{phase.nameEn}</div>
                        </div>
                      </div>

                      {/* Right: times */}
                      <div className="shrink-0 text-right">
                        {/* KST */}
                        <div className="text-[11px] font-mono text-gray-200 tabular-nums">
                          {phase.startKST} – {phase.endKST}
                          {cross && <span className="text-gray-500 text-[9px]"> +1일</span>}
                          <span className="text-gray-600 text-[9px] ml-1">KST</span>
                        </div>
                        {/* Local */}
                        <div className="text-[10px] font-mono text-gray-500 tabular-nums">
                          {localStart} – {localEnd}
                          {localCross && <span className="text-gray-600 text-[9px]"> +1일</span>}
                          <span className="text-gray-600 text-[9px] ml-1">{gmtLabel}</span>
                        </div>
                        {/* Duration */}
                        <div className="text-[9px] text-gray-600">
                          {span >= 60 ? `${Math.floor(span / 60)}h ${span % 60}m` : `${span}m`}
                          {phase.note && <span className="ml-1 text-gray-700">({phase.note})</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 text-sm py-4">세부 세션 데이터 없음</div>
          )}

          {/* BTIG Info */}
          {btigInfo && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                BTIG 브로커 정보
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">결제 주기</div>
                    <div className="text-sm font-bold text-gray-200">{btigInfo.settlement}</div>
                  </div>
                  {btigInfo.minLot && (
                    <div>
                      <div className="text-[9px] text-gray-500 mb-0.5">최소 거래 단위</div>
                      <div className="text-sm font-bold text-gray-200">{btigInfo.minLot.toLocaleString()} 주</div>
                    </div>
                  )}
                </div>

                {/* Order types */}
                <div>
                  <div className="text-[9px] text-gray-500 mb-1">주문 유형</div>
                  <div className="flex flex-wrap gap-1">
                    {btigInfo.orderTypes.map(ot => (
                      <span
                        key={ot}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300"
                      >
                        {ot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Transaction cost */}
                {btigInfo.transactionCost && (
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">거래 비용</div>
                    <div className="text-[11px] text-amber-300">{btigInfo.transactionCost}</div>
                  </div>
                )}

                {/* Notes */}
                {btigInfo.notes && (
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">비고</div>
                    <div className="text-[11px] text-gray-400">{btigInfo.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close hint */}
          <div className="text-center text-[10px] text-gray-700">
            ESC 또는 바깥 영역을 클릭하면 닫힙니다
          </div>
        </div>
      </div>
    </div>
  );
}
