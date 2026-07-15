import React, { useState, useEffect, useMemo } from 'react';
import { computeExchangeStatusAt } from './utils/timeUtils';
import { useClock } from './hooks/useClock';
import { useExchanges } from './hooks/useExchanges';
import { useExchangeStatuses } from './hooks/useExchangeStatuses';
import { useExchangeInfo } from './hooks/useExchangeInfo';
import { useHolidays } from './hooks/useHolidays';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { usePins } from './hooks/usePins';
import { useExchangeVisibility } from './hooks/useExchangeVisibility';
import { Header } from './components/Header';
import { ActionBand } from './components/ActionBand';
import { Scrubber } from './components/Scrubber';
import { Timeline } from './components/Timeline';
import { StatusGrid } from './components/StatusGrid';
import { ExchangeDetail } from './components/ExchangeDetail';
import { Calculator } from './components/Calculator';
import { LoginModal } from './components/LoginModal';
import { NotesView } from './components/NotesView';
import { HolidayCalendarView } from './components/HolidayCalendarView';
import { ExchangeSelector } from './components/ExchangeSelector';
import { Exchange } from './types/exchange';

type Tab = 'timeline' | 'cards' | 'holidays' | 'calculator';

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
  const { exchanges } = useExchanges();
  const { getHoliday } = useHolidays();
  const statuses = useExchangeStatuses(exchanges, tick, getHoliday);
  const { user, isEditor, signIn, signOut } = useAuth();
  const { notes, notesFor, addNote, deleteNote } = useNotes();
  const { getInfo, saveInfo } = useExchangeInfo();
  const { pins, toggle: togglePin } = usePins();
  const { hidden, toggle: toggleVis, showAll, setAllHidden } = useExchangeVisibility();
  const [kstMin, setKstMin] = useState(getKSTMinutesNow);
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [detailExchange, setDetailExchange] = useState<Exchange | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [attached, setAttached] = useState(true);
  const [scrubMin, setScrubMin] = useState(getKSTMinutesNow);

  // Viewed KST minute: follows "now" when attached, else the scrubbed value.
  const viewMin = attached ? kstMin : scrubMin;
  const projectedStatuses = useMemo(
    () => exchanges.map(ex => computeExchangeStatusAt(ex, viewMin, getHoliday(ex))),
    [exchanges, viewMin, getHoliday],
  );
  const displayStatuses = attached ? statuses : projectedStatuses;
  const visibleStatuses = useMemo(
    () => displayStatuses.filter(s => !hidden.has(s.exchange.id)),
    [displayStatuses, hidden],
  );
  const handleScrub = (m: number) => { setAttached(false); setScrubMin(m); };
  const handleNow = () => setAttached(true);

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
    { id: 'holidays',   label: '휴장일' },
    { id: 'calculator', label: '계산기' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Header
        kstTimeStr={kstTimeStr}
        statuses={visibleStatuses}
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
        isEditor={isEditor}
        userEmail={user?.email ?? undefined}
        onOpenNotes={() => setShowNotes(true)}
        onLoginClick={() => setShowLogin(true)}
        onLogout={signOut}
      />

      {/* Action band — "지금 거래 가능?" */}
      <div className="max-w-screen-2xl mx-auto px-4 pt-4">
        <ActionBand statuses={visibleStatuses} onExchangeClick={ex => setDetailExchange(ex)} />
      </div>

      {/* Tab bar */}
      <div className="max-w-screen-2xl mx-auto px-4 pt-3">
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
        {/* KST scrubber — timeline & cards only */}
        {(activeTab === 'timeline' || activeTab === 'cards') && (
          <Scrubber viewMin={viewMin} attached={attached} onScrub={handleScrub} onNow={handleNow} />
        )}

        {/* Timeline tab */}
        {activeTab === 'timeline' && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                24H 타임라인
              </h2>
              <span className="text-[10px] text-gray-600">— KST 기준 · 거래소 클릭 시 상세 정보</span>
              <button onClick={() => setShowSelector(true)} className="ml-auto text-[11px] text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 rounded-lg px-2.5 py-1 transition-colors">
                ⚙ 거래소 선택
              </button>
            </div>
            <Timeline
              statuses={visibleStatuses}
              currentKSTMin={viewMin}
              onExchangeClick={ex => setDetailExchange(ex)}
              pins={pins}
              onTogglePin={togglePin}
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
              <button onClick={() => setShowSelector(true)} className="ml-auto text-[11px] text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 rounded-lg px-2.5 py-1 transition-colors">
                ⚙ 거래소 선택
              </button>
            </div>
            <StatusGrid
              statuses={visibleStatuses}
              onExchangeClick={ex => setDetailExchange(ex)}
              pins={pins}
              onTogglePin={togglePin}
            />
          </section>
        )}

        {/* Holidays tab */}
        {activeTab === 'holidays' && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                휴장일 캘린더
              </h2>
              <span className="text-[10px] text-gray-600">— 현지일 기준 · 지역 필터 · 거래/결제 휴장 구분</span>
            </div>
            <HolidayCalendarView />
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
          실시간 업데이트 (1초) · KST(UTC+9) 기준 · 서머타임 자동 적용 · 공휴일·조기폐장 반영(Supabase)
          · Bloomberg Aug 2024 데이터 기반
        </footer>
      </main>

      {/* Exchange detail modal */}
      {detailExchange && (
        <ExchangeDetail
          exchange={detailExchange}
          onClose={() => setDetailExchange(null)}
          viewMin={viewMin}
          attached={attached}
          holiday={displayStatuses.find(s => s.exchange.id === detailExchange.id)?.holiday}
          info={getInfo(detailExchange.id)}
          onSaveInfo={saveInfo}
          notes={notesFor(detailExchange.id)}
          isEditor={isEditor}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
        />
      )}

      {/* Full trader-notes view */}
      {showNotes && (
        <NotesView
          notes={notes}
          exchanges={exchanges}
          isEditor={isEditor}
          onDelete={deleteNote}
          onClose={() => setShowNotes(false)}
        />
      )}

      {/* Exchange selector */}
      {showSelector && (
        <ExchangeSelector
          exchanges={exchanges}
          hidden={hidden}
          onToggle={toggleVis}
          onShowAll={showAll}
          onHideAll={setAllHidden}
          onClose={() => setShowSelector(false)}
        />
      )}

      {/* Editor login */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={signIn}
        />
      )}
    </div>
  );
}
