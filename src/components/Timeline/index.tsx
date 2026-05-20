import React, { useRef, useEffect } from 'react';
import { Exchange, ExchangeStatus, Region } from '../../types/exchange';
import { ExchangeRow } from './ExchangeRow';

interface TimelineProps {
  statuses: ExchangeStatus[];
  currentKSTMin: number;
  onExchangeClick: (exchange: Exchange) => void;
}

const REGION_LABELS: Record<Region, string> = {
  asia: 'ASIA',
  europe: 'EUROPE',
  americas: 'AMERICAS',
};

const REGION_COLORS: Record<Region, string> = {
  asia: 'text-sky-400 border-sky-900',
  europe: 'text-violet-400 border-violet-900',
  americas: 'text-orange-400 border-orange-900',
};

const HOUR_MARKS = Array.from({ length: 25 }, (_, i) => i);

function pct(min: number): string {
  return `${((min / 1440) * 100).toFixed(4)}%`;
}

export function Timeline({ statuses, currentKSTMin, onExchangeClick }: TimelineProps) {
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  const regions: Region[] = ['asia', 'europe', 'americas'];

  return (
    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
      {/* Hour axis */}
      <div className="flex items-end gap-2 mb-1 pl-[14.5rem] pr-[13.5rem]">
        <div className="relative flex-1 h-4">
          {HOUR_MARKS.map(h => (
            <span
              key={h}
              className="absolute text-[9px] text-gray-600 tabular-nums -translate-x-1/2"
              style={{ left: pct(h * 60) }}
            >
              {h < 24 ? h : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Current time label */}
      <div className="relative pl-[14.5rem] pr-[13.5rem] mb-1 h-4">
        <div
          ref={markerRef}
          className="absolute flex flex-col items-center"
          style={{ left: `calc(${pct(currentKSTMin)} )` }}
        >
          <span className="text-[9px] font-bold text-red-400 tabular-nums -translate-x-1/2 whitespace-nowrap">
            ▼ {Math.floor(currentKSTMin / 60).toString().padStart(2, '0')}:{(currentKSTMin % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Exchange rows by region */}
      {regions.map(region => {
        const group = statuses.filter(s => s.exchange.region === region);
        if (group.length === 0) return null;
        return (
          <div key={region} className="mb-3">
            <div className={`flex items-center gap-2 mb-1 border-b ${REGION_COLORS[region]} pb-0.5`}>
              <span className={`text-[10px] font-bold tracking-widest ${REGION_COLORS[region].split(' ')[0]}`}>
                {REGION_LABELS[region]}
              </span>
              <span className="text-[10px] text-gray-600">{group.length}개</span>
            </div>
            <div className="space-y-0.5">
              {group.map(s => (
                <ExchangeRow
                  key={s.exchange.id}
                  status={s}
                  currentKSTMin={currentKSTMin}
                  onClick={() => onExchangeClick(s.exchange)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-800 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-emerald-500 inline-block" /> 개장
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-amber-400 inline-block" /> 점심휴장
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-gray-700 inline-block" /> 폐장
        </span>
        <span className="flex items-center gap-1">
          <span className="w-0.5 h-3 bg-red-500 inline-block" /> 현재 KST
        </span>
        <span className="ml-auto text-sky-400 font-semibold text-[9px]">DST</span>
        <span>= 서머타임 적용 중</span>
        <span className="text-gray-600">· 행 클릭 시 세부 정보</span>
      </div>
    </div>
  );
}
