import React from 'react';
import { Exchange, ExchangeStatus, Region } from '../../types/exchange';
import { ExchangeCard } from './ExchangeCard';

interface StatusGridProps {
  statuses: ExchangeStatus[];
  onExchangeClick: (exchange: Exchange) => void;
  pins: Set<string>;
  onTogglePin: (id: string) => void;
}

const REGION_LABELS: Record<Region, string> = {
  asia: 'ASIA',
  middleeast: 'MIDDLE EAST',
  europe: 'EUROPE',
  africa: 'AFRICA',
  americas: 'AMERICAS',
};

const REGION_COLORS: Record<Region, string> = {
  asia: 'text-sky-400',
  middleeast: 'text-teal-400',
  europe: 'text-violet-400',
  africa: 'text-amber-400',
  americas: 'text-orange-400',
};

/** KST regular-open minute (for sorting earliest-open first within a region). */
function kstOpenMin(s: ExchangeStatus): number {
  const [h, m] = s.kstOpenStr.replace('+1', '').split(':').map(Number);
  return h * 60 + m;
}
const byKstOpen = (a: ExchangeStatus, b: ExchangeStatus) => kstOpenMin(a) - kstOpenMin(b);

export function StatusGrid({ statuses, onExchangeClick, pins, onTogglePin }: StatusGridProps) {
  const regions: Region[] = ['asia', 'middleeast', 'europe', 'africa', 'americas'];
  const gridCls = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3';

  const renderCard = (s: ExchangeStatus) => (
    <ExchangeCard
      key={s.exchange.id}
      status={s}
      onClick={() => onExchangeClick(s.exchange)}
      isPinned={pins.has(s.exchange.id)}
      onTogglePin={() => onTogglePin(s.exchange.id)}
    />
  );

  const pinned = statuses.filter(s => pins.has(s.exchange.id)).sort(byKstOpen);

  return (
    <div className="space-y-6">
      {pinned.length > 0 && (
        <div>
          <div className="text-xs font-bold tracking-widest mb-2 text-sky-300">
            ⭐ 관심
            <span className="ml-2 text-gray-600 font-normal">{pinned.length}개</span>
          </div>
          <div className={gridCls}>{pinned.map(renderCard)}</div>
        </div>
      )}
      {regions.map(region => {
        const group = statuses.filter(s => s.exchange.region === region && !pins.has(s.exchange.id)).sort(byKstOpen);
        if (group.length === 0) return null;
        return (
          <div key={region}>
            <div className={`text-xs font-bold tracking-widest mb-2 ${REGION_COLORS[region]}`}>
              {REGION_LABELS[region]}
              <span className="ml-2 text-gray-600 font-normal">{group.length}개</span>
            </div>
            <div className={gridCls}>{group.map(renderCard)}</div>
          </div>
        );
      })}
    </div>
  );
}
