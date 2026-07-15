import React, { useState, useEffect } from 'react';
import { ExchangeInfo } from '../hooks/useExchangeInfo';

interface Props {
  exchangeId: string;
  info: ExchangeInfo;
  isEditor: boolean;
  onSave: (id: string, info: ExchangeInfo) => Promise<{ error?: string }>;
}

export function ExchangeInfoBox({ exchangeId, info, isEditor, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [settlement, setSettlement] = useState(info.settlement ?? '');
  const [taxes, setTaxes] = useState(info.taxes ?? '');
  const [notes, setNotes] = useState(info.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Reset local fields when the source info or exchange changes.
  useEffect(() => {
    setSettlement(info.settlement ?? '');
    setTaxes(info.taxes ?? '');
    setNotes(info.notes ?? '');
    setEditing(false);
    setErr('');
  }, [exchangeId, info.settlement, info.taxes, info.notes]);

  async function save() {
    setBusy(true); setErr('');
    const { error } = await onSave(exchangeId, {
      settlement: settlement.trim() || undefined,
      taxes: taxes.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setBusy(false);
    if (error) { setErr(error); return; }
    setEditing(false);
  }

  function cancel() {
    setSettlement(info.settlement ?? '');
    setTaxes(info.taxes ?? '');
    setNotes(info.notes ?? '');
    setEditing(false); setErr('');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">거래소 정보</h3>
        {isEditor && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded transition-colors"
          >
            수정
          </button>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
        {!editing ? (
          <>
            <Field label="결제 주기" value={info.settlement} />
            <Field label="제세금" value={info.taxes} amber />
            <Field label="비고" value={info.notes} />
          </>
        ) : (
          <>
            <EditRow label="결제 주기" value={settlement} onChange={setSettlement} placeholder="예: T+2" />
            <EditRow label="제세금" value={taxes} onChange={setTaxes} placeholder="예: Stamp 10bps / Levy ..." />
            <EditArea label="비고" value={notes} onChange={setNotes} placeholder="기타 참고 사항" />
            {err && <div className="text-[10px] text-rose-400">{err}</div>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={busy}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold rounded px-4 py-1.5 transition-colors"
              >
                {busy ? '저장 중…' : '저장'}
              </button>
              <button onClick={cancel} className="text-gray-400 hover:text-gray-200 text-xs px-3">취소</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, amber }: { label: string; value?: string; amber?: boolean }) {
  return (
    <div>
      <div className="text-[9px] text-gray-500 mb-0.5">{label}</div>
      <div className={`text-[12px] leading-relaxed ${value ? (amber ? 'text-amber-300' : 'text-gray-200') : 'text-gray-600 italic'}`}>
        {value || '—'}
      </div>
    </div>
  );
}

function EditRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[9px] text-gray-500 block mb-1">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
      />
    </div>
  );
}

function EditArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[9px] text-gray-500 block mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[56px] bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2.5 py-1.5 leading-relaxed focus:outline-none focus:border-sky-500"
      />
    </div>
  );
}
