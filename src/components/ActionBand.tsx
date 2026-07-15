import React from 'react';
import { Exchange, ExchangeStatus } from '../types/exchange';
import { formatCountdown } from '../utils/timeUtils';
import { Flag } from './Flag';

interface Props {
  statuses: ExchangeStatus[];
  onExchangeClick: (exchange: Exchange) => void;
}

/** "지금 거래 가능?" — one-glance answer: open / lunch / opening-soon / holiday. */
export function ActionBand({ statuses, onExchangeClick }: Props) {
  const open = statuses.filter(s => s.status === 'open');
  const lunch = statuses.filter(s => s.status === 'lunch');
  const holiday = statuses.filter(s => s.status === 'holiday');
  const soon = statuses
    .filter(s => s.status === 'closed' && s.nextEvent === 'open' && s.secondsToNext <= 3600)
    .sort((a, b) => a.secondsToNext - b.secondsToNext);

  const groups = [
    { key: 'open',    label: '열림',     dot: 'bg-emerald-400', text: 'text-emerald-400', items: open },
    { key: 'lunch',   label: '점심',     dot: 'bg-amber-400',   text: 'text-amber-400',   items: lunch },
    { key: 'soon',    label: '곧 개장',  dot: 'bg-sky-400',     text: 'text-sky-400',     items: soon },
    { key: 'holiday', label: '오늘 휴장', dot: 'bg-rose-400',    text: 'text-rose-400',    items: holiday },
  ].filter(g => g.items.length > 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex flex-wrap gap-x-6 gap-y-3 items-start">
      <div className="text-[11px] font-bold text-gray-500 shrink-0 pt-1">지금 ▸</div>
      {groups.length === 0 ? (
        <span className="text-xs text-gray-600 pt-0.5">열린 시장이 없습니다.</span>
      ) : (
        groups.map(g => (
          <div key={g.key} className="flex items-start gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wide ${g.text} flex items-center gap-1.5 shrink-0 pt-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />{g.label}
            </span>
            <div className="flex flex-wrap gap-1">
              {g.items.map(s => (
                <button
                  key={s.exchange.id}
                  onClick={() => onExchangeClick(s.exchange)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                  title={`${s.exchange.nameKr} 상세`}
                >
                  <Flag cc={s.exchange.cc} className="w-4 h-3" />
                  <span className="text-[10px] font-mono font-bold text-gray-200">{s.exchange.id.toUpperCase()}</span>
                  {s.isEarlyClose && (g.key === 'open' || g.key === 'lunch') && (
                    <span className="text-[9px] font-bold text-amber-400" title={s.holiday?.name}>반장</span>
                  )}
                  {g.key === 'open' && s.secondsToNext <= 1800 && (
                    <span className="text-[9px] text-gray-500 font-mono">마감 {formatCountdown(s.secondsToNext)}</span>
                  )}
                  {g.key === 'soon' && (
                    <span className="text-[9px] text-gray-500 font-mono">{formatCountdown(s.secondsToNext)}</span>
                  )}
                  {g.key === 'holiday' && s.holiday && (
                    <span className="text-[9px] text-rose-300/70">{s.holiday.name.split(' (')[0]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
