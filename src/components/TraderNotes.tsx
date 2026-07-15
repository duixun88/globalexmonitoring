import React, { useState } from 'react';
import { Note } from '../types/exchange';

const todayISO = () => {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

interface Props {
  exchangeId: string;
  notes: Note[]; // this exchange's notes (any order)
  isEditor: boolean;
  onAdd: (exchangeId: string, date: string, body: string) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string } | void>;
}

export function TraderNotes({ exchangeId, notes, isEditor, onAdd, onDelete }: Props) {
  const [date, setDate] = useState(todayISO);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const sorted = [...notes].sort(
    (a, b) => b.noteDate.localeCompare(a.noteDate) || (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  );

  async function submit() {
    if (!body.trim()) return;
    setBusy(true); setErr('');
    const { error } = await onAdd(exchangeId, date, body.trim());
    setBusy(false);
    if (error) { setErr(error); return; }
    setBody('');
  }

  return (
    <div>
      {isEditor ? (
        <div className="bg-gray-800/40 border border-dashed border-gray-700 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-[11px] rounded px-2 py-1 font-mono focus:outline-none focus:border-sky-500"
            />
            <span className="text-[9px] text-gray-500">이 날짜로 기록됩니다</span>
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="예: 오후장 유동성 얇음 · VWAP 분할 / 7-20 반차 예정 / 브로커 코멘트…"
            className="w-full min-h-[70px] bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2.5 py-2 leading-relaxed focus:outline-none focus:border-sky-500"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={submit}
              disabled={busy || !body.trim()}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold rounded px-4 py-1.5 transition-colors"
            >
              {busy ? '저장 중…' : '추가'}
            </button>
            {err && <span className="text-[10px] text-rose-400">{err}</span>}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-gray-600 mb-2">조회 모드 — 편집하려면 상단에서 편집자 로그인하세요.</div>
      )}

      <div className="space-y-1.5">
        {sorted.length === 0 && (
          <div className="text-xs text-gray-600 italic">작성된 노트가 없습니다.</div>
        )}
        {sorted.map(n => (
          <div key={n.id} className="flex items-start gap-2.5 bg-gray-800/40 border border-gray-800 rounded-lg px-3 py-2">
            <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
              {n.noteDate}
            </span>
            <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap flex-1 min-w-0">{n.body}</div>
            {n.author && (
              <span className="text-[10px] text-gray-500 shrink-0 mt-0.5 font-mono" title="작성자">✎ {n.author}</span>
            )}
            {isEditor && (
              <button onClick={() => onDelete(n.id)} title="삭제" className="text-gray-600 hover:text-rose-400 text-xs shrink-0 leading-none mt-0.5">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
