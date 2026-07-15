import React from 'react';

interface Props {
  viewMin: number;      // KST minute currently viewed
  attached: boolean;    // true = LIVE (follows now)
  onScrub: (min: number) => void;
  onNow: () => void;
}

const hhmm = (min: number) => {
  const w = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(w / 60)).padStart(2, '0')}:${String(w % 60).padStart(2, '0')}`;
};

/** KST time scrubber — drag to see every market's status & local time at that KST moment. */
export function Scrubber({ viewMin, attached, onScrub, onNow }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">KST 시점</span>
        <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
          attached ? 'text-emerald-300 bg-emerald-500/10' : 'text-amber-300 bg-amber-500/10'
        }`}>
          <span className="text-[9px] font-bold tracking-wider">{attached ? 'LIVE' : '예상'}</span>
          {hhmm(viewMin)}
        </span>
        <span className="text-[11px] text-gray-600 hidden md:inline">
          ← 슬라이더를 움직이면 그 시각의 전 시장 상태·현지시간이 바뀝니다
        </span>
        <button
          onClick={onNow}
          disabled={attached}
          className="ml-auto text-[11px] font-mono font-bold px-3 py-1 rounded border border-sky-700 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 disabled:opacity-40 disabled:border-gray-700 disabled:text-gray-600 disabled:bg-transparent transition-colors"
        >
          NOW
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={1439}
        value={viewMin}
        onChange={e => onScrub(Number(e.target.value))}
        aria-label="KST 시각 선택"
        className="w-full accent-sky-500 cursor-pointer"
      />
      <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-1 px-0.5">
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
          <span key={h}>{String(h).padStart(2, '0')}</span>
        ))}
      </div>
    </div>
  );
}
