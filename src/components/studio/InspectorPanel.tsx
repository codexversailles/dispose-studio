import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../core/store/useEditorStore';
import { compressImageFile } from '../../core/utils/imageCompressor';
import { MONTH_NAMES_CAPITAL, WEEKDAYS_SUN_START, WEEKDAYS_MON_START } from '../../core/utils/calendarGenerator';
import {
  SlidersHorizontal,
  ImageSquare,
  TextT,
  CalendarBlank,
  Stack,
  Square,
  UploadSimple,
  ArrowsClockwise,
  Trash,
  ArrowsLeftRight,
  EyeSlash,
  Sun,
  GridFour,
  X,
} from '@phosphor-icons/react';

export const InspectorPanel: React.FC = () => {
  const selectedSlotId = useEditorStore((s) => s.selectedSlotId);
  const selectedTextId = useEditorStore((s) => s.selectedTextId);
  const activeInspectorTab = useEditorStore((s) => s.activeInspectorTab);
  const setActiveInspectorTab = useEditorStore((s) => s.setActiveInspectorTab);
  const selectSlot = useEditorStore((s) => s.selectSlot);
  const selectText = useEditorStore((s) => s.selectText);
  const isMobileInspectorOpen = useEditorStore((s) => s.isMobileInspectorOpen);
  const setIsMobileInspectorOpen = useEditorStore((s) => s.setIsMobileInspectorOpen);
  const isGridSelected = useEditorStore((s) => s.isGridSelected);
  const selectGrid = useEditorStore((s) => s.selectGrid);

  // Store data & actions
  const background = useEditorStore((s) => s.background);
  const updateBackground = useEditorStore((s) => s.updateBackground);
  const gridConfig = useEditorStore((s) => s.gridConfig);
  const updateGridConfig = useEditorStore((s) => s.updateGridConfig);
  const updateGridPosition = useEditorStore((s) => s.updateGridPosition);
  const calendarConfig = useEditorStore((s) => s.calendarConfig);
  const updateCalendarConfig = useEditorStore((s) => s.updateCalendarConfig);
  const toggleDateNumbers = useEditorStore((s) => s.toggleDateNumbers);
  const applyMonthCalendar = useEditorStore((s) => s.applyMonthCalendar);

  const slots = useEditorStore((s) => s.slots);
  const updateSlot = useEditorStore((s) => s.updateSlot);
  const updateSlotImage = useEditorStore((s) => s.updateSlotImage);
  const clearSlot = useEditorStore((s) => s.clearSlot);
  const swapSlots = useEditorStore((s) => s.swapSlots);
  const toggleSlotBorder = useEditorStore((s) => s.toggleSlotBorder);
  const setSlotFrameStyle = useEditorStore((s) => s.setSlotFrameStyle);

  const textLayers = useEditorStore((s) => s.textLayers);
  const updateText = useEditorStore((s) => s.updateText);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);

  // Active entities
  const activeSlot = selectedSlotId ? slots[selectedSlotId] : null;
  const activeText = selectedTextId ? textLayers[selectedTextId] : null;

  // Handle custom background image upload
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const compressed = await compressImageFile(e.target.files[0], 3840, 0.92);
        updateBackground({ imageUrl: compressed.blobUrl });
      } catch (err) {
        console.error('Failed to compress background image:', err);
      }
    }
    if (bgFileInputRef.current) bgFileInputRef.current.value = '';
  };

  // Handle slot photo replacement
  const handleSlotPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedSlotId && e.target.files && e.target.files.length > 0) {
      try {
        const compressed = await compressImageFile(e.target.files[0], 3840, 0.92);
        updateSlotImage(selectedSlotId, compressed.blobUrl);
      } catch (err) {
        console.error('Failed to update slot photo:', err);
      }
    }
    if (slotFileInputRef.current) slotFileInputRef.current.value = '';
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileInspectorOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileInspectorOpen(false)}
        />
      )}

      <aside
        aria-label="Inspector Panel"
        className={`fixed inset-x-0 bottom-0 z-50 md:relative md:z-20 md:w-84 h-[75vh] md:h-full border-t md:border-t-0 md:border-l border-[var(--neu-border-highlight)] bg-[var(--neu-panel)] rounded-t-3xl md:rounded-none flex flex-col text-white select-none overflow-hidden shadow-[-6px_0_20px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
          isMobileInspectorOpen
            ? 'translate-y-0'
            : 'translate-y-full md:translate-y-0 pointer-events-none md:pointer-events-auto'
        }`}
      >
        {/* Mobile Pull Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto my-2 shrink-0 md:hidden" />

        {/* Hidden file inputs */}
        <input
          ref={bgFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBgUpload}
        />
        <input
          ref={slotFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSlotPhotoUpload}
        />

        {/* Top Header / Mode Switcher */}
        <div className="p-3.5 border-b border-[var(--neu-border-highlight)] flex items-center justify-between bg-[var(--neu-panel)]">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-tight text-white text-left">
            <SlidersHorizontal size={15} weight="bold" />
            <span>
              {selectedSlotId
                ? `Photo slot (${selectedSlotId})`
                : selectedTextId
                ? `Text layer (${selectedTextId})`
                : 'Studio inspector'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-right">
            {(selectedSlotId || selectedTextId) && (
              <button
                type="button"
                onClick={() => {
                  selectSlot(null);
                  selectText(null);
                  setActiveInspectorTab('canvas');
                }}
                className="text-[11px] text-zinc-400 hover:text-white font-medium cursor-pointer"
              >
                Deselect
              </button>
            )}

            {/* Mobile close drawer button */}
            <button
              type="button"
              onClick={() => setIsMobileInspectorOpen(false)}
              className="p-1.5 rounded-xl neu-button text-zinc-300 hover:text-white md:hidden cursor-pointer"
              aria-label="Close Inspector"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        </div>

      {/* Navigation Sub-Tabs (Neumorphic Recessed Well) */}
      <div className="neu-well p-1.5 mx-3 mt-3 rounded-2xl flex gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveInspectorTab('canvas')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
            activeInspectorTab === 'canvas' && !selectedSlotId && !selectedTextId
              ? 'neu-button-active text-white font-medium'
              : 'neu-button text-zinc-400 hover:text-white'
          }`}
        >
          <Stack size={14} weight="bold" />
          <span>Canvas</span>
        </button>

        {calendarConfig?.enabled && (
          <button
            type="button"
            onClick={() => setActiveInspectorTab('calendar')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
              activeInspectorTab === 'calendar'
                ? 'neu-button-active text-white font-medium'
                : 'neu-button text-zinc-400 hover:text-white'
            }`}
          >
            <CalendarBlank size={14} weight="bold" />
            <span>Calendar</span>
          </button>
        )}

        {selectedSlotId && (
          <button
            type="button"
            onClick={() => setActiveInspectorTab('slot')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
              activeInspectorTab === 'slot'
                ? 'neu-button-active text-white font-medium'
                : 'neu-button text-zinc-400 hover:text-white'
            }`}
          >
            <ImageSquare size={14} weight="bold" />
            <span>Slot</span>
          </button>
        )}

        {selectedTextId && (
          <button
            type="button"
            onClick={() => setActiveInspectorTab('text')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
              activeInspectorTab === 'text'
                ? 'neu-button-active text-white font-medium'
                : 'neu-button text-zinc-400 hover:text-white'
            }`}
          >
            <TextT size={14} weight="bold" />
            <span>Text</span>
          </button>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
        {/* ================= SLOT INSPECTOR ================= */}
        {selectedSlotId && activeSlot && activeInspectorTab === 'slot' && (
          <div className="space-y-5">
            {/* Slot Photo Preview & Replacement */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-400 block text-left">
                Photo frame
              </label>

              {activeSlot.imageUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden neu-well border border-[var(--neu-border-highlight)]">
                  <img
                    src={activeSlot.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${activeSlot.scale}) translate(${activeSlot.x}%, ${activeSlot.y}%)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => slotFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl neu-button text-white font-medium text-[11px] cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => clearSlot(selectedSlotId)}
                      className="px-3 py-1.5 rounded-xl neu-button text-zinc-300 font-medium text-[11px] cursor-pointer"
                    >
                      Empty
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => slotFileInputRef.current?.click()}
                  className="w-full py-6 neu-well hover:border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <UploadSimple size={20} weight="bold" />
                  <span>Choose photo for slot</span>
                </button>
              )}
            </div>

            {/* Frame Style State */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-400 block text-left">
                Cell appearance
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 neu-well rounded-2xl text-center">
                <button
                  type="button"
                  onClick={() => setSlotFrameStyle(selectedSlotId, 'photo')}
                  className={`py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeSlot.frameStyle === 'photo'
                      ? 'neu-button-active text-white font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => setSlotFrameStyle(selectedSlotId, 'empty-bordered')}
                  className={`py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeSlot.frameStyle === 'empty-bordered'
                      ? 'neu-button-active text-white font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Empty border
                </button>
                <button
                  type="button"
                  onClick={() => setSlotFrameStyle(selectedSlotId, 'hidden')}
                  className={`py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeSlot.frameStyle === 'hidden'
                      ? 'neu-button-active text-white font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Hidden
                </button>
              </div>
            </div>

            {/* Crop & Zoom Sliders (if photo filled) */}
            {activeSlot.imageUrl && (
              <div className="space-y-4 pt-3 border-t border-[var(--neu-border-highlight)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white/90 text-left">Zoom scale</span>
                  <span className="text-zinc-400 text-right tabular-nums">{activeSlot.scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.05"
                  value={activeSlot.scale}
                  onChange={(e) =>
                    updateSlot(selectedSlotId, { scale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-white"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400 text-left">Pan X</span>
                      <span className="text-white text-right tabular-nums">{activeSlot.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={activeSlot.x}
                      onChange={(e) =>
                        updateSlot(selectedSlotId, { x: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-400 text-left">Pan Y</span>
                      <span className="text-white text-right tabular-nums">{activeSlot.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={activeSlot.y}
                      onChange={(e) =>
                        updateSlot(selectedSlotId, { y: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateSlot(selectedSlotId, { scale: 1.0, x: 0, y: 0 })}
                  className="w-full py-2 rounded-xl neu-button flex items-center justify-center gap-1.5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  <ArrowsClockwise size={14} weight="bold" />
                  <span>Reset crop to fit</span>
                </button>
              </div>
            )}

            {/* Frame Border Controls */}
            <div className="space-y-3 pt-3 border-t border-[var(--neu-border-highlight)]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white/90 text-left">Show frame border</span>
                <input
                  type="checkbox"
                  checked={activeSlot.hasBorder}
                  onChange={() => toggleSlotBorder(selectedSlotId)}
                  className="accent-white w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {activeSlot.hasBorder && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-left">Border thickness</span>
                    <span className="text-white text-right tabular-nums">{activeSlot.borderWidth || 1.5}px</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.5"
                    value={activeSlot.borderWidth || 1.5}
                    onChange={(e) =>
                      updateSlot(selectedSlotId, { borderWidth: parseFloat(e.target.value) })
                    }
                    className="w-full accent-white"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-left">Border color</span>
                    <input
                      type="color"
                      value={activeSlot.borderColor || '#ffffff'}
                      onChange={(e) =>
                        updateSlot(selectedSlotId, { borderColor: e.target.value })
                      }
                      className="w-7 h-7 rounded-lg neu-well p-0.5 border border-[var(--neu-border-highlight)] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Swap with Another Slot */}
            <div className="space-y-2 pt-3 border-t border-[var(--neu-border-highlight)]">
              <label className="text-[11px] font-medium text-zinc-400 block text-left">
                Swap cell with
              </label>
              <div className="flex items-center gap-2">
                <ArrowsLeftRight size={16} weight="bold" className="text-zinc-500" />
                <select
                  className="flex-1 neu-input px-3 py-2 rounded-xl text-xs text-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      swapSlots(selectedSlotId, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select another slot to swap...
                  </option>
                  {Object.keys(slots)
                    .filter((id) => id !== selectedSlotId)
                    .map((id) => (
                      <option key={id} value={id} className="bg-[#141820]">
                        {id} {slots[id].imageUrl ? '(Has Photo)' : '(Empty)'}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= TEXT LAYER INSPECTOR ================= */}
        {selectedTextId && activeText && activeInspectorTab === 'text' && (
          <div className="space-y-5">
            {/* Content Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-400 block text-left">
                  Text content
                </label>
                <span className="text-[10px] text-zinc-500 text-right tabular-nums">
                  {activeText.content.length} chars
                </span>
              </div>
              <textarea
                rows={5}
                value={activeText.content}
                onChange={(e) => updateText(selectedTextId, { content: e.target.value })}
                placeholder="Enter caption or title..."
                className="w-full min-h-[90px] neu-input rounded-2xl p-3 text-white resize-y font-sans text-xs leading-relaxed"
              />
            </div>

            {/* Typography Face & Size */}
            <div className="space-y-3">
              <label className="text-[11px] font-medium text-zinc-400 block text-left">
                Font family
              </label>
              <select
                value={activeText.fontFamily}
                onChange={(e) =>
                  updateText(selectedTextId, {
                    fontFamily: e.target.value as any,
                  })
                }
                className="w-full neu-input rounded-xl px-3 py-2 text-white"
              >
                <option value="Arial Light" className="bg-[#141820]">
                  Arial Light (Clean Minimalist · Default)
                </option>
                <option value="Arial" className="bg-[#141820]">
                  Arial (Standard Multi-weight)
                </option>
                <option value="Helvetica Neue" className="bg-[#141820]">
                  Helvetica Neue (Swiss Modernist)
                </option>
                <option value="Ralphi Sans" className="bg-[#141820]">
                  Ralphi Sans (Swiss Primary)
                </option>
                <option value="SF Pro Display" className="bg-[#141820]">
                  SF Pro Display (Apple Editorial)
                </option>
                <option value="Instagram Sans" className="bg-[#141820]">
                  Instagram Sans (Story Display)
                </option>
                <option value="Inter" className="bg-[#141820]">
                  Inter (Neutral Sans)
                </option>
                <option value="JetBrains Mono" className="bg-[#141820]">
                  JetBrains Mono (Timestamp)
                </option>
              </select>

              {/* Font Weight Selector */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-left">Font weight</span>
                  <span className="text-zinc-400 text-right text-[10px] tabular-nums">
                    {activeText.fontWeight}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 p-1 neu-well rounded-2xl text-center">
                  {[
                    { weight: 300, label: 'Light' },
                    { weight: 400, label: 'Reg' },
                    { weight: 500, label: 'Med' },
                    { weight: 700, label: 'Bold' },
                    { weight: 800, label: 'Heavy' },
                  ].map(({ weight, label }) => {
                    const isCurrent = Number(activeText.fontWeight) === weight;
                    return (
                      <button
                        key={weight}
                        type="button"
                        onClick={() => updateText(selectedTextId, { fontWeight: weight })}
                        className={`py-1.5 rounded-xl text-[10px] transition-all cursor-pointer ${
                          isCurrent
                            ? 'neu-button-active text-white font-semibold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                        title={`${label} (${weight})`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Style: Italic Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400 text-left">Italic slant</span>
                <button
                  type="button"
                  onClick={() => updateText(selectedTextId, { italic: !activeText.italic })}
                  className={`px-3 py-1.5 rounded-xl text-xs italic font-medium cursor-pointer ${
                    activeText.italic
                      ? 'neu-button-active text-white'
                      : 'neu-button text-zinc-400 hover:text-white'
                  }`}
                >
                  Italic
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-left">Font size</span>
                <span className="text-white text-right tabular-nums">{activeText.fontSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="36"
                value={activeText.fontSize}
                onChange={(e) =>
                  updateText(selectedTextId, { fontSize: parseInt(e.target.value, 10) })
                }
                className="w-full accent-white"
              />
            </div>

            {/* Color & Alignment */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--neu-border-highlight)]">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1 text-left">Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeText.color.startsWith('#') ? activeText.color : '#ffffff'}
                    onChange={(e) => updateText(selectedTextId, { color: e.target.value })}
                    className="w-7 h-7 rounded-lg neu-well p-0.5 border border-[var(--neu-border-highlight)] cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-400 text-right tabular-nums">{activeText.color}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1 text-left">Align</span>
                <div className="flex gap-1 neu-well p-1 rounded-xl">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => updateText(selectedTextId, { align: a })}
                      className={`flex-1 py-1 rounded-lg capitalize text-[10px] cursor-pointer ${
                        activeText.align === a ? 'neu-button-active text-white font-medium' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2 pt-3 border-t border-[var(--neu-border-highlight)]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-left">Letter spacing</span>
                <span className="text-white text-right tabular-nums">{activeText.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="4.0"
                step="0.2"
                value={activeText.letterSpacing}
                onChange={(e) =>
                  updateText(selectedTextId, { letterSpacing: parseFloat(e.target.value) })
                }
                className="w-full accent-white"
              />
            </div>

            {/* Drop Shadow for Readability */}
            <div className="space-y-3 pt-3 border-t border-[var(--neu-border-highlight)]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white/90 text-left">Drop shadow</span>
                <input
                  type="checkbox"
                  checked={activeText.shadow?.enabled ?? true}
                  onChange={(e) =>
                    updateText(selectedTextId, {
                      shadow: {
                        ...(activeText.shadow || {
                          blur: 4,
                          color: 'rgba(0,0,0,0.6)',
                          offsetX: 0,
                          offsetY: 1,
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-white w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {activeText.shadow?.enabled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span className="text-left">Shadow blur</span>
                    <span className="text-white text-right tabular-nums">{activeText.shadow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={activeText.shadow.blur}
                    onChange={(e) =>
                      updateText(selectedTextId, {
                        shadow: {
                          ...activeText.shadow!,
                          blur: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full accent-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= CALENDAR CONTROLS ================= */}
        {activeInspectorTab === 'calendar' && calendarConfig?.enabled && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-400 block text-left">
                Target month & year
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={calendarConfig.month}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10);
                    applyMonthCalendar(calendarConfig.year, m, calendarConfig.startDay);
                  }}
                  className="neu-input rounded-xl p-2.5 text-white"
                >
                  {MONTH_NAMES_CAPITAL.map((name, idx) => (
                    <option key={name} value={idx + 1} className="bg-[#141820]">
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={calendarConfig.year}
                  onChange={(e) => {
                    const y = parseInt(e.target.value, 10);
                    applyMonthCalendar(y, calendarConfig.month, calendarConfig.startDay);
                  }}
                  className="neu-input rounded-xl p-2.5 text-white"
                >
                  <option value={2025} className="bg-[#141820]">2025</option>
                  <option value={2026} className="bg-[#141820]">2026</option>
                  <option value={2027} className="bg-[#141820]">2027</option>
                </select>
              </div>
            </div>

            {/* Weekday Start Day */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-400 block text-left">
                Week starts on
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 neu-well rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    updateCalendarConfig({
                      startDay: 'sun',
                      weekdays: WEEKDAYS_SUN_START,
                    });
                    applyMonthCalendar(calendarConfig.year, calendarConfig.month, 'sun');
                  }}
                  className={`py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                    calendarConfig.startDay === 'sun'
                      ? 'neu-button-active text-white font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sunday
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateCalendarConfig({
                      startDay: 'mon',
                      weekdays: WEEKDAYS_MON_START,
                    });
                    applyMonthCalendar(calendarConfig.year, calendarConfig.month, 'mon');
                  }}
                  className={`py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                    calendarConfig.startDay === 'mon'
                      ? 'neu-button-active text-white font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Monday
                </button>
              </div>
            </div>

            {/* Weekday Header Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--neu-border-highlight)]">
              <span className="font-medium text-white/90 text-left">Show weekday header</span>
              <input
                type="checkbox"
                checked={calendarConfig.showWeekdayHeader}
                onChange={(e) =>
                  updateCalendarConfig({ showWeekdayHeader: e.target.checked })
                }
                className="accent-white w-4 h-4 rounded cursor-pointer"
              />
            </div>

            {/* Weekday Header Typography Customizer */}
            {calendarConfig.showWeekdayHeader && (
              <div className="space-y-3 p-3.5 neu-well rounded-2xl text-xs">
                <span className="text-[10px] font-medium text-zinc-400 block text-left">
                  Weekday header font
                </span>

                {/* Font Family */}
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1 text-left">Family</span>
                  <select
                    value={calendarConfig.weekdayFontFamily || 'Arial Light'}
                    onChange={(e) =>
                      updateCalendarConfig({
                        weekdayFontFamily: e.target.value as any,
                      })
                    }
                    className="w-full neu-input rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="Arial Light">Arial Light (Clean Minimalist · Default)</option>
                    <option value="Arial">Arial (Standard Multi-weight)</option>
                    <option value="Helvetica Neue">Helvetica Neue (Swiss Modernist)</option>
                    <option value="Ralphi Sans">Ralphi Sans (Swiss Primary)</option>
                    <option value="SF Pro Display">SF Pro Display (Apple Editorial)</option>
                    <option value="Instagram Sans">Instagram Sans (Story Display)</option>
                    <option value="Inter">Inter (Neutral Sans)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Timestamp)</option>
                  </select>
                </div>

                {/* Font Weight */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 text-left">Weight</span>
                    <span className="text-[10px] text-zinc-400 text-right tabular-nums">
                      {calendarConfig.weekdayFontWeight || 500}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-1 neu-well rounded-2xl text-center">
                    {[
                      { weight: 300, label: 'Light' },
                      { weight: 400, label: 'Reg' },
                      { weight: 500, label: 'Med' },
                      { weight: 700, label: 'Bold' },
                      { weight: 800, label: 'Heavy' },
                    ].map(({ weight, label }) => {
                      const isCur = (calendarConfig.weekdayFontWeight || 500) === weight;
                      return (
                        <button
                          key={weight}
                          type="button"
                          onClick={() => updateCalendarConfig({ weekdayFontWeight: weight })}
                          className={`py-1 rounded-xl text-[9.5px] transition-all cursor-pointer ${
                            isCur
                              ? 'neu-button-active text-white font-semibold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size & Letter Spacing */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-zinc-400 text-left">Size</span>
                      <span className="text-white text-right tabular-nums">{calendarConfig.weekdayFontSize || 9.5}px</span>
                    </div>
                    <input
                      type="range"
                      min="7"
                      max="14"
                      step="0.5"
                      value={calendarConfig.weekdayFontSize || 9.5}
                      onChange={(e) =>
                        updateCalendarConfig({ weekdayFontSize: parseFloat(e.target.value) })
                      }
                      className="w-full accent-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-zinc-400 text-left">Spacing</span>
                      <span className="text-white text-right tabular-nums">{calendarConfig.weekdayLetterSpacing ?? 0.3}px</span>
                    </div>
                    <input
                      type="range"
                      min="-0.5"
                      max="2.5"
                      step="0.1"
                      value={calendarConfig.weekdayLetterSpacing ?? 0.3}
                      onChange={(e) =>
                        updateCalendarConfig({ weekdayLetterSpacing: parseFloat(e.target.value) })
                      }
                      className="w-full accent-white"
                    />
                  </div>
                </div>

                {/* Case & Italic */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1 neu-well p-1 rounded-xl">
                    {[
                      { val: 'capitalize', label: 'Title' },
                      { val: 'uppercase', label: 'UPPER' },
                      { val: 'lowercase', label: 'lower' },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateCalendarConfig({ weekdayTransform: val as any })}
                        className={`px-2 py-0.5 rounded-lg text-[9px] cursor-pointer ${
                          (calendarConfig.weekdayTransform || 'capitalize') === val
                            ? 'neu-button-active text-white font-medium'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateCalendarConfig({ weekdayItalic: !calendarConfig.weekdayItalic })
                    }
                    className={`px-3 py-1 rounded-xl text-[10px] italic transition-all cursor-pointer ${
                      calendarConfig.weekdayItalic
                        ? 'neu-button-active text-white'
                        : 'neu-button text-zinc-400 hover:text-white'
                    }`}
                  >
                    Italic
                  </button>
                </div>
              </div>
            )}

            {/* Toggle button to show numbers on the date */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--neu-border-highlight)]">
              <div className="text-left">
                <span className="font-medium text-white/90 block">Show date numbers</span>
                <span className="text-[10px] text-zinc-500">Display 1, 2, 3... on day frames</span>
              </div>
              <button
                type="button"
                onClick={toggleDateNumbers}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full neu-well p-0.5 transition-colors duration-200 ease-in-out active:scale-[0.97]`}
              >
                <motion.span
                  layout
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                  animate={{
                    scaleX: [1, 1.12, 1],
                  }}
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full neu-raised shadow-md ${
                    calendarConfig.showDateNumbers ? 'translate-x-5 text-white' : 'translate-x-0 opacity-70'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* ================= CANVAS / BACKGROUND / GLOBAL (DEFAULT) ================= */}
        {activeInspectorTab === 'canvas' && !selectedSlotId && !selectedTextId && (
          <div className="space-y-6">
            {/* Full-bleed Background Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider text-left">
                  Artboard Background
                </label>
                {background.imageUrl && (
                  <button
                    type="button"
                    onClick={() => updateBackground({ imageUrl: '' })}
                    className="text-[11px] text-zinc-400 hover:text-white font-medium cursor-pointer text-right"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {background.imageUrl ? (
                /* When Custom Photo is Uploaded */
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden neu-well border border-[var(--neu-border-highlight)]">
                    <img
                      src={background.imageUrl}
                      alt="Current Background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => bgFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl neu-button text-white font-medium text-[11px] cursor-pointer"
                      >
                        Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBackground({ imageUrl: '' })}
                        className="px-3 py-1.5 rounded-xl neu-button text-zinc-300 font-medium text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Pan & Zoom Controls */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/70 text-left">Background Zoom</span>
                      <span className="font-mono text-zinc-400 text-right tabular-nums">{background.scale.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.05"
                      value={background.scale}
                      onChange={(e) =>
                        updateBackground({ scale: parseFloat(e.target.value) })
                      }
                      className="w-full accent-white"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[11px] text-white/60 mb-1">
                          <span className="text-left">Pan X</span>
                          <span className="font-mono text-zinc-400 text-right tabular-nums">{background.position.x}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={background.position.x}
                          onChange={(e) =>
                            updateBackground({
                              position: { ...background.position, x: parseInt(e.target.value, 10) },
                            })
                          }
                          className="w-full accent-white"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-white/60 mb-1">
                          <span className="text-left">Pan Y</span>
                          <span className="font-mono text-zinc-400 text-right tabular-nums">{background.position.y}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={background.position.y}
                          onChange={(e) =>
                            updateBackground({
                              position: { ...background.position, y: parseInt(e.target.value, 10) },
                            })
                          }
                          className="w-full accent-white"
                        />
                      </div>
                    </div>

                    {/* Dark Dimming Overlay */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-white/70 text-left">Dim Darkness</span>
                      <span className="font-mono text-zinc-400 text-right tabular-nums">
                        {Math.round(background.dimOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.85"
                      step="0.05"
                      value={background.dimOpacity}
                      onChange={(e) =>
                        updateBackground({ dimOpacity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-white"
                    />
                  </div>
                </div>
              ) : (
                /* "No Image" State (Default) */
                <div className="space-y-3">
                  <div className="p-4 neu-well rounded-2xl flex flex-col items-start gap-2.5 border border-[var(--neu-border-highlight)]">
                    <div className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-white/70">
                      <ImageSquare size={16} weight="bold" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white text-xs">No Background Image</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Solid dark studio backdrop
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="mt-1 px-3.5 py-2 rounded-xl neu-button text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadSimple size={14} weight="bold" />
                      <span>Upload Background Photo</span>
                    </button>
                  </div>

                  {/* Solid Backdrop Color Picker */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-white/70 text-left">Backdrop Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={background.fallbackColor || '#13161e'}
                        onChange={(e) => updateBackground({ fallbackColor: e.target.value })}
                        className="w-7 h-7 rounded-lg neu-well p-0.5 border border-[var(--neu-border-highlight)] cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-zinc-400 text-right tabular-nums">
                        {background.fallbackColor || '#13161e'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Analog Film Grain */}
              <div className="space-y-2 pt-3 border-t border-[var(--neu-border-highlight)]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70 text-left">Analog Film Grain</span>
                  <span className="font-mono text-zinc-400 text-right tabular-nums">
                    {Math.round(background.grainOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.25"
                  step="0.02"
                  value={background.grainOpacity}
                  onChange={(e) =>
                    updateBackground({ grainOpacity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>

            {/* Grid Position, Spacing & Color */}
            <div className="space-y-3 pt-3 border-t border-[var(--neu-border-highlight)]">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider text-left block">
                  Grid Layout & Spacing
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectGrid(!isGridSelected)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium cursor-pointer transition-all ${
                      isGridSelected
                        ? 'neu-button-active text-white'
                        : 'neu-button text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isGridSelected ? 'Move Grid Active' : 'Select Grid'}
                  </button>
                  {(gridConfig.x !== 0 || gridConfig.y !== 0) && (
                    <button
                      type="button"
                      onClick={() => updateGridPosition(0, 0)}
                      className="neu-button px-2.5 py-1 rounded-xl text-[11px] text-zinc-400 hover:text-white font-medium cursor-pointer text-right"
                    >
                      Reset Center
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Border Color Option */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70 text-left">Grid Border Color</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 text-xs uppercase">
                      {gridConfig.borderColor || '#ffffff'}
                    </span>
                    <input
                      type="color"
                      value={gridConfig.borderColor || '#ffffff'}
                      onChange={(e) => updateGridConfig({ borderColor: e.target.value })}
                      className="w-5 h-5 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                      title="Custom Color"
                    />
                  </div>
                </div>

                {/* Preset Color Swatches */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    { label: 'White', value: '#ffffff' },
                    { label: 'Off-White', value: '#f0f2f5' },
                    { label: 'Warm Cream', value: '#e8e5de' },
                    { label: 'Charcoal', value: '#27272a' },
                    { label: 'Deep Black', value: '#0a0a0c' },
                    { label: 'Accent Orange', value: '#ea580c' },
                    { label: 'Soft Sage', value: '#84a98c' },
                    { label: 'Sky Blue', value: '#38bdf8' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      title={preset.label}
                      onClick={() => updateGridConfig({ borderColor: preset.value })}
                      className={`w-5 h-5 rounded-md transition-transform cursor-pointer ${
                        (gridConfig.borderColor || '#ffffff').toLowerCase() === preset.value.toLowerCase()
                          ? 'scale-110 shadow-sm ring-1 ring-white/60'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-white/70 text-left">Grid Gap</span>
                <span className="font-mono text-zinc-400 text-right tabular-nums">{gridConfig.gap}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={gridConfig.gap}
                onChange={(e) =>
                  updateGridConfig({ gap: parseInt(e.target.value, 10) })
                }
                className="w-full accent-white"
              />

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-white/70 text-left">Default Border Thickness</span>
                <span className="font-mono text-zinc-400 text-right tabular-nums">{gridConfig.borderWidth}px</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={gridConfig.borderWidth}
                onChange={(e) =>
                  updateGridConfig({ borderWidth: parseFloat(e.target.value) })
                }
                className="w-full accent-white"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};
