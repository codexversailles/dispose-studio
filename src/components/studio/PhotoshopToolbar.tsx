import React, { useRef } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { useTemporalStore } from '../../core/hooks/useTemporalStore';
import { compressMultipleImages } from '../../core/utils/imageCompressor';
import {
  UploadSimple,
  ImageSquare,
  SquaresFour,
  CalendarBlank,
  Plus,
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
  const calendarConfig = useEditorStore((s) => s.calendarConfig);
  const toggleDateNumbers = useEditorStore((s) => s.toggleDateNumbers);
  const setActiveInspectorTab = useEditorStore((s) => s.setActiveInspectorTab);
  const selectSlot = useEditorStore((s) => s.selectSlot);
  const selectText = useEditorStore((s) => s.selectText);
  const activeInspectorTab = useEditorStore((s) => s.activeInspectorTab);
  const selectedSlotId = useEditorStore((s) => s.selectedSlotId);
  const selectedTextId = useEditorStore((s) => s.selectedTextId);
  const isGridSelected = useEditorStore((s) => s.isGridSelected);
  const selectGrid = useEditorStore((s) => s.selectGrid);
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

          {/* Grid Selection & Settings */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => selectGrid(!isGridSelected)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                isGridSelected
                  ? 'neu-button-active text-white'
                  : 'neu-button text-zinc-300 hover:text-white'
              }`}
              aria-label="Select Photo Grid"
            >
              <SquaresFour size={18} weight="bold" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl neu-raised text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left">
              Select & move grid
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

      {/* ================= MOBILE FLOATING PLUS BUTTON (ADD PHOTOS) ================= */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex md:hidden fixed bottom-20 right-4 sm:right-6 z-30 w-14 h-14 rounded-full items-center justify-center bg-zinc-100 text-zinc-950 shadow-[0_8px_24px_rgba(0,0,0,0.65)] active:scale-90 active:shadow-sm transition-all cursor-pointer border border-white/40 select-none"
        aria-label="Add Photos FAB"
        title="Add photos"
      >
        <Plus size={26} weight="bold" />
      </button>

      {/* ================= MOBILE BOTTOM TOOLS DOCK ================= */}
      <nav
        aria-label="Mobile Studio Tools Dock"
        className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--neu-panel)] border-t border-[var(--neu-border-highlight)] items-center justify-around px-4 z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.65)]"
      >
        {/* 1. Grid Selection & Positioning */}
        <button
          type="button"
          onClick={() => {
            selectGrid(!isGridSelected);
            setIsMobileInspectorOpen(true);
          }}
          className={`min-h-[48px] min-w-[64px] flex-1 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
            isGridSelected
              ? 'neu-button-active text-white font-medium'
              : 'text-zinc-300 hover:text-white'
          }`}
          aria-label="Select Grid"
        >
          <SquaresFour size={20} weight="bold" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Grid</span>
        </button>

        {/* 2. Backdrop / Canvas Settings */}
        <button
          type="button"
          onClick={() => {
            selectSlot(null);
            selectText(null);
            setActiveInspectorTab('canvas');
            setIsMobileInspectorOpen(true);
          }}
          className={`min-h-[48px] min-w-[64px] flex-1 flex flex-col items-center justify-center rounded-xl active:scale-95 transition-all cursor-pointer ${
            isCanvasBackgroundActive
              ? 'neu-button-active text-white font-medium'
              : 'text-zinc-300 hover:text-white'
          }`}
          aria-label="Backdrop Settings"
        >
          <ImageSquare size={20} weight="bold" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Backdrop</span>
        </button>

        {/* 3. Adjust Inspector Drawer */}
        <button
          type="button"
          onClick={() => setIsMobileInspectorOpen(!isMobileInspectorOpen)}
          className={`min-h-[48px] min-w-[64px] flex-1 flex flex-col items-center justify-center rounded-xl relative active:scale-95 transition-all cursor-pointer ${
            isMobileInspectorOpen
              ? 'neu-button-active text-white font-medium'
              : 'text-zinc-300 hover:text-white'
          }`}
          aria-label="Toggle Inspector Drawer"
        >
          <div className="relative">
            <SlidersHorizontal size={20} weight="bold" />
            {(selectedSlotId || selectedTextId || isGridSelected) && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                title="Active element selected"
              />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Adjust</span>
        </button>
      </nav>
    </>
  );
};
