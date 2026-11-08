import React, { useRef } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { useTemporalStore } from '../../core/hooks/useTemporalStore';
import { compressMultipleImages } from '../../core/utils/imageCompressor';
import {
  UploadSimple,
  ImageSquare,
  CalendarBlank,
  Shuffle,
  ArrowCounterClockwise,
  ArrowClockwise,
  ArrowsClockwise,
  DownloadSimple,
  SlidersHorizontal,
} from '@phosphor-icons/react';

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
        className="hidden md:flex w-13 sm:w-14 shrink-0 bg-[var(--neu-panel)] border-r border-[var(--neu-border-highlight)] flex-col items-center py-3 select-none z-20 shadow-[4px_0_16px_rgba(0,0,0,0.35)]"
      >
        {/* Top Section: Media & Creative Tools */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {/* Add Photos */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl flex items-center justify-center neu-button text-zinc-300 hover:text-white cursor-pointer"
              aria-label="Add Photos"
            >
              <UploadSimple size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl flex items-center justify-between gap-3 text-left">
              <span>Add photos</span>
              <span className="text-zinc-400 text-[10px] text-right">4K</span>
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
              className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                isCanvasBackgroundActive
                  ? 'neu-button-active text-white'
                  : 'neu-button text-zinc-300 hover:text-white'
              }`}
              aria-label="Background Settings"
            >
              <ImageSquare size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left">
              Background settings
            </div>
          </div>

          {/* Date Numbers Toggle */}
          {calendarConfig?.enabled && (
            <div className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={toggleDateNumbers}
                className={`w-9 h-9 rounded-xl relative flex items-center justify-center cursor-pointer ${
                  calendarConfig.showDateNumbers
                    ? 'neu-button-active text-white'
                    : 'neu-button text-zinc-300 hover:text-white'
                }`}
                aria-label="Toggle Date Numbers"
              >
                <CalendarBlank size={18} weight="bold" />
                {calendarConfig.showDateNumbers && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl flex items-center justify-between gap-3 text-left">
                <span>Date numbers</span>
                <span className="text-zinc-400 text-[10px] text-right">
                  {calendarConfig.showDateNumbers ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          )}

          {/* Shuffle Photos */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={shufflePhotos}
              className="w-9 h-9 rounded-xl flex items-center justify-center neu-button text-zinc-300 hover:text-white cursor-pointer"
              aria-label="Shuffle Photos"
            >
              <Shuffle size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left">
              Shuffle photos
            </div>
          </div>

          {/* Separator / Molded Groove */}
          <div className="h-[1px] w-6 bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.04)] my-1.5" />

          {/* Undo */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              disabled={!canUndo}
              onClick={() => undo()}
              className="w-9 h-9 rounded-xl flex items-center justify-center neu-button text-zinc-300 hover:text-white disabled:opacity-25 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Undo"
            >
              <ArrowCounterClockwise size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl flex items-center justify-between gap-3 text-left">
              <span>Undo</span>
              <span className="text-zinc-400 text-[10px] text-right">Ctrl+Z</span>
            </div>
          </div>

          {/* Redo */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              disabled={!canRedo}
              onClick={() => redo()}
              className="w-9 h-9 rounded-xl flex items-center justify-center neu-button text-zinc-300 hover:text-white disabled:opacity-25 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Redo"
            >
              <ArrowClockwise size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl flex items-center justify-between gap-3 text-left">
              <span>Redo</span>
              <span className="text-zinc-400 text-[10px] text-right">Ctrl+Y</span>
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
              className="w-9 h-9 rounded-xl flex items-center justify-center neu-button text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Reset Canvas"
            >
              <ArrowsClockwise size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left">
              Reset layout
            </div>
          </div>
        </div>

        {/* Flexible Spacer */}
        <div className="flex-1" />

        {/* Bottom Action: Export High-Res Story */}
        <div className="w-full px-2 pt-2 border-t border-[var(--neu-border-highlight)] flex justify-center">
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={onOpenExport}
              className="w-9 h-9 rounded-xl neu-button text-white flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              aria-label="Export Story"
            >
              <DownloadSimple size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl flex items-center justify-between gap-3 text-left">
              <span>Export story</span>
              <span className="text-zinc-400 text-[10px] text-right">4K / 1080p</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM TOOLS DOCK ================= */}
      <nav
        aria-label="Mobile Studio Tools"
        className="flex md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--neu-panel)] border-t border-[var(--neu-border-highlight)] items-center justify-around px-2 z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.55)]"
      >
        {/* Add Photos */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-1 px-2 text-zinc-300 hover:text-white active:scale-[0.97] transition-transform cursor-pointer"
          aria-label="Add Photos"
        >
          <UploadSimple size={18} weight="bold" />
          <span className="text-[9px] mt-0.5 tracking-normal">Photos</span>
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
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl active:scale-[0.97] transition-transform cursor-pointer ${
            isCanvasBackgroundActive
              ? 'neu-pressed-sm text-white font-medium'
              : 'text-zinc-300 hover:text-white'
          }`}
          aria-label="Background Settings"
        >
          <ImageSquare size={18} weight="bold" />
          <span className="text-[9px] mt-0.5 tracking-normal">Backdrop</span>
        </button>

        {/* Date Numbers Toggle */}
        {calendarConfig?.enabled && (
          <button
            type="button"
            onClick={toggleDateNumbers}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl relative active:scale-[0.97] transition-transform cursor-pointer ${
              calendarConfig.showDateNumbers ? 'neu-pressed-sm text-white font-medium' : 'text-zinc-300 hover:text-white'
            }`}
            aria-label="Toggle Numbers"
          >
            <CalendarBlank size={18} weight="bold" />
            <span className="text-[9px] mt-0.5 tracking-normal">
              {calendarConfig.showDateNumbers ? 'Num on' : 'Numbers'}
            </span>
            {calendarConfig.showDateNumbers && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
            )}
          </button>
        )}

        {/* Shuffle Photos */}
        <button
          type="button"
          onClick={shufflePhotos}
          className="flex flex-col items-center justify-center py-1 px-2 text-zinc-300 hover:text-white active:scale-[0.97] transition-transform cursor-pointer"
          aria-label="Shuffle"
        >
          <Shuffle size={18} weight="bold" />
          <span className="text-[9px] mt-0.5 tracking-normal">Shuffle</span>
        </button>

        {/* Undo */}
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => undo()}
          className="flex flex-col items-center justify-center py-1 px-1.5 text-zinc-300 hover:text-white active:scale-[0.97] disabled:opacity-25 transition-transform cursor-pointer disabled:cursor-not-allowed"
          aria-label="Undo"
        >
          <ArrowCounterClockwise size={18} weight="bold" />
          <span className="text-[9px] mt-0.5 tracking-normal">Undo</span>
        </button>

        {/* Redo */}
        <button
          type="button"
          disabled={!canRedo}
          onClick={() => redo()}
          className="flex flex-col items-center justify-center py-1 px-1.5 text-zinc-300 hover:text-white active:scale-[0.97] disabled:opacity-25 transition-transform cursor-pointer disabled:cursor-not-allowed"
          aria-label="Redo"
        >
          <ArrowClockwise size={18} weight="bold" />
          <span className="text-[9px] mt-0.5 tracking-normal">Redo</span>
        </button>

        {/* Adjust Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileInspectorOpen(!isMobileInspectorOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl active:scale-[0.97] transition-all cursor-pointer ${
            isMobileInspectorOpen || selectedSlotId || selectedTextId
              ? 'neu-pressed-sm text-white font-medium'
              : 'text-zinc-300 hover:text-white'
          }`}
          aria-label="Inspector Drawer"
        >
          <SlidersHorizontal size={18} weight="bold" />
          <span className="text-[9px] mt-0.5 tracking-normal">Adjust</span>
        </button>

        {/* Export CTA */}
        <button
          type="button"
          onClick={onOpenExport}
          className="neu-button flex flex-col items-center justify-center py-1 px-3 rounded-xl active:scale-[0.97] transition-transform cursor-pointer text-white"
          aria-label="Export"
        >
          <DownloadSimple size={18} weight="bold" />
          <span className="text-[9px] mt-0.5 font-medium">Save</span>
        </button>
      </nav>
    </>
  );
};
