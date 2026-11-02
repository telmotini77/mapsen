import { useState, type SetStateAction } from 'react';

export function useHistory<T>(initial: T) {
  const [state, setState] = useState({ past: [] as T[], present: initial, future: [] as T[] });
  const set = (action: SetStateAction<T>) => setState(s => {
    const next = typeof action === 'function' ? (action as (value: T) => T)(s.present) : action;
    if (JSON.stringify(next) === JSON.stringify(s.present)) return s;
    return { past: [...s.past, s.present].slice(-100), present: next, future: [] };
  });
  const reset = (value: T) => setState({ past: [], present: value, future: [] });
  const undo = () => setState(s => s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s);
  const redo = () => setState(s => s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s);
  return { value: state.present, set, reset, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
