import React from 'react';
import { useTemporalStore } from '../../core/hooks/useTemporalStore';
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  DownloadSimple,
} from '@phosphor-icons/react';

interface TopNavbarProps {
  onOpenExport?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenExport }) => {
  const { undo, redo, canUndo, canRedo } = useTemporalStore();

  return (
    <header className="h-13 sm:h-12 border-b border-[var(--neu-border-highlight)] bg-[var(--neu-panel)] px-4 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
      {/* Brand */}
      <div className="flex items-center">
        <span className="font-sans italic font-semibold text-lg tracking-tight text-[var(--color-studio-text-bright)] [text-shadow:1px_1px_2px_rgba(0,0,0,0.8),-1px_-1px_1px_rgba(255,255,255,0.06)] cursor-default">
          idk.
        </span>
      </div>

      {/* Mobile-optimized Header Utilities (Undo, Redo, Export) */}
      <div className="flex md:hidden items-center gap-1.5">
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => undo()}
          className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center neu-button text-zinc-300 hover:text-white active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
          aria-label="Undo"
        >
          <ArrowCounterClockwise size={17} weight="bold" />
        </button>

        <button
          type="button"
          disabled={!canRedo}
          onClick={() => redo()}
          className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center neu-button text-zinc-300 hover:text-white active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
          aria-label="Redo"
        >
          <ArrowClockwise size={17} weight="bold" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {onOpenExport && (
          <button
            type="button"
            onClick={onOpenExport}
            className="min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 neu-button text-[var(--color-studio-text-bright)] border border-white/10 active:scale-95 transition-all cursor-pointer shadow-sm"
            aria-label="Export Story"
          >
            <DownloadSimple size={15} weight="bold" />
            <span className="tracking-tight">Export</span>
          </button>
        )}
      </div>
    </header>
  );
};
