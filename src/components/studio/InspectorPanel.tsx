import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../core/store/useEditorStore';
import { compressImageFile } from '../../core/utils/imageCompressor';
import { MONTH_NAMES_CAPITAL, WEEKDAYS_SUN_START, WEEKDAYS_MON_START } from '../../core/utils/calendarGenerator';
import {
  Sliders,
  Image as ImageIcon,
  Type,
  Calendar,
  Layers,
  Square,
  Upload,
  RefreshCw,
  Trash2,
  ArrowRightLeft,
  EyeOff,
  Sun,
  Grid,
  X,
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const selectedSlotId = useEditorStore((s) => s.selectedSlotId);
  const selectedTextId = useEditorStore((s) => s.selectedTextId);
  const activeInspectorTab = useEditorStore((s) => s.activeInspectorTab);
  const setActiveInspectorTab = useEditorStore((s) => s.setActiveInspectorTab);
  const selectSlot = useEditorStore((s) => s.selectSlot);
  const selectText = useEditorStore((s) => s.selectText);
  const isMobileInspectorOpen = useEditorStore((s) => s.isMobileInspectorOpen);
  const setIsMobileInspectorOpen = useEditorStore((s) => s.setIsMobileInspectorOpen);

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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileInspectorOpen(false)}
        />
      )}

      <aside
        aria-label="Inspector Panel"
        className={`fixed inset-x-0 bottom-0 z-50 md:relative md:z-20 md:w-80 h-[75vh] md:h-full border-t md:border-t-0 md:border-l border-white/10 bg-[#0e1117] rounded-t-2xl md:rounded-none flex flex-col text-white select-none overflow-hidden shadow-2xl transition-transform duration-300 ease-out ${
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
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#12161f]">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-white/90">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {selectedSlotId
                ? `Photo Slot (${selectedSlotId})`
                : selectedTextId
                ? `Text Layer (${selectedTextId})`
                : 'Studio Inspector'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(selectedSlotId || selectedTextId) && (
              <button
                type="button"
                onClick={() => {
                  selectSlot(null);
                  selectText(null);
                  setActiveInspectorTab('canvas');
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                Deselect
              </button>
            )}

            {/* Mobile close drawer button */}
            <button
              type="button"
              onClick={() => setIsMobileInspectorOpen(false)}
              className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white md:hidden cursor-pointer"
              aria-label="Close Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveInspectorTab('canvas')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeInspectorTab === 'canvas' && !selectedSlotId && !selectedTextId
              ? 'border-b-2 border-blue-500 text-white font-medium bg-white/5'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>

        {calendarConfig?.enabled && (
          <button
            type="button"
            onClick={() => setActiveInspectorTab('calendar')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeInspectorTab === 'calendar'
                ? 'border-b-2 border-blue-500 text-white font-medium bg-white/5'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        )}

        {selectedSlotId && (
          <button
            type="button"
            onClick={() => setActiveInspectorTab('slot')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeInspectorTab === 'slot'
                ? 'border-b-2 border-blue-500 text-white font-medium bg-white/5'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Slot</span>
          </button>
        )}

        {selectedTextId && (
          <button
            type="button"
            onClick={() => setActiveInspectorTab('text')}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeInspectorTab === 'text'
                ? 'border-b-2 border-blue-500 text-white font-medium bg-white/5'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
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
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                Photo Frame
              </label>

              {activeSlot.imageUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                  <img
                    src={activeSlot.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${activeSlot.scale}) translate(${activeSlot.x}%, ${activeSlot.y}%)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => slotFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium text-[11px]"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => clearSlot(selectedSlotId)}
                      className="px-2.5 py-1 rounded bg-red-600/80 text-white font-medium text-[11px]"
                    >
                      Empty
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => slotFileInputRef.current?.click()}
                  className="w-full py-6 border border-dashed border-white/20 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center gap-2 text-white/70 hover:text-white transition-colors bg-white/5"
                >
                  <Upload className="w-5 h-5 text-blue-400" />
                  <span>Choose Photo for Slot</span>
                </button>
              )}
            </div>

            {/* Frame Style State */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                Cell Appearance
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-lg border border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => setSlotFrameStyle(selectedSlotId, 'photo')}
                  className={`py-1.5 rounded transition-colors ${
                    activeSlot.frameStyle === 'photo'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => setSlotFrameStyle(selectedSlotId, 'empty-bordered')}
                  className={`py-1.5 rounded transition-colors ${
                    activeSlot.frameStyle === 'empty-bordered'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Empty Border
                </button>
                <button
                  type="button"
                  onClick={() => setSlotFrameStyle(selectedSlotId, 'hidden')}
                  className={`py-1.5 rounded transition-colors ${
                    activeSlot.frameStyle === 'hidden'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Hidden
                </button>
              </div>
            </div>

            {/* Crop & Zoom Sliders (if photo filled) */}
            {activeSlot.imageUrl && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white/90">Zoom Scale</span>
                  <span className="font-mono text-white/60">{activeSlot.scale.toFixed(1)}x</span>
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
                  className="w-full accent-blue-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Pan X</span>
                      <span>{activeSlot.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={activeSlot.x}
                      onChange={(e) =>
                        updateSlot(selectedSlotId, { x: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Pan Y</span>
                      <span>{activeSlot.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={activeSlot.y}
                      onChange={(e) =>
                        updateSlot(selectedSlotId, { y: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateSlot(selectedSlotId, { scale: 1.0, x: 0, y: 0 })}
                  className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 text-white/80"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Crop to Fit</span>
                </button>
              </div>
            )}

            {/* Frame Border Controls */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white/90">Show Frame Border</span>
                <input
                  type="checkbox"
                  checked={activeSlot.hasBorder}
                  onChange={() => toggleSlotBorder(selectedSlotId)}
                  className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {activeSlot.hasBorder && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Border Thickness</span>
                    <span className="font-mono text-white/60">{activeSlot.borderWidth || 1.5}px</span>
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
                    className="w-full accent-blue-500"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Border Color</span>
                    <input
                      type="color"
                      value={activeSlot.borderColor || '#ffffff'}
                      onChange={(e) =>
                        updateSlot(selectedSlotId, { borderColor: e.target.value })
                      }
                      className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Swap with Another Slot */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                Swap Cell With
              </label>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-white/40" />
                <select
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
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
                <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                  Text Content
                </label>
                <span className="text-[10px] text-white/40 font-mono">
                  {activeText.content.length} chars
                </span>
              </div>
              <textarea
                rows={5}
                value={activeText.content}
                onChange={(e) => updateText(selectedTextId, { content: e.target.value })}
                placeholder="Enter caption or title..."
                className="w-full min-h-[90px] bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 resize-y font-sans text-xs leading-relaxed"
              />
            </div>

            {/* Typography Face & Size */}
            <div className="space-y-3">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                Font Family
              </label>
              <select
                value={activeText.fontFamily}
                onChange={(e) =>
                  updateText(selectedTextId, {
                    fontFamily: e.target.value as any,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-white outline-none"
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
                  <span className="text-white/70">Font Weight</span>
                  <span className="font-mono text-white/50 text-[10px]">
                    {activeText.fontWeight}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 p-1 bg-white/5 rounded-lg border border-white/10 text-center">
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
                        className={`py-1 rounded text-[10px] transition-all active:scale-[0.97] ${
                          isCurrent
                            ? 'bg-blue-600 text-white font-semibold shadow'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
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
                <span className="text-white/70">Italic Slant</span>
                <button
                  type="button"
                  onClick={() => updateText(selectedTextId, { italic: !activeText.italic })}
                  className={`px-3 py-1 rounded text-xs italic font-medium transition-all active:scale-[0.97] border ${
                    activeText.italic
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  Italic
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/70">Font Size</span>
                <span className="font-mono text-white/60">{activeText.fontSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="36"
                value={activeText.fontSize}
                onChange={(e) =>
                  updateText(selectedTextId, { fontSize: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-500"
              />
            </div>

            {/* Color & Alignment */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <span className="text-[11px] text-white/60 block mb-1">Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeText.color.startsWith('#') ? activeText.color : '#ffffff'}
                    onChange={(e) => updateText(selectedTextId, { color: e.target.value })}
                    className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-white/70">{activeText.color}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-white/60 block mb-1">Align</span>
                <div className="flex gap-1 bg-white/5 p-1 rounded border border-white/10">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => updateText(selectedTextId, { align: a })}
                      className={`flex-1 py-0.5 rounded capitalize text-[10px] ${
                        activeText.align === a ? 'bg-blue-600 text-white font-medium' : 'text-white/60'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Letter Spacing</span>
                <span className="font-mono text-white/60">{activeText.letterSpacing}px</span>
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
                className="w-full accent-blue-500"
              />
            </div>

            {/* Canvas Direct Resizing Hint */}
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-white/70 flex items-center justify-between text-[11px]">
              <span className="text-white/60">Column Resize</span>
              <span className="font-mono text-[10px] text-blue-400">
                Drag handles on canvas
              </span>
            </div>

            {/* Drop Shadow for Readability */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white/90">Drop Shadow</span>
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
                  className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {activeText.shadow?.enabled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-white/60 text-[11px]">
                    <span>Shadow Blur</span>
                    <span>{activeText.shadow.blur}px</span>
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
                    className="w-full accent-blue-500"
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
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                Target Month & Year
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={calendarConfig.month}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10);
                    applyMonthCalendar(calendarConfig.year, m, calendarConfig.startDay);
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none"
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
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none"
                >
                  <option value={2025} className="bg-[#141820]">2025</option>
                  <option value={2026} className="bg-[#141820]">2026</option>
                  <option value={2027} className="bg-[#141820]">2027</option>
                </select>
              </div>
            </div>

            {/* Weekday Start Day */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                Week Starts On
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    updateCalendarConfig({
                      startDay: 'sun',
                      weekdays: WEEKDAYS_SUN_START,
                    });
                    applyMonthCalendar(calendarConfig.year, calendarConfig.month, 'sun');
                  }}
                  className={`py-1.5 rounded transition-colors ${
                    calendarConfig.startDay === 'sun'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-white/60 hover:text-white'
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
                  className={`py-1.5 rounded transition-colors ${
                    calendarConfig.startDay === 'mon'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Monday
                </button>
              </div>
            </div>

            {/* Weekday Header Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="font-medium text-white/90">Show Weekday Header</span>
              <input
                type="checkbox"
                checked={calendarConfig.showWeekdayHeader}
                onChange={(e) =>
                  updateCalendarConfig({ showWeekdayHeader: e.target.checked })
                }
                className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>

            {/* Weekday Header Typography Customizer */}
            {calendarConfig.showWeekdayHeader && (
              <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider block">
                  Weekday Header Font
                </span>

                {/* Font Family */}
                <div>
                  <span className="text-[11px] text-white/60 block mb-1">Family</span>
                  <select
                    value={calendarConfig.weekdayFontFamily || 'Arial Light'}
                    onChange={(e) =>
                      updateCalendarConfig({
                        weekdayFontFamily: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#12151e] border border-white/10 rounded-lg px-2 py-1.5 text-white outline-none"
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
                    <span className="text-[11px] text-white/60">Weight</span>
                    <span className="font-mono text-[10px] text-white/40">
                      {calendarConfig.weekdayFontWeight || 500}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-0.5 bg-black/40 rounded-lg border border-white/10 text-center">
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
                          className={`py-1 rounded text-[9.5px] transition-all active:scale-[0.97] ${
                            isCur
                              ? 'bg-blue-600 text-white font-semibold shadow'
                              : 'text-white/60 hover:text-white'
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
                    <div className="flex justify-between text-[11px] text-white/60 mb-0.5">
                      <span>Size</span>
                      <span className="font-mono text-[10px]">{calendarConfig.weekdayFontSize || 9.5}px</span>
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
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-0.5">
                      <span>Spacing</span>
                      <span className="font-mono text-[10px]">{calendarConfig.weekdayLetterSpacing ?? 0.3}px</span>
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
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>

                {/* Case & Italic */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1 bg-black/40 p-0.5 rounded border border-white/10">
                    {[
                      { val: 'capitalize', label: 'Title' },
                      { val: 'uppercase', label: 'UPPER' },
                      { val: 'lowercase', label: 'lower' },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateCalendarConfig({ weekdayTransform: val as any })}
                        className={`px-1.5 py-0.5 rounded text-[9px] ${
                          (calendarConfig.weekdayTransform || 'capitalize') === val
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-white/60 hover:text-white'
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
                    className={`px-2 py-0.5 rounded text-[10px] italic border transition-all active:scale-[0.97] ${
                      calendarConfig.weekdayItalic
                        ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                        : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    Italic
                  </button>
                </div>
              </div>
            )}

            {/* Toggle button to show numbers on the date */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="font-medium text-white/90 block">Show Date Numbers</span>
                <span className="text-[10px] text-white/50">Display 1, 2, 3... on day frames</span>
              </div>
              <button
                type="button"
                onClick={toggleDateNumbers}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out active:scale-[0.97] ${
                  calendarConfig.showDateNumbers ? 'bg-blue-600' : 'bg-white/20'
                }`}
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
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 ${
                    calendarConfig.showDateNumbers ? 'translate-x-4' : 'translate-x-0'
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
                <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">
                  Artboard Background
                </label>
                {background.imageUrl && (
                  <button
                    type="button"
                    onClick={() => updateBackground({ imageUrl: '' })}
                    className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                  >
                    Remove Image (No Image)
                  </button>
                )}
              </div>

              {background.imageUrl ? (
                /* When Custom Photo is Uploaded */
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                    <img
                      src={background.imageUrl}
                      alt="Current Background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => bgFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium text-[11px]"
                      >
                        Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBackground({ imageUrl: '' })}
                        className="px-2.5 py-1 rounded bg-red-600/80 text-white font-medium text-[11px]"
                      >
                        No Image
                      </button>
                    </div>
                  </div>

                  {/* Pan & Zoom Controls */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/70">Background Zoom</span>
                      <span className="font-mono text-white/60">{background.scale.toFixed(1)}x</span>
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
                      className="w-full accent-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[11px] text-white/60 mb-1">
                          <span>Pan X</span>
                          <span>{background.position.x}px</span>
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
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-white/60 mb-1">
                          <span>Pan Y</span>
                          <span>{background.position.y}px</span>
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
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>

                    {/* Dark Dimming Overlay */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-white/70">Dim Darkness</span>
                      <span className="font-mono text-white/60">
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
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              ) : (
                /* "No Image" State (Default) */
                <div className="space-y-3">
                  <div className="p-4 border border-dashed border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center text-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white/90 text-xs">No Background Image</p>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Solid dark studio backdrop
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Background Photo</span>
                    </button>
                  </div>

                  {/* Solid Backdrop Color Picker */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-white/70">Backdrop Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={background.fallbackColor || '#13161e'}
                        onChange={(e) => updateBackground({ fallbackColor: e.target.value })}
                        className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-white/60">
                        {background.fallbackColor || '#13161e'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Analog Film Grain */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70">Analog Film Grain</span>
                  <span className="font-mono text-white/60">
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
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Grid Position & Spacing */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider block">
                  Grid Layout & Spacing
                </label>
                {(gridConfig.x !== 0 || gridConfig.y !== 0) && (
                  <button
                    type="button"
                    onClick={() => updateGridPosition(0, 0)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Reset Center
                  </button>
                )}
              </div>

              <p className="text-[10px] text-white/50 leading-relaxed">
                Tip: Drag the <strong>"Drag Grid"</strong> pill or texts directly on canvas to reposition. They automatically snap to the middle X and Y axes!
              </p>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/70">Grid Gap</span>
                <span className="font-mono text-white/60">{gridConfig.gap}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={gridConfig.gap}
                onChange={(e) =>
                  updateGridConfig({ gap: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-500"
              />

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-white/70">Default Border Thickness</span>
                <span className="font-mono text-white/60">{gridConfig.borderWidth}px</span>
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
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};
