import { useState, useEffect } from 'react';
import { getKSTTimeStr } from '../utils/timeUtils';

export interface ClockState {
  kstTimeStr: string;  // "HH:MM:SS"
  tick: number;        // increments every second — use as dependency
}

export function useClock(): ClockState {
  const [state, setState] = useState<ClockState>({
    kstTimeStr: getKSTTimeStr(),
    tick: 0,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setState(prev => ({
        kstTimeStr: getKSTTimeStr(),
        tick: prev.tick + 1,
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
