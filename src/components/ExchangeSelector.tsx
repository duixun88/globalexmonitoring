import React, { useEffect, useCallback } from 'react';
import { Exchange, Region } from '../types/exchange';
import { Flag } from './Flag';

interface Props {
  exchanges: Exchange[];
  hidden: Set<string>;
  onToggle: (id: string) => void;
  onShowAll: () => void;
  onHideAll: (ids: string[]) => void;
  onClose: () => void;
}

const REGION_LABEL: Record<Region, string> = {
  asia: 'ASIA PACIFIC', middleeast: 'MIDDLE EAST', europe: 'EUROPE', africa: 'AFRICA', americas: 'AMERICAS',
};
const REGIONS: Region[] = ['asia', 'middleeast', 'europe', 'africa', 'americas'];

export function ExchangeSelector({ exchanges, hidden, onToggle, onShowAll, onHideAll, onClose }: Props) {
  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const visibleCount = exchanges.filter(e => !hidden.has(e.id)).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <div>
            <h2 className="text-sm font-bold text-gray-100">거래소 선택</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">체크 해제하면 타임라인·카드뷰·요약에서 숨겨집니다 · {visibleCount}/{exchanges.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onShowAll} className="text-[11px] text-sky-300 hover:text-sky-200 px-2 py-1">전체 선택</button>
            <button onClick={() => onHideAll(exchanges.map(e => e.id))} className="text-[11px] text-gray-400 hover:text-gray-200 px-2 py-1">전체 해제</button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-100" aria-label="닫기">✕</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {REGIONS.map(region => {
            const group = exchanges.filter(e => e.region === region);
            if (group.length === 0) return null;
            return (
              <div key={region}>
                <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">{REGION_LABEL[region]}</div>
                <div className="grid grid-cols-2 gap-1">
                  {group.map(ex => {
                    const shown = !hidden.has(ex.id);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => onToggle(ex.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                          shown ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800 opacity-50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${shown ? 'bg-sky-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
                          {shown ? '✓' : ''}
                        </span>
                        <Flag cc={ex.cc} className="w-5 h-3.5" />
                        <span className="min-w-0">
                          <span className="text-[11px] font-mono font-bold text-gray-200">{ex.id.toUpperCase()}</span>
                          <span className="block text-[10px] text-gray-500 truncate leading-none">{ex.nameKr}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
