import React from 'react';
import { ExchangeStatus, Region } from '../../types/exchange';
import { ExchangeCard } from './ExchangeCard';

interface StatusGridProps {
  statuses: ExchangeStatus[];
}

const REGION_LABELS: Record<Region, string> = {
  asia: 'ASIA',
  europe: 'EUROPE',
  americas: 'AMERICAS',
};

const REGION_COLORS: Record<Region, string> = {
  asia: 'text-sky-400',
  europe: 'text-violet-400',
  americas: 'text-orange-400',
};

export function StatusGrid({ statuses }: StatusGridProps) {
  const regions: Region[] = ['asia', 'europe', 'americas'];

  return (
    <div className="space-y-6">
      {regions.map(region => {
        const group = statuses.filter(s => s.exchange.region === region);
        if (group.length === 0) return null;
        return (
          <div key={region}>
            <div className={`text-xs font-bold tracking-widest mb-2 ${REGION_COLORS[region]}`}>
              {REGION_LABELS[region]}
              <span className="ml-2 text-gray-600 font-normal">{group.length}개</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
              {group.map(s => (
                <ExchangeCard key={s.exchange.id} status={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
