import React from 'react';
import { ExchangeStatus, TimeSegment } from '../../types/exchange';
import { formatGMT } from '../../utils/timeUtils';
import { Flag } from '../Flag';

interface ExchangeRowProps {
  status: ExchangeStatus;
  currentKSTMin: number;
  onClick: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

function pct(min: number): string {
  return `${((min / 1440) * 100).toFixed(4)}%`;
}

function SegmentBar({ seg }: { seg: TimeSegment }) {
  const left = pct(seg.startMin);
  const width = pct(seg.endMin - seg.startMin);
  const color = seg.type === 'open' ? 'bg-emerald-500' : 'bg-amber-400';
  return (
    <div
      className={`absolute top-0 h-full ${color} opacity-90`}
      style={{ left, width }}
    />
  );
}

export function ExchangeRow({ status, currentKSTMin, onClick, isPinned, onTogglePin }: ExchangeRowProps) {
  const { exchange, kstOpenStr, kstCloseStr, localOpenStr, localCloseStr, gmtOffsetNow, isDST, timelineSegments, status: mktStatus, holiday, isEarlyClose, isTradingDay } = status;

  const statusColor =
    mktStatus === 'open' ? 'text-emerald-400' :
    mktStatus === 'lunch' ? 'text-amber-400' :
    mktStatus === 'holiday' ? 'text-rose-400' : 'text-gray-500';

  const statusLabel =
    mktStatus === 'open' ? 'OPEN' :
    mktStatus === 'lunch' ? 'LUNCH' :
    mktStatus === 'holiday' ? 'HOLIDAY' : 'CLOSED';

  const hasPhases = exchange.tradingPhases && exchange.tradingPhases.length > 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 py-1.5 group rounded-lg px-1.5 transition-colors ${hasPhases ? 'cursor-pointer hover:bg-gray-800/60' : 'cursor-default'}`}
      title={hasPhases ? `${exchange.nameKr} 상세 보기` : undefined}
    >
      {/* Exchange label — fixed width */}
      <div className="flex items-center gap-1.5 w-40 shrink-0">
        {onTogglePin && (
          <button
            onClick={e => { e.stopPropagation(); onTogglePin(); }}
            title={isPinned ? '관심 해제' : '관심 고정'}
            className={`text-xs leading-none shrink-0 ${isPinned ? 'text-sky-400' : 'text-gray-600 hover:text-gray-400'}`}
          >
            {isPinned ? '★' : '☆'}
          </button>
        )}
        <Flag cc={exchange.cc} className="w-5 h-3.5" />
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-200 uppercase tracking-wide truncate">
            {exchange.id.toUpperCase()}
            {isDST && (
              <span className="ml-1 text-[9px] font-bold text-sky-400 bg-sky-400/10 px-1 rounded">DST</span>
            )}
            {isEarlyClose && mktStatus !== 'holiday' && (
              <span className="ml-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1 rounded">반장</span>
            )}
            {!isTradingDay && mktStatus !== 'holiday' && (
              <span className="ml-1 text-[9px] font-bold text-gray-400 bg-gray-500/15 px-1 rounded">주말</span>
            )}
            {hasPhases && (
              <span className="ml-1 text-[9px] text-gray-600 group-hover:text-gray-400">ⓘ</span>
            )}
          </div>
          <div className="text-[10px] text-gray-500 truncate">{exchange.nameKr}</div>
        </div>
      </div>

      {/* Status badge */}
      <div className={`w-14 shrink-0 text-[10px] font-bold tabular-nums ${statusColor}`}>
        {statusLabel}
      </div>

      {/* Timeline bar */}
      <div className="relative flex-1 h-5 bg-gray-800 rounded overflow-hidden">
        {timelineSegments.map((seg, i) => (
          <SegmentBar key={i} seg={seg} />
        ))}
        {mktStatus === 'holiday' && (
          <div
            className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-rose-300 gap-1"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(244,63,94,0.18) 0 6px, transparent 6px 12px)' }}
          >
            ✕ 휴장{holiday ? ` · ${holiday.name}` : ''}
          </div>
        )}
        {!isTradingDay && mktStatus !== 'holiday' && (
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-500">주말 휴장</div>
        )}
        <div
          className="absolute top-0 h-full w-px bg-red-500 z-10"
          style={{ left: pct(currentKSTMin) }}
        />
      </div>

      {/* Time labels */}
      <div className="w-52 shrink-0 text-[10px] tabular-nums text-right leading-tight">
        <div className="text-gray-300 font-mono">
          {kstOpenStr}–{kstCloseStr} <span className="text-gray-600">KST</span>
        </div>
        <div className="text-gray-500 font-mono">
          {localOpenStr}–{localCloseStr}{' '}
          <span className="text-gray-600">{formatGMT(gmtOffsetNow)}</span>
        </div>
      </div>
    </div>
  );
}
