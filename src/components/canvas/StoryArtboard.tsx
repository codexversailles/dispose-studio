import React, { forwardRef, useRef, useState } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { BackgroundCanvas } from '../primitives/BackgroundCanvas';
import { PhotoSlot } from '../primitives/PhotoSlot';
import { EditableTextLayer } from '../primitives/EditableTextLayer';
import { SnapGuide } from '../../core/types/template';

export const StoryArtboard = forwardRef<HTMLDivElement, { interactive?: boolean }>(
  ({ interactive = true }, ref) => {
    const gridConfig = useEditorStore((s) => s.gridConfig);
    const slots = useEditorStore((s) => s.slots);
    const textLayers = useEditorStore((s) => s.textLayers);
    const calendarConfig = useEditorStore((s) => s.calendarConfig);
    const selectSlot = useEditorStore((s) => s.selectSlot);
    const selectText = useEditorStore((s) => s.selectText);
    const selectGrid = useEditorStore((s) => s.selectGrid);
    const isGridSelected = useEditorStore((s) => s.isGridSelected);
    const setActiveInspectorTab = useEditorStore((s) => s.setActiveInspectorTab);
    const isExporting = useEditorStore((s) => s.isExporting);
    const activeSnapGuides = useEditorStore((s) => s.activeSnapGuides);
    const setActiveSnapGuides = useEditorStore((s) => s.setActiveSnapGuides);
    const updateGridPosition = useEditorStore((s) => s.updateGridPosition);

    const [isDraggingGrid, setIsDraggingGrid] = useState(false);
    const gridDragStart = useRef({ clientX: 0, clientY: 0, startX: 0, startY: 0 });

    const slotList = Object.values(slots);
    const { columns, gap, padding, x: gridX = 0, y: gridY = 0 } = gridConfig;

    const handleGridPointerDown = (e: React.PointerEvent) => {
      if (isExporting) return;
      e.stopPropagation();
      setIsDraggingGrid(true);
      selectGrid(true);
      gridDragStart.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        startX: gridX,
        startY: gridY,
      };

      // Pause history tracking during continuous grid move
      useEditorStore.temporal?.getState()?.pause();

      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handleGridPointerMove = (e: React.PointerEvent) => {
      if (!isDraggingGrid || isExporting) return;
      const artboard = document.getElementById('dumpstudio-artboard');
      if (!artboard) return;

      const rect = artboard.getBoundingClientRect();
      const scale = rect.width / 360;

      const dx = (e.clientX - gridDragStart.current.clientX) / scale;
      const dy = (e.clientY - gridDragStart.current.clientY) / scale;

      let targetX = Math.round(gridDragStart.current.startX + dx);
      let targetY = Math.round(gridDragStart.current.startY + dy);

      // Bounds
      targetX = Math.max(-120, Math.min(120, targetX));
      targetY = Math.max(-160, Math.min(160, targetY));

      const guides: SnapGuide[] = [];
      const SNAP_THRESHOLD = 7;

      // Snap grid to exact center X (0 offset)
      if (Math.abs(targetX) <= SNAP_THRESHOLD) {
        targetX = 0;
        guides.push({ type: 'x-center', position: 180 });
      }

      // Snap grid to exact center Y (0 offset)
      if (Math.abs(targetY) <= SNAP_THRESHOLD) {
        targetY = 0;
        guides.push({ type: 'y-center', position: 320 });
      }

      setActiveSnapGuides(guides);
      updateGridPosition(targetX, targetY);
    };

    const handleGridPointerUp = (e: React.PointerEvent) => {
      if (!isDraggingGrid) return;
      setIsDraggingGrid(false);
      setActiveSnapGuides([]);

      // Commit final position in ONE single clean undo/redo step
      const finalGrid = useEditorStore.getState().gridConfig;
      const finalX = finalGrid.x ?? 0;
      const finalY = finalGrid.y ?? 0;
      const startX = gridDragStart.current.startX;
      const startY = gridDragStart.current.startY;

      if (finalX !== startX || finalY !== startY) {
        updateGridPosition(startX, startY);
        useEditorStore.temporal?.getState()?.resume();
        updateGridPosition(finalX, finalY);
      } else {
        useEditorStore.temporal?.getState()?.resume();
      }

      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    return (
      <div
        ref={ref}
        id="dumpstudio-artboard"
        className="relative overflow-hidden select-none shadow-[var(--neu-shadow-artboard)]"
        style={{
          width: '360px',
          height: '640px',
          boxSizing: 'border-box',
        }}
        onClick={() => {
          if (!isExporting) {
            selectSlot(null);
            selectText(null);
            selectGrid(false);
            setActiveInspectorTab('canvas');
          }
        }}
      >
        {/* Full-bleed background layer */}
        <BackgroundCanvas interactive={interactive} />

        {/* Canva-style Snapping Guide Lines (Swiss Monochrome) */}
        {!isExporting &&
          activeSnapGuides.map((guide, idx) =>
            guide.type === 'x-center' ? (
              <div
                key={`guide-${idx}`}
                className="absolute top-0 bottom-0 w-[1px] bg-white z-50 pointer-events-none shadow-[0_0_6px_rgba(0,0,0,0.9)]"
                style={{ left: `${guide.position}px`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white text-black font-sans text-[8.5px] font-medium px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                  Center X
                </div>
              </div>
            ) : (
              <div
                key={`guide-${idx}`}
                className="absolute left-0 right-0 h-[1px] bg-white z-50 pointer-events-none shadow-[0_0_6px_rgba(0,0,0,0.9)]"
                style={{ top: `${guide.position}px`, transform: 'translateY(-50%)' }}
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-white text-black font-sans text-[8.5px] font-medium px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                  Center Y
                </div>
              </div>
            )
          )}

        {/* Text Layers */}
        {Object.keys(textLayers).map((textId) => (
          <EditableTextLayer key={textId} textId={textId} />
        ))}

        {/* Moveable Grid Container (Click to select, drag to reposition) */}
        <div
          className={`absolute transition-transform duration-75 ${
            isGridSelected ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          style={{
            top: `${padding.top}px`,
            left: `${padding.left}px`,
            right: `${padding.right}px`,
            transform: `translate(${gridX}px, ${gridY}px)`,
          }}
          onClick={(e) => {
            if (!isExporting) {
              const target = e.target as HTMLElement;
              // If clicked on grid padding, gap, or header (not inside a slot or button)
              if (!target.closest('.photo-slot-item') && !target.closest('button') && !target.closest('.frame-action-bar')) {
                e.stopPropagation();
                selectGrid(true);
              }
            }
          }}
          onPointerDown={(e) => {
            if (isExporting) return;
            const target = e.target as HTMLElement;
            if (target.closest('.frame-action-bar') || target.closest('button')) return;
            // Drag grid if grid is already selected or if clicking on grid container padding/gaps
            if (isGridSelected || !target.closest('.photo-slot-item')) {
              handleGridPointerDown(e);
            }
          }}
        >
          {/* Grid Boundary Highlight when Selected or Dragged */}
          {!isExporting && (isDraggingGrid || isGridSelected) && (
            <div className="absolute -inset-2.5 rounded-2xl pointer-events-none bg-white/[0.03] shadow-[0_0_30px_rgba(0,0,0,0.5)] z-30 transition-opacity animate-in fade-in duration-150" />
          )}

          {/* Calendar Weekday Header (if enabled) */}
          {calendarConfig?.enabled && calendarConfig.showWeekdayHeader && (
            <div className="flex justify-between pointer-events-none select-none mb-1.5">
              {calendarConfig.weekdays.map((day, idx) => (
                <span
                  key={idx}
                  className="text-center flex-1"
                  style={{
                    fontFamily:
                      calendarConfig.weekdayFontFamily === 'Arial Light'
                        ? "'Arial Light', Arial, sans-serif"
                        : calendarConfig.weekdayFontFamily === 'Arial'
                        ? "Arial, 'Helvetica Neue', sans-serif"
                        : calendarConfig.weekdayFontFamily === 'Instagram Sans'
                        ? "'Instagram Sans', sans-serif"
                        : calendarConfig.weekdayFontFamily === 'SF Pro Display'
                        ? "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                        : calendarConfig.weekdayFontFamily === 'Helvetica Neue'
                        ? 'var(--font-helvetica)'
                        : calendarConfig.weekdayFontFamily === 'JetBrains Mono'
                        ? 'var(--font-mono)'
                        : calendarConfig.weekdayFontFamily === 'Inter'
                        ? 'var(--font-inter)'
                        : calendarConfig.weekdayFontFamily === 'Ralphi Sans'
                        ? 'var(--font-ralphi)'
                        : "'Arial Light', Arial, sans-serif",
                    fontWeight: calendarConfig.weekdayFontWeight || 500,
                    fontSize: `${calendarConfig.weekdayFontSize || 9.5}px`,
                    color: calendarConfig.weekdayColor || gridConfig.borderColor || '#ffffff',
                    letterSpacing: `${calendarConfig.weekdayLetterSpacing ?? 0.3}px`,
                    textTransform: calendarConfig.weekdayTransform || 'capitalize',
                    fontStyle: calendarConfig.weekdayItalic ? 'italic' : 'normal',
                    opacity: 0.92,
                    textShadow: '0 1px 3px rgba(0,0,0,0.75)',
                  }}
                >
                  {day}
                </span>
              ))}
            </div>
          )}

          {/* Photo Slots Grid */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: `${gap}px`,
              alignContent: 'start',
            }}
          >
            {slotList.map((slot) => (
              <PhotoSlot key={slot.id} slotId={slot.id} />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

StoryArtboard.displayName = 'StoryArtboard';
