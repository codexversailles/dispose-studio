import { useStore } from 'zustand';
import { useEditorStore, flushPendingHistory, clearPendingHistory, hasPendingHistory } from '../store/useEditorStore';

export function useTemporalStore() {
  const temporal = useEditorStore.temporal;
  const pastCount = useStore(temporal, (state) => state.pastStates.length);
  const futureCount = useStore(temporal, (state) => state.futureStates.length);
  const pending = hasPendingHistory();

  return {
    undo: (steps = 1) => {
      flushPendingHistory();
      temporal.getState().undo(steps);
    },
    redo: (steps = 1) => {
      flushPendingHistory();
      temporal.getState().redo(steps);
    },
    clear: () => {
      clearPendingHistory();
      temporal.getState().clear();
    },
    canUndo: pastCount > 0 || pending,
    canRedo: futureCount > 0,
    historyLength: pastCount + (pending ? 1 : 0),
  };
}
