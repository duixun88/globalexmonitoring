import React from 'react';
import { ExchangeStatus } from '../../types/exchange';
import { formatCountdown, formatGMT } from '../../utils/timeUtils';
import { Flag } from '../Flag';

interface ExchangeCardProps {
  status: ExchangeStatus;
  onClick: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

const STATUS_STYLES = {
  open: {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    border: 'border-emerald-500/20 hover:border-emerald-400/40',
    dot: 'bg-emerald-400 animate-pulse',
    label: 'OPEN',
  },
  lunch: {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    border: 'border-amber-500/20 hover:border-amber-400/40',
    dot: 'bg-amber-400',
    label: 'LUNCH',
  },
  closed: {
    badge: 'bg-gray-700/40 text-gray-500 border border-gray-700',
    border: 'border-gray-700/40 hover:border-gray-600',
    dot: 'bg-gray-600',
    label: 'CLOSED',
  },
  holiday: {
    badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    border: 'border-rose-500/25 hover:border-rose-400/45',
    dot: 'bg-rose-400',
    label: 'HOLIDAY',
  },
};

const NEXT_EVENT_LABEL = {
  open: '개장까지',
  close: '폐장까지',
  lunch_end: '점심 재개',
};

export function ExchangeCard({ status, onClick, isPinned, onTogglePin }: ExchangeCardProps) {
  const {
    exchange,
    status: mktStatus,
    localTimeStr,
    kstOpenStr,
    kstCloseStr,
    localOpenStr,
    localCloseStr,
    gmtOffsetNow,
    isDST,
    secondsToNext,
    nextEvent,
    holiday,
    isEarlyClose,
    isTradingDay,
  } = status;

  const style = STATUS_STYLES[mktStatus];
  const hasPhases = exchange.tradingPhases && exchange.tradingPhases.length > 0;

  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 rounded-lg p-3 border ${style.border} transition-all cursor-pointer hover:shadow-lg hover:scale-[1.01]`}
      title={hasPhases ? `${exchange.nameKr} 세부 세션 보기` : undefined}
    >
      {/* Top row: flag + name + status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {onTogglePin && (
            <button
              onClick={e => { e.stopPropagation(); onTogglePin(); }}
              title={isPinned ? '관심 해제' : '관심 고정'}
              className={`text-xs leading-none shrink-0 ${isPinned ? 'text-sky-400' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {isPinned ? '★' : '☆'}
            </button>
          )}
          <Flag cc={exchange.cc} className="w-6 h-4" />
          <div>
            <div className="text-xs font-bold text-gray-100 uppercase tracking-wide">
              {exchange.id}
              {hasPhases && (
                <span className="ml-1 text-[8px] text-gray-600">ⓘ</span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 leading-none">{exchange.nameKr}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.badge} flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
          {isDST && (
            <span className="text-[9px] font-bold text-sky-400 bg-sky-400/10 px-1 rounded">DST</span>
          )}
          {isEarlyClose && mktStatus !== 'holiday' && (
            <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1 rounded" title={holiday?.name}>반장</span>
          )}
          {!isTradingDay && mktStatus !== 'holiday' && (
            <span className="text-[9px] font-bold text-gray-400 bg-gray-500/15 px-1 rounded">주말</span>
          )}
        </div>
      </div>

      {/* Times */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500">KST</span>
          <span className="text-[11px] font-mono text-gray-200 tabular-nums">
            {kstOpenStr} – {kstCloseStr}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500">현지</span>
          <span className="text-[11px] font-mono text-gray-400 tabular-nums">
            {localOpenStr} – {localCloseStr}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500">현재</span>
          <span className="text-[11px] font-mono text-sky-400 tabular-nums">
            {localTimeStr}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-2" />

      {/* Countdown + GMT (or holiday note) */}
      <div className="flex justify-between items-center">
        {mktStatus === 'holiday' && holiday ? (
          <div className="min-w-0">
            <div className="text-[9px] text-rose-400/70">오늘 휴장</div>
            <div className="text-[11px] font-semibold text-rose-300 truncate" title={holiday.name}>
              {holiday.name}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[9px] text-gray-600">
              {NEXT_EVENT_LABEL[nextEvent]}
              {isEarlyClose && <span className="ml-1 text-amber-400">· 반장</span>}
            </div>
            <div className={`text-sm font-bold font-mono tabular-nums ${
              mktStatus === 'open' ? 'text-gray-300' : 'text-emerald-400'
            }`}>
              {formatCountdown(secondsToNext)}
            </div>
          </div>
        )}
        <div className="text-right">
          <div className="text-[9px] text-gray-600">오프셋</div>
          <div className="text-[10px] font-mono text-gray-500">
            {formatGMT(gmtOffsetNow)}
          </div>
        </div>
      </div>
    </div>
  );
}
