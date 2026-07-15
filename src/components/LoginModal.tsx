import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
}

export function LoginModal({ onClose, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await onLogin(email.trim(), pw);
    setBusy(false);
    if (error) setErr(error); else onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={submit}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm p-6 shadow-2xl"
      >
        <h2 className="text-sm font-bold text-gray-100 mb-1">편집자 로그인</h2>
        <p className="text-[11px] text-gray-500 mb-4">노트 작성·삭제 권한. 조회는 로그인 없이 가능합니다.</p>

        <label className="text-[10px] text-gray-500 block mb-1">이메일</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-sky-500"
        />

        <label className="text-[10px] text-gray-500 block mb-1">비밀번호</label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-sky-500"
        />

        {err && <div className="text-[11px] text-rose-400 mb-3">{err}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-sm font-bold rounded-lg py-2 transition-colors"
          >
            {busy ? '로그인 중…' : '로그인'}
          </button>
          <button type="button" onClick={onClose} className="px-4 text-gray-400 hover:text-gray-200 text-sm">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
