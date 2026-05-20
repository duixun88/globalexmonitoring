import React, { useState, useEffect } from 'react';
import { exchanges } from './data/exchanges';
import { useClock } from './hooks/useClock';
import { useExchangeStatuses } from './hooks/useExchangeStatuses';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { StatusGrid } from './components/StatusGrid';
import { ExchangeDetail } from './components/ExchangeDetail';
import { Calculator } from './components/Calculator';
import { Exchange } from './types/exchange';

type Tab = 'timeline' | 'cards' | 'calculator';

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
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [detailExchange, setDetailExchange] = useState<Exchange | null>(null);

  useEffect(() => { setKstMin(getKSTMinutesNow()); }, [tick]);

  useEffect(() => {
    const saved = localStorage.getItem('tm_dark');
    if (saved !== null) setIsDark(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tm_dark', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const TAB_CONFIG: { id: Tab; label: string }[] = [
    { id: 'timeline',   label: '24h 타임라인' },
    { id: 'cards',      label: '카드뷰' },
    { id: 'calculator', label: '계산기' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Header
        kstTimeStr={kstTimeStr}
        statuses={statuses}
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
      />

      {/* Tab bar */}
      <div className="max-w-screen-2xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-gray-900/60 rounded-xl p-1 w-fit border border-gray-800">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-gray-100 shadow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-screen-2xl mx-auto px-4 py-4 space-y-6">
        {/* Timeline tab */}
        {activeTab === 'timeline' && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                24H 타임라인
              </h2>
              <span className="text-[10px] text-gray-600">— KST 기준 · 거래소 클릭 시 상세 정보</span>
            </div>
            <Timeline
              statuses={statuses}
              currentKSTMin={kstMin}
              onExchangeClick={ex => setDetailExchange(ex)}
            />
          </section>
        )}

        {/* Cards tab */}
        {activeTab === 'cards' && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                거래소 현황
              </h2>
              <span className="text-[10px] text-gray-600">— 카드 클릭 시 상세 세션 정보</span>
            </div>
            <StatusGrid
              statuses={statuses}
              onExchangeClick={ex => setDetailExchange(ex)}
            />
          </section>
        )}

        {/* Calculator tab */}
        {activeTab === 'calculator' && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                마감시간 계산기
              </h2>
              <span className="text-[10px] text-gray-600">— Trader 업무용 · 시차 자동 계산</span>
            </div>
            <Calculator exchanges={exchanges} statuses={statuses} tick={tick} />
          </section>
        )}

        <footer className="text-center text-[10px] text-gray-700 pb-4">
          실시간 업데이트 (1초) · KST(UTC+9) 기준 · 서머타임 자동 적용 · 공휴일 미반영
          · Bloomberg Aug 2024 데이터 기반
        </footer>
      </main>

      {/* Exchange detail modal */}
      {detailExchange && (
        <ExchangeDetail
          exchange={detailExchange}
          onClose={() => setDetailExchange(null)}
        />
      )}
    </div>
  );
}
