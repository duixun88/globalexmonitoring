import React from 'react';
import { ExchangeStatus } from '../../types/exchange';
import { formatCountdown, formatGMT } from '../../utils/timeUtils';

interface ExchangeCardProps {
  status: ExchangeStatus;
}

const STATUS_STYLES = {
  open: {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400 animate-pulse',
    label: 'OPEN',
  },
  lunch: {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'LUNCH',
  },
  closed: {
    badge: 'bg-gray-700/40 text-gray-500 border border-gray-700',
    border: 'border-gray-700/40',
    dot: 'bg-gray-600',
    label: 'CLOSED',
  },
};

const NEXT_EVENT_LABEL = {
  open: '개장까지',
  close: '폐장까지',
  lunch_end: '점심 재개',
};

export function ExchangeCard({ status }: ExchangeCardProps) {
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
  } = status;

  const style = STATUS_STYLES[mktStatus];

  return (
    <div className={`bg-gray-900 rounded-lg p-3 border ${style.border} hover:border-gray-600 transition-colors`}>
      {/* Top row: flag + name + status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{exchange.flag}</span>
          <div>
            <div className="text-xs font-bold text-gray-100 uppercase tracking-wide">
              {exchange.id}
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

      {/* Countdown + GMT */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-[9px] text-gray-600">{NEXT_EVENT_LABEL[nextEvent]}</div>
          <div className={`text-sm font-bold font-mono tabular-nums ${
            mktStatus === 'open' ? 'text-gray-300' : 'text-emerald-400'
          }`}>
            {formatCountdown(secondsToNext)}
          </div>
        </div>
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
