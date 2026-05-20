import React from 'react';
import { ExchangeStatus } from '../types/exchange';

interface HeaderProps {
  kstTimeStr: string;
  statuses: ExchangeStatus[];
  isDark: boolean;
  onToggleDark: () => void;
}

export function Header({ kstTimeStr, statuses, isDark, onToggleDark }: HeaderProps) {
  const openCount = statuses.filter(s => s.status === 'open').length;
  const lunchCount = statuses.filter(s => s.status === 'lunch').length;
  const closedCount = statuses.filter(s => s.status === 'closed').length;

  const [hms, setHms] = React.useState(kstTimeStr);
  React.useEffect(() => { setHms(kstTimeStr); }, [kstTimeStr]);

  const today = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800 select-none">
      {/* Left: KST clock */}
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">KST</span>
        <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight">
          {hms}
        </span>
        <span className="text-xs text-gray-500">{today}</span>
      </div>

      {/* Center: market summary */}
      <div className="flex items-center gap-4 text-sm font-medium tabular-nums">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-emerald-400">{openCount}</span>
          <span className="text-gray-500">개장</span>
        </span>
        {lunchCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-400">{lunchCount}</span>
            <span className="text-gray-500">점심</span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
          <span className="text-gray-400">{closedCount}</span>
          <span className="text-gray-500">폐장</span>
        </span>
        <span className="text-gray-700">|</span>
        <span className="text-gray-500 text-xs">{statuses.length}개 거래소</span>
      </div>

      {/* Right: dark mode toggle */}
      <button
        onClick={onToggleDark}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        title={isDark ? '라이트 모드' : '다크 모드'}
      >
        {isDark ? '☀️' : '🌙'} {isDark ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}
