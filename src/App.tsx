import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from './core/store/useEditorStore';
import { useTemporalStore } from './core/hooks/useTemporalStore';
import { TopNavbar } from './components/studio/TopNavbar';
import { PhotoshopToolbar } from './components/studio/PhotoshopToolbar';
import { CanvasViewport } from './components/canvas/CanvasViewport';
import { InspectorPanel } from './components/studio/InspectorPanel';
import { ExportModal } from './components/studio/ExportModal';

export function App() {
  const artboardRef = useRef<HTMLDivElement>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const selectedSlotId = useEditorStore((s) => s.selectedSlotId);
  const selectSlot = useEditorStore((s) => s.selectSlot);
  const selectText = useEditorStore((s) => s.selectText);
  const clearSlot = useEditorStore((s) => s.clearSlot);
  const saveToStorage = useEditorStore((s) => s.saveToStorage);
  const loadFromStorage = useEditorStore((s) => s.loadFromStorage);

  const { undo, redo, canUndo, canRedo } = useTemporalStore();

  // Load saved state from IndexedDB on initial mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Debounced auto-save to IndexedDB whenever relevant store changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToStorage();
    }, 1200);
    return () => clearTimeout(timer);
  }, [saveToStorage]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        selectSlot(null);
        selectText(null);
        return;
      }

      // Delete/Backspace: Clear active slot
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSlotId) {
        e.preventDefault();
        clearSlot(selectedSlotId);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, selectedSlotId, selectSlot, selectText, clearSlot]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--neu-bg)] text-[var(--color-studio-text)]">
      {/* Top Header: Just idk. Logo (Desktop) + Quick Actions (Mobile) */}
      <TopNavbar onOpenExport={() => setIsExportOpen(true)} />

      {/* Studio Workspace: Left Photoshop-style Toolbar + Center Canvas Viewport + Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        <PhotoshopToolbar onOpenExport={() => setIsExportOpen(true)} />
        <CanvasViewport artboardRef={artboardRef} />
        <InspectorPanel />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        artboardElement={artboardRef.current}
      />
    </div>
  );
}

export default App;
