import React, { useRef } from 'react';

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
// 타임라인 막대와 동일한 척도(/1440)로 위치 계산 → ▼마커·막대선과 정확히 정렬
const pct = (m: number) => `${((m / 1440) * 100).toFixed(3)}%`;

const HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

/** KST 시각 스크러버 — 손잡이를 pct로 직접 배치해 타임라인 ▼/막대선과 일치.
 *  좌/우 컬럼 폭을 타임라인 행(라벨 14.875rem / 시각 13.875rem)에 맞춰 정렬. */
export function Scrubber({ viewMin, attached, onScrub, onNow }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function setFromClientX(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    onScrub(Math.round(ratio * 1439));
  }
  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (e.buttons & 1) setFromClientX(e.clientX);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    let d = 0;
    if (e.key === 'ArrowLeft') d = -1;
    else if (e.key === 'ArrowRight') d = 1;
    else if (e.key === 'PageDown') d = -60;
    else if (e.key === 'PageUp') d = 60;
    else return;
    e.preventDefault();
    onScrub(Math.min(1439, Math.max(0, viewMin + d)));
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-4">
      {/* 슬라이더 행: [라벨/시각] [트랙] [NOW] — 타임라인 컬럼 폭에 정렬 */}
      <div className="flex items-center">
        <div className="w-[14.875rem] shrink-0 pr-3 flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase shrink-0">KST 시점</span>
          <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 ${
            attached ? 'text-emerald-300 bg-emerald-500/10' : 'text-amber-300 bg-amber-500/10'
          }`}>
            <span className="text-[9px] font-bold tracking-wider">{attached ? 'LIVE' : '예상'}</span>
            {hhmm(viewMin)}
          </span>
        </div>

        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={onKeyDown}
          role="slider"
          tabIndex={0}
          aria-label="KST 시각 선택"
          aria-valuemin={0}
          aria-valuemax={1439}
          aria-valuenow={viewMin}
          className="relative flex-1 h-6 flex items-center cursor-pointer touch-none select-none focus:outline-none"
        >
          <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gray-700" />
          <div className="absolute h-1.5 rounded-full bg-sky-500/50" style={{ left: 0, width: pct(viewMin) }} />
          <div
            className="absolute w-4 h-4 rounded-full bg-sky-500 border-2 border-gray-900 -translate-x-1/2 shadow"
            style={{ left: pct(viewMin) }}
          />
        </div>

        <div className="w-[13.875rem] shrink-0 pl-3 flex justify-end">
          <button
            onClick={onNow}
            disabled={attached}
            className="text-[11px] font-mono font-bold px-3 py-1 rounded-lg border border-sky-700 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 disabled:opacity-40 disabled:border-gray-700 disabled:text-gray-600 disabled:bg-transparent transition-colors"
          >
            NOW
          </button>
        </div>
      </div>

      {/* 시각 눈금 — 트랙과 동일 정렬 */}
      <div className="flex mt-1.5">
        <div className="w-[14.875rem] shrink-0" />
        <div className="relative flex-1 h-3">
          {HOURS.map(h => (
            <span key={h} className="absolute text-[9px] text-gray-600 font-mono -translate-x-1/2" style={{ left: pct(h * 60) }}>
              {String(h).padStart(2, '0')}
            </span>
          ))}
        </div>
        <div className="w-[13.875rem] shrink-0" />
      </div>

      <div className="text-[10px] text-gray-600 text-center mt-1.5">
        슬라이더를 움직이면 그 시각의 전 시장 상태·현지시간이 바뀝니다 · NOW로 실시간 복귀
      </div>
    </div>
  );
}
