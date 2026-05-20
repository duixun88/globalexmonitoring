import React, { useState, useEffect } from 'react';
import { exchanges } from './data/exchanges';
import { useClock } from './hooks/useClock';
import { useExchangeStatuses } from './hooks/useExchangeStatuses';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { StatusGrid } from './components/StatusGrid';

function getKSTMinutesNow(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) =>
    parseInt(parts.find(p => p.type === type)?.value ?? '0');
  return get('hour') * 60 + get('minute');
}

export default function App() {
  const { kstTimeStr, tick } = useClock();
  const statuses = useExchangeStatuses(exchanges, tick);
  const [kstMin, setKstMin] = useState(getKSTMinutesNow);
  const [isDark, setIsDark] = useState(true);

  // Sync kstMin every tick
  useEffect(() => {
    setKstMin(getKSTMinutesNow());
  }, [tick]);

  // Persist + apply dark mode
  useEffect(() => {
    const saved = localStorage.getItem('tm_dark');
    if (saved !== null) setIsDark(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tm_dark', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Header
        kstTimeStr={kstTimeStr}
        statuses={statuses}
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
      />

      <main className="max-w-screen-2xl mx-auto px-4 py-4 space-y-6">
        {/* 24h KST Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              24H 타임라인
            </h2>
            <span className="text-[10px] text-gray-600">— KST 기준</span>
          </div>
          <Timeline statuses={statuses} currentKSTMin={kstMin} />
        </section>

        {/* Exchange status cards */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              거래소 현황
            </h2>
          </div>
          <StatusGrid statuses={statuses} />
        </section>

        {/* Footer */}
        <footer className="text-center text-[10px] text-gray-700 pb-4">
          실시간 업데이트 (1초) · KST(UTC+9) 기준 · 서머타임 자동 적용 · 공휴일 미반영
        </footer>
      </main>
    </div>
  );
}
