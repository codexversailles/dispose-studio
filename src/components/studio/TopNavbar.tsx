import React from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { Sliders, Download } from 'lucide-react';

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
          className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all active:scale-[0.94] cursor-pointer ${
            isMobileInspectorOpen || selectedSlotId || selectedTextId
              ? 'bg-blue-600/30 border-blue-500/70 text-blue-200'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
          }`}
          aria-label="Toggle Inspector Drawer"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-medium">Adjust</span>
          {(selectedSlotId || selectedTextId) && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          )}
        </button>

        {onOpenExport && (
          <button
            type="button"
            onClick={onOpenExport}
            className="px-2.5 py-1 rounded-lg bg-blue-600 active:scale-[0.94] text-white text-[11px] font-semibold flex items-center gap-1 shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}
      </div>
    </header>
  );
};
