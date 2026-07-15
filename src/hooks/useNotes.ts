import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Note } from '../types/exchange';

/**
 * Trader notes (exchange_notes). Public read; writes require Supabase Auth.
 * Falls back to a no-op (empty) when Supabase is not configured.
 */
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) { setReady(true); return; }
    const { data, error } = await supabase
      .from('exchange_notes')
      .select('id, exchange_id, note_date, body, author, created_at, updated_at')
      .order('note_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error && data) {
      setNotes(data.map((r: any) => ({
        id: r.id,
        exchangeId: r.exchange_id,
        noteDate: r.note_date,
        body: r.body,
        author: r.author ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    }
    setReady(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addNote = useCallback(
    async (exchangeId: string, noteDate: string, body: string, author?: string) => {
      if (!supabase) return { error: 'Supabase 미설정' };
      const { error } = await supabase
        .from('exchange_notes')
        .insert({ exchange_id: exchangeId, note_date: noteDate, body, author });
      if (!error) await refresh();
      return { error: error?.message };
    },
    [refresh],
  );

  const updateNote = useCallback(
    async (id: string, body: string, noteDate?: string) => {
      if (!supabase) return { error: 'Supabase 미설정' };
      const patch: Record<string, any> = { body };
      if (noteDate) patch.note_date = noteDate;
      const { error } = await supabase.from('exchange_notes').update(patch).eq('id', id);
      if (!error) await refresh();
      return { error: error?.message };
    },
    [refresh],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!supabase) return { error: 'Supabase 미설정' };
      const { error } = await supabase.from('exchange_notes').delete().eq('id', id);
      if (!error) await refresh();
      return { error: error?.message };
    },
    [refresh],
  );

  const notesFor = useCallback(
    (exchangeId: string) => notes.filter(n => n.exchangeId === exchangeId),
    [notes],
  );

  return { notes, notesFor, addNote, updateNote, deleteNote, ready, refresh };
}
