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
    <header className="h-12 border-b border-white/10 bg-[#090a0d] px-4 sm:px-5 flex items-center justify-between select-none backdrop-blur-md z-30 shrink-0">
      <span className="font-sans italic font-semibold text-lg tracking-tight text-white hover:opacity-90 transition-opacity cursor-default">
        Disposé
      </span>

      {/* Mobile-only header utilities */}
      <div className="flex md:hidden items-center gap-2">
        <button
          type="button"
          onClick={() => setIsMobileInspectorOpen(!isMobileInspectorOpen)}
          className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer ${
            isMobileInspectorOpen || selectedSlotId || selectedTextId
              ? 'bg-white text-black border-white font-medium'
              : 'bg-white/5 border-white/15 text-white/80 hover:text-white hover:border-white/30'
          }`}
          aria-label="Toggle Inspector Drawer"
        >
          <SlidersHorizontal size={14} weight="bold" />
          <span className="text-[11px]">Adjust</span>
          {(selectedSlotId || selectedTextId) && (
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          )}
        </button>

        {onOpenExport && (
          <button
            type="button"
            onClick={onOpenExport}
            className="px-2.5 py-1 rounded-lg bg-white text-black border border-white active:scale-[0.97] text-[11px] font-medium flex items-center gap-1 transition-opacity hover:opacity-90 cursor-pointer"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export</span>
          </button>
        )}
      </div>
    </header>
  );
};
