import React, { useRef } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { useTemporalStore } from '../../core/hooks/useTemporalStore';
import { compressMultipleImages } from '../../core/utils/imageCompressor';
import {
  Upload,
  Image as ImageIcon,
  Calendar,
  Shuffle,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  Sliders,
} from 'lucide-react';

interface PhotoshopToolbarProps {
  onOpenExport: () => void;
}

export const PhotoshopToolbar: React.FC<PhotoshopToolbarProps> = ({ onOpenExport }) => {
  const resetCurrentTemplate = useEditorStore((s) => s.resetCurrentTemplate);
  const bulkFillSlots = useEditorStore((s) => s.bulkFillSlots);
  const shufflePhotos = useEditorStore((s) => s.shufflePhotos);
  const calendarConfig = useEditorStore((s) => s.calendarConfig);
  const toggleDateNumbers = useEditorStore((s) => s.toggleDateNumbers);
  const setActiveInspectorTab = useEditorStore((s) => s.setActiveInspectorTab);
  const selectSlot = useEditorStore((s) => s.selectSlot);
  const selectText = useEditorStore((s) => s.selectText);
  const activeInspectorTab = useEditorStore((s) => s.activeInspectorTab);
  const selectedSlotId = useEditorStore((s) => s.selectedSlotId);
  const selectedTextId = useEditorStore((s) => s.selectedTextId);
  const isMobileInspectorOpen = useEditorStore((s) => s.isMobileInspectorOpen);
  const setIsMobileInspectorOpen = useEditorStore((s) => s.setIsMobileInspectorOpen);

  const { undo, redo, canUndo, canRedo } = useTemporalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const results = await compressMultipleImages(files);
      bulkFillSlots(results.map((r) => r.blobUrl));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isCanvasBackgroundActive =
    activeInspectorTab === 'canvas' && !selectedSlotId && !selectedTextId;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleBulkUpload}
      />

      {/* ================= DESKTOP VERTICAL PHOTOSHOP TOOLBAR ================= */}
      <aside
        aria-label="Desktop Studio Tools"
        className="hidden md:flex w-13 sm:w-14 shrink-0 bg-[#0c0e14] border-r border-white/10 flex-col items-center py-3 select-none z-20"
      >
        {/* Top Section: Media & Creative Tools */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2">
          {/* Add Photos */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-[0.94] transition-all cursor-pointer"
              aria-label="Add Photos"
            >
              <Upload className="w-4 h-4 text-blue-400" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Add Photos <span className="text-amber-300 font-mono text-[9px]">(4K Bulk)</span>
            </div>
          </div>

          {/* Background Settings */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => {
                selectSlot(null);
                selectText(null);
                setActiveInspectorTab('canvas');
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-[0.94] cursor-pointer ${
                isCanvasBackgroundActive
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Background Settings"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Background Settings
            </div>
          </div>

          {/* Date Numbers Toggle */}
          {calendarConfig?.enabled && (
            <div className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={toggleDateNumbers}
                className={`w-9 h-9 rounded-lg relative flex items-center justify-center transition-all active:scale-[0.94] cursor-pointer ${
                  calendarConfig.showDateNumbers
                    ? 'bg-blue-600/25 text-blue-200 ring-1 ring-blue-500/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Toggle Date Numbers"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                {calendarConfig.showDateNumbers && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 ring-1 ring-[#0c0e14]" />
                )}
              </button>
              <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                Date Numbers{' '}
                <span
                  className={`font-mono text-[9px] px-1 py-0.2 rounded ${
                    calendarConfig.showDateNumbers ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {calendarConfig.showDateNumbers ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          )}

          {/* Shuffle Photos */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={shufflePhotos}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-[0.94] transition-all cursor-pointer"
              aria-label="Shuffle Photos"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Shuffle Photos
            </div>
          </div>

          {/* Separator */}
          <div className="h-[1px] w-6 bg-white/10 my-1.5" />

          {/* Undo */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              disabled={!canUndo}
              onClick={() => undo()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-[0.94] disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Undo <span className="text-white/40 font-mono text-[9px]">(Ctrl+Z)</span>
            </div>
          </div>

          {/* Redo */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              disabled={!canRedo}
              onClick={() => redo()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-[0.94] disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Redo <span className="text-white/40 font-mono text-[9px]">(Ctrl+Y)</span>
            </div>
          </div>

          {/* Reset Template */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset canvas back to default?')) {
                  resetCurrentTemplate();
                }
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/10 active:scale-[0.94] transition-all cursor-pointer"
              aria-label="Reset Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Reset Layout
            </div>
          </div>
        </div>

        {/* Flexible Spacer */}
        <div className="flex-1" />

        {/* Bottom Action: Export High-Res Story (Photoshop Save / Export Icon) */}
        <div className="w-full px-2 pt-2 border-t border-white/10 flex justify-center">
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={onOpenExport}
              className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.94] text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              aria-label="Export 1080p Story"
            >
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#171b24] border border-white/10 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Export Story <span className="text-amber-300 font-semibold text-[10px]">4K / 1080p</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM TOOLS DOCK ================= */}
      <nav
        aria-label="Mobile Studio Tools"
        className="flex md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0c0e14]/95 backdrop-blur-xl border-t border-white/10 items-center justify-around px-2 z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
      >
        {/* Add Photos */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-1 px-2 text-white/75 hover:text-white active:scale-[0.92] transition-transform cursor-pointer"
          aria-label="Add Photos"
        >
          <Upload className="w-4 h-4 text-blue-400" />
          <span className="text-[9px] mt-0.5 tracking-tight">Photos</span>
        </button>

        {/* Background Settings */}
        <button
          type="button"
          onClick={() => {
            selectSlot(null);
            selectText(null);
            setActiveInspectorTab('canvas');
            setIsMobileInspectorOpen(true);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 active:scale-[0.92] transition-transform cursor-pointer ${
            isCanvasBackgroundActive
              ? 'text-amber-300'
              : 'text-white/75 hover:text-white'
          }`}
          aria-label="Background Settings"
        >
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span className="text-[9px] mt-0.5 tracking-tight">Backdrop</span>
        </button>

        {/* Date Numbers Toggle */}
        {calendarConfig?.enabled && (
          <button
            type="button"
            onClick={toggleDateNumbers}
            className={`flex flex-col items-center justify-center py-1 px-2 relative active:scale-[0.92] transition-transform cursor-pointer ${
              calendarConfig.showDateNumbers ? 'text-blue-300' : 'text-white/75 hover:text-white'
            }`}
            aria-label="Toggle Numbers"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-[9px] mt-0.5 tracking-tight">
              {calendarConfig.showDateNumbers ? 'Num ON' : 'Numbers'}
            </span>
            {calendarConfig.showDateNumbers && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </button>
        )}

        {/* Shuffle Photos */}
        <button
          type="button"
          onClick={shufflePhotos}
          className="flex flex-col items-center justify-center py-1 px-2 text-white/75 hover:text-white active:scale-[0.92] transition-transform cursor-pointer"
          aria-label="Shuffle"
        >
          <Shuffle className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 tracking-tight">Shuffle</span>
        </button>

        {/* Undo */}
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => undo()}
          className="flex flex-col items-center justify-center py-1 px-1.5 text-white/75 hover:text-white active:scale-[0.92] disabled:opacity-25 transition-transform cursor-pointer disabled:cursor-not-allowed"
          aria-label="Undo"
        >
          <Undo2 className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 tracking-tight">Undo</span>
        </button>

        {/* Redo */}
        <button
          type="button"
          disabled={!canRedo}
          onClick={() => redo()}
          className="flex flex-col items-center justify-center py-1 px-1.5 text-white/75 hover:text-white active:scale-[0.92] disabled:opacity-25 transition-transform cursor-pointer disabled:cursor-not-allowed"
          aria-label="Redo"
        >
          <Redo2 className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 tracking-tight">Redo</span>
        </button>

        {/* Adjust Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileInspectorOpen(!isMobileInspectorOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg active:scale-[0.92] transition-all cursor-pointer ${
            isMobileInspectorOpen || selectedSlotId || selectedTextId
              ? 'bg-blue-600/30 text-blue-200'
              : 'text-white/75 hover:text-white'
          }`}
          aria-label="Inspector Drawer"
        >
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Adjust</span>
        </button>

        {/* Export CTA */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg bg-blue-600 active:scale-[0.92] text-white shadow-md shadow-blue-600/30 transition-transform cursor-pointer"
          aria-label="Export"
        >
          <Download className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-semibold">Save</span>
        </button>
      </nav>
    </>
  );
};
