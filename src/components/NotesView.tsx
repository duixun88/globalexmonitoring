import React, { useState, useEffect, useCallback } from 'react';
import { Exchange, Note } from '../types/exchange';
import { Flag } from './Flag';

interface Props {
  notes: Note[];              // sorted date desc from useNotes
  exchanges: Exchange[];
  isEditor: boolean;
  onDelete: (id: string) => Promise<{ error?: string } | void>;
  onClose: () => void;
}

type Group = { key: string; label: React.ReactNode; items: Note[] };

export function NotesView({ notes, exchanges, isEditor, onDelete, onClose }: Props) {
  const [mode, setMode] = useState<'ex' | 'date'>('ex');
  const [filter, setFilter] = useState<string>('all');

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const exById: Record<string, Exchange> = {};
  exchanges.forEach(e => { exById[e.id] = e; });

  const filtered = filter === 'all' ? notes : notes.filter(n => n.exchangeId === filter);

  const groups: Group[] = [];
  if (mode === 'ex') {
    const by: Record<string, Note[]> = {};
    filtered.forEach(n => { (by[n.exchangeId] = by[n.exchangeId] || []).push(n); });
    exchanges.forEach(e => {
      const items = by[e.id];
      if (items && items.length) {
        groups.push({
          key: e.id,
          label: (
            <span className="flex items-center gap-2">
              <Flag cc={e.cc} className="w-5 h-3.5" />
              <span className="font-mono font-bold text-gray-100">{e.id.toUpperCase()}</span>
              <span className="text-[10px] text-gray-500">{e.nameKr} · {items.length}건</span>
            </span>
          ),
          items,
        });
      }
    });
  } else {
    const by: Record<string, Note[]> = {};
    filtered.forEach(n => { (by[n.noteDate] = by[n.noteDate] || []).push(n); });
    Object.keys(by).sort((a, b) => b.localeCompare(a)).forEach(d => {
      groups.push({
        key: d,
        label: (
          <span className="flex items-center gap-2">
            <span className="font-mono font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded">{d}</span>
            <span className="text-[10px] text-gray-500">{by[d].length}건</span>
          </span>
        ),
        items: by[d],
      });
    });
  }

  return (
    <div className="fixed inset-0 z-[55] bg-gray-950 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-5 py-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap pb-3 border-b border-gray-800">
          <h2 className="text-sm font-bold tracking-widest uppercase text-gray-100">📓 Trader&apos;s Note</h2>
          <span className="text-[11px] text-gray-500 font-mono">전체 {notes.length}건</span>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setMode('ex')}
                className={`px-3 py-1.5 text-[11px] ${mode === 'ex' ? 'bg-sky-600 text-white font-bold' : 'bg-gray-900 text-gray-400'}`}
              >
                거래소별
              </button>
              <button
                onClick={() => setMode('date')}
                className={`px-3 py-1.5 text-[11px] ${mode === 'date' ? 'bg-sky-600 text-white font-bold' : 'bg-gray-900 text-gray-400'}`}
              >
                날짜별
              </button>
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-[11px] rounded-lg px-2.5 py-1.5"
            >
              <option value="all">전체 거래소</option>
              {exchanges.map(e => (
                <option key={e.id} value={e.id}>{e.id.toUpperCase()} · {e.nameKr}</option>
              ))}
            </select>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-100" aria-label="닫기">✕</button>
          </div>
        </div>

        {/* Body */}
        {groups.length === 0 ? (
          <div className="text-center text-gray-600 py-20 text-sm">
            {notes.length ? '이 조건에 해당하는 노트가 없습니다.' : '아직 작성된 노트가 없습니다. 거래소를 열고 편집 모드에서 노트를 추가해 보세요.'}
          </div>
        ) : (
          groups.map(g => (
            <div key={g.key} className="mt-5">
              <div className="flex items-center gap-2 pb-1.5 mb-2 border-b border-gray-800/70">{g.label}</div>
              <div className="space-y-1.5">
                {g.items.map(n => {
                  const ex = exById[n.exchangeId];
                  return (
                    <div key={n.id} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5">
                      {mode === 'ex' ? (
                        <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">{n.noteDate}</span>
                      ) : (
                        <span className="flex items-center gap-1.5 shrink-0 mt-0.5">
                          {ex && <Flag cc={ex.cc} className="w-4 h-3" />}
                          <span className="text-[10px] font-mono font-bold text-gray-200">{(ex?.id ?? n.exchangeId).toUpperCase()}</span>
                        </span>
                      )}
                      <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap flex-1 min-w-0">{n.body}</div>
                      {isEditor && (
                        <button onClick={() => onDelete(n.id)} title="삭제" className="text-gray-600 hover:text-rose-400 text-xs shrink-0 leading-none mt-0.5 self-center">✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
