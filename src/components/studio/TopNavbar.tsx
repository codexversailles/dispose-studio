import React from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { SlidersHorizontal, DownloadSimple } from '@phosphor-icons/react';

interface TopNavbarProps {
  onOpenExport?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenExport }) => {
  const isMobileInspectorOpen = useEditorStore((s) => s.isMobileInspectorOpen);
  const setIsMobileInspectorOpen = useEditorStore((s) => s.setIsMobileInspectorOpen);
  const selectedSlotId = useEditorStore((s) => s.selectedSlotId);
  const selectedTextId = useEditorStore((s) => s.selectedTextId);

  return (
    <header className="h-12 border-b border-[var(--neu-border-highlight)] bg-[var(--neu-panel)] px-4 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      <span className="font-sans italic font-semibold text-lg tracking-tight text-[var(--color-studio-text-bright)] [text-shadow:1px_1px_2px_rgba(0,0,0,0.8),-1px_-1px_1px_rgba(255,255,255,0.06)] cursor-default">
        Disposé
      </span>

      {/* Mobile-only header utilities */}
      <div className="flex md:hidden items-center gap-2">
        <button
          type="button"
          onClick={() => setIsMobileInspectorOpen(!isMobileInspectorOpen)}
          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer ${
            isMobileInspectorOpen || selectedSlotId || selectedTextId
              ? 'neu-button-active font-medium'
              : 'neu-button text-zinc-300'
          }`}
          aria-label="Toggle Inspector Drawer"
        >
          <SlidersHorizontal size={14} weight="bold" />
          <span className="text-[11px]">Adjust</span>
          {(selectedSlotId || selectedTextId) && (
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
          )}
        </button>

        {onOpenExport && (
          <button
            type="button"
            onClick={onOpenExport}
            className="neu-button px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 cursor-pointer text-[var(--color-studio-text-bright)]"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export</span>
          </button>
        )}
      </div>
    </header>
  );
};
