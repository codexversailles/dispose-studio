import { useStore } from 'zustand';
import { useEditorStore } from '../store/useEditorStore';

export function useTemporalStore() {
  const temporal = useEditorStore.temporal;
  const undo = useStore(temporal, (state) => state.undo);
  const redo = useStore(temporal, (state) => state.redo);
  const clear = useStore(temporal, (state) => state.clear);
  const pastCount = useStore(temporal, (state) => state.pastStates.length);
  const futureCount = useStore(temporal, (state) => state.futureStates.length);

  return {
    undo: () => undo(),
    redo: () => redo(),
    clear: () => clear(),
    canUndo: pastCount > 0,
    canRedo: futureCount > 0,
    historyLength: pastCount,
  };
}
