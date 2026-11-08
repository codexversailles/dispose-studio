import { useStore } from 'zustand';
import { useEditorStore } from '../store/useEditorStore';

export function useTemporalStore() {
  const temporal = useEditorStore.temporal;
  const pastCount = useStore(temporal, (state) => state.pastStates.length);
  const futureCount = useStore(temporal, (state) => state.futureStates.length);

  return {
    undo: (steps = 1) => temporal.getState().undo(steps),
    redo: (steps = 1) => temporal.getState().redo(steps),
    clear: () => temporal.getState().clear(),
    canUndo: pastCount > 0,
    canRedo: futureCount > 0,
    historyLength: pastCount,
  };
}
