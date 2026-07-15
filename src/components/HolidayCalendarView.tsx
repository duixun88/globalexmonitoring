import React, { useState, useMemo } from 'react';
import { Flag } from './Flag';
import { useHolidayCalendar, HolidayRow } from '../hooks/useHolidayCalendar';

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfWeek = (d: Date) => addDays(d, -d.getDay());

const REGIONS = [
  { v: 'all', l: '전체' },
  { v: 'Asia', l: '아시아' },
  { v: 'Europe', l: '유럽' },
  { v: 'Americas', l: '미주' },
  { v: 'Middle East', l: '중동' },
  { v: 'Africa', l: '아프리카' },
];
const WD = ['일', '월', '화', '수', '목', '금', '토'];

function tradeBadge(t: string) {
  if (t === 'No') return { l: '거래휴장', c: 'bg-rose-500/20 text-rose-300' };
  if (t === 'Partial') return { l: '반장', c: 'bg-amber-500/20 text-amber-300' };
  return null;
}
function settleBadge(s: string) {
  if (s === 'No') return { l: '결제휴장', c: 'bg-orange-500/20 text-orange-300' };
  return null;
}

function MonthEntry({ e }: { e: HolidayRow }) {
  return (
    <div
      className="flex items-center gap-1 text-[11px] leading-snug"
      title={`${e.displayName} · ${e.event} · 거래:${e.trading} / 결제:${e.settle}`}
    >
      <Flag cc={e.iso.toLowerCase()} className="w-3.5 h-2.5 shrink-0" />
      <span className="truncate text-gray-300 flex-1">{e.displayName}</span>
      <span className="flex gap-0.5 shrink-0">
        {tradeBadge(e.trading) && (
          <span className={`w-1.5 h-1.5 rounded-full ${e.trading === 'No' ? 'bg-rose-400' : 'bg-amber-400'}`} />
        )}
        {settleBadge(e.settle) && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
      </span>
    </div>
  );
}

function WeekEntry({ e }: { e: HolidayRow }) {
  const tb = tradeBadge(e.trading);
  const sb = settleBadge(e.settle);
  return (
    <div className="bg-gray-800/50 rounded px-1.5 py-1">
      <div className="flex items-center gap-1 mb-0.5">
        <Flag cc={e.iso.toLowerCase()} className="w-3.5 h-2.5" />
        <span className="text-[9px] font-mono font-bold text-gray-300">{e.iso}</span>
        <span className="text-[9px] text-gray-400 truncate">{e.displayName}</span>
      </div>
      <div className="text-[9px] text-gray-300 leading-tight mb-0.5">{e.event}</div>
      <div className="flex flex-wrap gap-0.5">
        {tb && <span className={`text-[8px] px-1 rounded ${tb.c}`}>{tb.l}</span>}
        {sb && <span className={`text-[8px] px-1 rounded ${sb.c}`}>{sb.l}</span>}
      </div>
    </div>
  );
}

export function HolidayCalendarView() {
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [region, setRegion] = useState('all');
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const todayStr = ymd(new Date());
  const q = search.trim().toLowerCase();
  const matchRow = (r: HolidayRow) =>
    !q || r.displayName.toLowerCase().includes(q) || r.countryName.toLowerCase().includes(q) || r.iso.toLowerCase().includes(q);

  const { cells, rangeStart, rangeEnd, label } = useMemo(() => {
    if (mode === 'month') {
      const som = startOfMonth(cursor);
      const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
      const weeks = Math.ceil((som.getDay() + daysInMonth) / 7);
      const gridStart = startOfWeek(som);
      const c = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
      return { cells: c, rangeStart: ymd(c[0]), rangeEnd: ymd(c[c.length - 1]), label: `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월` };
    }
    const ws = startOfWeek(cursor);
    const c = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    return { cells: c, rangeStart: ymd(c[0]), rangeEnd: ymd(c[6]), label: `${ymd(c[0])} ~ ${ymd(c[6])}` };
  }, [mode, cursor]);

  const { rows, loading } = useHolidayCalendar(rangeStart, rangeEnd, region);
  const { rows: todayRows } = useHolidayCalendar(todayStr, todayStr, region);
  const byDate = useMemo(() => {
    const m: Record<string, HolidayRow[]> = {};
    rows.forEach(r => {
      if (q && !matchRow(r)) return;
      (m[r.date] = m[r.date] || []).push(r);
    });
    return m;
  }, [rows, q]);
  const shownToday = todayRows.filter(matchRow);
  const shownCount = rows.filter(matchRow).length;

  const nav = (dir: number) =>
    setCursor(c => (mode === 'month' ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, dir * 7)));

  const segBtn = (active: boolean) =>
    `px-3 py-1.5 text-[11px] ${active ? 'bg-sky-600 text-white font-bold' : 'bg-gray-900 text-gray-400 hover:text-gray-200'}`;
  const chip = (active: boolean) =>
    `px-2.5 py-1 text-[11px] rounded-lg border ${active ? 'bg-sky-600 border-sky-600 text-white font-semibold' : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-200'}`;

  return (
    <div>
      {/* Today banner (country names) */}
      <div className="mb-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">오늘 휴장</span>
          <span className="text-[10px] font-mono text-gray-500">{todayStr}</span>
          <span className="text-[10px] text-gray-600">
            · 현지일 기준{region !== 'all' ? ` · ${REGIONS.find(r => r.v === region)?.l}` : ''}
          </span>
        </div>
        {shownToday.length === 0 ? (
          <div className="text-xs text-gray-500">오늘 휴장 거래소가 없습니다.</div>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {shownToday.map((e, i) => {
              const tb = tradeBadge(e.trading);
              const sb = settleBadge(e.settle);
              return (
                <span key={i} className="text-[11px] flex items-center gap-1.5">
                  <span className="text-gray-200 font-semibold">{e.displayName}</span>
                  <span className="text-gray-500">{e.event}</span>
                  {tb && <span className={`text-[9px] px-1 rounded ${tb.c}`}>{tb.l}</span>}
                  {sb && <span className={`text-[9px] px-1 rounded ${sb.c}`}>{sb.l}</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex border border-gray-700 rounded-lg overflow-hidden">
          <button onClick={() => setMode('month')} className={segBtn(mode === 'month')}>월간</button>
          <button onClick={() => setMode('week')} className={segBtn(mode === 'week')}>주간</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => nav(-1)} className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 hover:text-white">‹</button>
          <button onClick={() => setCursor(new Date())} className="px-2.5 h-7 rounded-lg bg-gray-900 border border-gray-700 text-[11px] text-gray-300 hover:text-white">오늘</button>
          <button onClick={() => nav(1)} className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 hover:text-white">›</button>
        </div>
        <span className="text-sm font-bold text-gray-100">{label}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="국가 검색"
              className="bg-gray-900 border border-gray-700 text-gray-200 text-[11px] rounded-lg pl-6 pr-2 py-1.5 w-32 focus:outline-none focus:border-sky-500"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-[11px]">⌕</span>
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-[11px]">✕</button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {REGIONS.map(r => (
              <button key={r.v} onClick={() => setRegion(r.v)} className={chip(region === r.v)}>{r.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend (top) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-[11px]">
        <span className="text-gray-500 font-semibold">범례</span>
        <span className="flex items-center gap-1.5 text-gray-300"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> 거래휴장</span>
        <span className="flex items-center gap-1.5 text-gray-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 반장(Partial)</span>
        <span className="flex items-center gap-1.5 text-gray-300"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> 결제휴장</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-7 gap-1">
            {WD.map((w, i) => (
              <div key={w} className={`text-center text-[10px] font-bold py-1 ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-gray-500'}`}>{w}</div>
            ))}

            {mode === 'month' && cells.map(d => {
              const ds = ymd(d);
              const inMonth = d.getMonth() === cursor.getMonth();
              const entries = byDate[ds] || [];
              const isToday = ds === todayStr;
              return (
                <div key={ds} className={`min-h-[94px] rounded p-1 border flex flex-col ${inMonth ? 'bg-gray-900 border-gray-800' : 'bg-gray-900/40 border-gray-800/50'} ${isToday ? 'ring-1 ring-sky-500' : ''}`}>
                  <div className={`text-[10px] ${isToday ? 'text-sky-300 font-bold' : inMonth ? 'text-gray-400' : 'text-gray-600'}`}>{d.getDate()}</div>
                  <div className="space-y-0.5 mt-0.5">
                    {entries.map((e, i) => <MonthEntry key={i} e={e} />)}
                  </div>
                </div>
              );
            })}
          </div>

          {mode === 'week' && (
            <div className="grid grid-cols-7 gap-1">
              {cells.map(d => {
                const ds = ymd(d);
                const entries = byDate[ds] || [];
                const isToday = ds === todayStr;
                return (
                  <div key={ds} className={`rounded border bg-gray-900 border-gray-800 p-1.5 min-h-[320px] ${isToday ? 'ring-1 ring-sky-500' : ''}`}>
                    <div className="text-[10px] font-bold mb-1.5 flex items-center justify-between">
                      <span className={d.getDay() === 0 ? 'text-rose-400' : d.getDay() === 6 ? 'text-sky-400' : 'text-gray-400'}>{WD[d.getDay()]}</span>
                      <span className={isToday ? 'text-sky-300' : 'text-gray-500'}>{d.getMonth() + 1}/{d.getDate()}</span>
                    </div>
                    <div className="space-y-1">
                      {entries.length === 0 && <div className="text-[9px] text-gray-700 text-center pt-2">—</div>}
                      {entries.map((e, i) => <WeekEntry key={i} e={e} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Count / source */}
      <div className="flex items-center mt-3 text-[10px] text-gray-500">
        <span className="text-gray-400">{loading ? '불러오는 중…' : `${shownCount}건`}</span>
        <span className="ml-auto text-gray-600">현지일 기준 · Supabase holiday_calendar</span>
      </div>
    </div>
  );
}
