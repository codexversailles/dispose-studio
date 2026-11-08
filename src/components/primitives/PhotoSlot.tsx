import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore, flushPendingHistory } from '../../core/store/useEditorStore';
import { POPOVER_VARIANTS } from '../../core/motion/transitions';
import { compressImageFile } from '../../core/utils/imageCompressor';
import {
  ImageSquare,
  ArrowsClockwise,
  Square,
  Trash,
} from '@phosphor-icons/react';

interface PhotoSlotProps {
  slotId: string;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({ slotId }) => {
  const slot = useEditorStore((s) => s.slots[slotId]);
  const isSelected = useEditorStore((s) => s.selectedSlotId === slotId);
  const isExporting = useEditorStore((s) => s.isExporting);
  const draggedSlotId = useEditorStore((s) => s.draggedSlotId);
  const showDateNumbers = useEditorStore((s) => s.calendarConfig?.showDateNumbers ?? false);
  const gridBorderColor = useEditorStore((s) => s.gridConfig.borderColor);

  const selectSlot = useEditorStore((s) => s.selectSlot);
  const updateSlot = useEditorStore((s) => s.updateSlot);
  const updateSlotImage = useEditorStore((s) => s.updateSlotImage);
  const clearSlot = useEditorStore((s) => s.clearSlot);
  const toggleSlotBorder = useEditorStore((s) => s.toggleSlotBorder);
  const swapSlots = useEditorStore((s) => s.swapSlots);
  const setDraggedSlotId = useEditorStore((s) => s.setDraggedSlotId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const slotStartOffsetRef = useRef({ x: 0, y: 0 });

  if (!slot) return null;

  const {
    imageUrl,
    scale = 1.0,
    x = 0,
    y = 0,
    frameStyle = 'empty-bordered',
    hasBorder = true,
    borderWidth = 1.5,
    borderColor = '#ffffff',
    borderRadius = 0,
    label,
    aspectRatio = '1:1',
  } = slot;

  // Hidden state: invisible cell (used for calendar offset)
  if (frameStyle === 'hidden') {
    return (
      <div
        className={`w-full h-full aspect-square transition-opacity ${
          isExporting ? 'invisible' : 'opacity-0 hover:opacity-40 border border-dashed border-white/20'
        }`}
        onClick={() => !isExporting && selectSlot(slotId)}
      />
    );
  }

  // Handle pointer down for pan gesture inside photo
  const handlePointerDown = (e: React.PointerEvent) => {
    // Never hijack clicks/gestures on buttons or frame action bar
    if ((e.target as HTMLElement).closest('.frame-action-bar') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    if (isExporting || !imageUrl || frameStyle !== 'photo') return;
    
    // Select this slot
    selectSlot(slotId);

    // Only pan if zoomed in or dragging inside
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    const current = useEditorStore.getState().slots[slotId];
    slotStartOffsetRef.current = { x: current?.x ?? x, y: current?.y ?? y };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanningRef.current || isExporting) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    // Convert pixel movement to percentage offset scaled by current zoom
    const sensitivity = 0.45;
    const newX = Math.round(slotStartOffsetRef.current.x + (dx * sensitivity) / scale);
    const newY = Math.round(slotStartOffsetRef.current.y + (dy * sensitivity) / scale);

    updateSlot(slotId, {
      x: Math.max(-100, Math.min(100, newX)),
      y: Math.max(-100, Math.min(100, newY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    setIsPanning(false);

    // Commit final drop position as a single clean undo/redo step
    flushPendingHistory();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Wheel zoom gesture
  const handleWheel = (e: React.WheelEvent) => {
    if (isExporting || !imageUrl || !isSelected) return;
    e.stopPropagation();
    e.preventDefault();

    const delta = e.deltaY * -0.002;
    const newScale = Math.min(4.0, Math.max(1.0, +(scale + delta).toFixed(2)));
    updateSlot(slotId, { scale: newScale });
  };

  // Double click resets zoom and pan
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isExporting || !imageUrl) return;
    e.stopPropagation();
    updateSlot(slotId, { scale: 1.0, x: 0, y: 0 });
  };

  // Drag and drop handlers for replacing/filling photo or swapping
  const handleDragStart = (e: React.DragEvent) => {
    if (isExporting || !imageUrl || isPanningRef.current) {
      e.preventDefault();
      return;
    }
    if ((e.target as HTMLElement).closest('.frame-action-bar') || (e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', slotId);
    setDraggedSlotId(slotId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isExporting) return;
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isExporting) return;
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (isExporting) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Case 1: Dropped files from computer
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImageFile(file);
          updateSlotImage(slotId, compressed.blobUrl);
          selectSlot(slotId);
        } catch (err) {
          console.error('Failed to compress dropped file:', err);
        }
      }
      return;
    }

    // Case 2: Swapping slots via internal drag
    const sourceSlotId = e.dataTransfer.getData('text/plain') || draggedSlotId;
    if (sourceSlotId && sourceSlotId !== slotId) {
      swapSlots(sourceSlotId, slotId);
      selectSlot(slotId);
    }
    setDraggedSlotId(null);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImageFile(file);
        updateSlotImage(slotId, compressed.blobUrl);
        selectSlot(slotId);
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const borderStyle: React.CSSProperties = hasBorder
    ? {
        borderWidth: `${borderWidth}px`,
        borderStyle: 'solid',
        borderColor: borderColor || gridBorderColor || '#ffffff',
      }
    : {
        borderWidth: '0px',
      };

  const aspectClass =
    aspectRatio === '4:5'
      ? 'aspect-[4/5]'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : 'aspect-square';

  // Check if slot is in the top row of a 7-column calendar
  const slotNum = parseInt(slotId.replace(/\D/g, ''), 10);
  const isTopRow = !isNaN(slotNum) && slotNum < 7;

  return (
    <div
      className={`photo-slot-item relative w-full ${aspectClass} box-border transition-shadow select-none group touch-none ${
        !isExporting && isSelected ? 'z-40' : 'z-10'
      } ${isDragOver ? 'scale-[1.02] z-50' : ''}`}
      style={{
        borderRadius: `${borderRadius}px`,
        ...borderStyle,
      }}
      onClick={(e) => {
        if (!isExporting) {
          e.stopPropagation();
          selectSlot(slotId);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      draggable={!isExporting && Boolean(imageUrl) && !isSelected}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Frame Content */}
      {imageUrl && frameStyle === 'photo' ? (
        <div
          className="w-full h-full overflow-hidden relative"
          style={{ borderRadius: `${borderRadius}px` }}
        >
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            className="w-full h-full object-cover will-change-transform pointer-events-none select-none"
            style={{
              transform: `scale(${scale}) translate(${x}%, ${y}%)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.08s ease-out',
            }}
          />

          {/* Optional day label inside photo (controlled by toggle) */}
          {showDateNumbers && label && (
            <span
              className="absolute top-1 left-1.5 text-[8.5px] font-mono font-medium drop-shadow-md select-none pointer-events-none opacity-85"
              style={{
                color: borderColor || gridBorderColor || '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.85)',
              }}
            >
              {label}
            </span>
          )}
        </div>
      ) : (
        /* Empty Bordered State: shows full background through! */
        <div
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer relative"
          onClick={() => {
            if (!isExporting && !imageUrl) {
              fileInputRef.current?.click();
            }
          }}
        >
          {showDateNumbers && label && (
            <span
              className="absolute top-1 left-1.5 text-[8.5px] font-mono font-medium opacity-80 select-none pointer-events-none"
              style={{
                color: borderColor || gridBorderColor || '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.85)',
              }}
            >
              {label}
            </span>
          )}

          {!isExporting && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-7 h-7 rounded-full bg-black/75 text-white backdrop-blur-xs">
              <ImageSquare size={14} weight="bold" />
            </div>
          )}
        </div>
      )}

      {/* Mini floating action toolbar (tactile Neumorphic pod) */}
      <AnimatePresence>
        {!isExporting && isSelected && (
          <motion.div
            variants={POPOVER_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            draggable={false}
            className={`frame-action-bar absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#141722] p-1.5 rounded-2xl shadow-[var(--weld-extruded)] text-white z-50 text-xs ${
              isTopRow ? 'top-full mt-2' : '-top-12'
            }`}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Replace Photo */}
            <button
              type="button"
              draggable={false}
              title="Replace Photo"
              className="p-1.5 weld-button rounded-xl text-zinc-300 hover:text-white cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImageSquare size={14} weight="bold" />
            </button>

            {/* Toggle Border */}
            <button
              type="button"
              draggable={false}
              title={hasBorder ? 'Hide Frame Border' : 'Show Frame Border'}
              className={`p-1.5 rounded-xl cursor-pointer ${
                hasBorder ? 'weld-button-active text-white' : 'weld-button text-zinc-300 hover:text-white'
              }`}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggleSlotBorder(slotId);
              }}
            >
              <Square size={14} weight={hasBorder ? 'fill' : 'bold'} />
            </button>

            {/* Reset Zoom & Pan */}
            {imageUrl && (
              <button
                type="button"
                draggable={false}
                title="Reset Crop & Fit (Double-click)"
                className="p-1.5 weld-button rounded-xl text-zinc-300 hover:text-white cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSlot(slotId, { scale: 1.0, x: 0, y: 0 });
                }}
              >
                <ArrowsClockwise size={14} weight="bold" />
              </button>
            )}

            {/* Clear Photo / Revert to Empty Bordered */}
            {imageUrl && (
              <button
                type="button"
                draggable={false}
                title="Clear photo to empty border"
                className="p-1.5 weld-button rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  clearSlot(slotId);
                }}
              >
                <Trash size={14} weight="bold" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
