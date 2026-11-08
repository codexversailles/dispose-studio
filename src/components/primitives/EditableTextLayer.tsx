import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { SnapGuide } from '../../core/types/template';
import { ArrowsOutCardinal } from '@phosphor-icons/react';

interface EditableTextLayerProps {
  textId: string;
}

type ResizeHandleType = 'right' | 'left' | 'bottom' | 'top' | 'br' | 'bl' | 'tr' | 'tl';

export const EditableTextLayer: React.FC<EditableTextLayerProps> = ({ textId }) => {
  const textLayer = useEditorStore((s) => s.textLayers[textId]);
  const isSelected = useEditorStore((s) => s.selectedTextId === textId);
  const isExporting = useEditorStore((s) => s.isExporting);

  const selectText = useEditorStore((s) => s.selectText);
  const updateText = useEditorStore((s) => s.updateText);
  const updateTextPosition = useEditorStore((s) => s.updateTextPosition);
  const setActiveSnapGuides = useEditorStore((s) => s.setActiveSnapGuides);

  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizingHandle, setResizingHandle] = useState<ResizeHandleType | null>(null);
  const [liveDimensions, setLiveDimensions] = useState<{ width: number; height: number } | null>(null);

  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 180,
    startY: 100,
  });

  const resizeStartRef = useRef<{
    clientX: number;
    clientY: number;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
  }>({
    clientX: 0,
    clientY: 0,
    startWidth: 280,
    startHeight: 40,
    startX: 180,
    startY: 100,
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize inline textarea height to scrollHeight smoothly
  useEffect(() => {
    if (isInlineEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${Math.max(44, textareaRef.current.scrollHeight + 8)}px`;
    }
  }, [isInlineEditing]);

  useEffect(() => {
    if (isInlineEditing && textareaRef.current) {
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${Math.max(44, textareaRef.current.scrollHeight + 8)}px`;
    }
  }, [textLayer?.content, textLayer?.fontSize]);

  if (!textLayer) return null;

  const {
    content,
    fontFamily,
    fontSize,
    fontWeight,
    color,
    align,
    letterSpacing,
    lineHeight = 1.35,
    italic = false,
    textTransform = 'none',
    shadow,
    position,
    maxWidth = '310px',
    width,
    height,
  } = textLayer;

  // Resolve position coordinates
  const currentX = position.x ?? 180;
  const currentY =
    position.y ??
    (position.top ? parseInt(position.top, 10) || 120 : position.bottom ? 580 : 320);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isExporting || isInlineEditing || resizingHandle) return;

    selectText(textId);

    const artboard = document.getElementById('dumpstudio-artboard');
    if (!artboard) return;

    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: currentX,
      startY: currentY,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isExporting || isInlineEditing || resizingHandle) return;

    const artboard = document.getElementById('dumpstudio-artboard');
    if (!artboard) return;

    const rect = artboard.getBoundingClientRect();
    const scale = rect.width / 360;

    const dx = (e.clientX - dragStartRef.current.clientX) / scale;
    const dy = (e.clientY - dragStartRef.current.clientY) / scale;

    let targetX = Math.round(dragStartRef.current.startX + dx);
    let targetY = Math.round(dragStartRef.current.startY + dy);

    // Bounds check within 360x640 artboard
    targetX = Math.max(16, Math.min(344, targetX));
    targetY = Math.max(16, Math.min(624, targetY));

    // Snapping logic: Snap to Canva Center X (180) and Center Y (320)
    const guides: SnapGuide[] = [];
    const SNAP_THRESHOLD = 7;

    if (Math.abs(targetX - 180) <= SNAP_THRESHOLD) {
      targetX = 180;
      guides.push({ type: 'x-center', position: 180 });
    }

    if (Math.abs(targetY - 320) <= SNAP_THRESHOLD) {
      targetY = 320;
      guides.push({ type: 'y-center', position: 320 });
    }

    setActiveSnapGuides(guides);
    updateTextPosition(textId, targetX, targetY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setActiveSnapGuides([]);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // ================= Canva-Style Direct Manipulation Resizing =================
  const handleResizePointerDown = (e: React.PointerEvent, handle: ResizeHandleType) => {
    e.stopPropagation();
    if (isExporting || isInlineEditing) return;

    const artboard = document.getElementById('dumpstudio-artboard');
    if (!artboard || !elementRef.current) return;

    const currentRect = elementRef.current.getBoundingClientRect();
    const artboardRect = artboard.getBoundingClientRect();
    const scale = artboardRect.width / 360;

    const startW = currentRect.width / scale;
    const startH = currentRect.height / scale;

    setResizingHandle(handle);
    setLiveDimensions({ width: Math.round(startW), height: Math.round(startH) });

    resizeStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startWidth: startW,
      startHeight: startH,
      startX: currentX,
      startY: currentY,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!resizingHandle || isExporting || isInlineEditing) return;

    const artboard = document.getElementById('dumpstudio-artboard');
    if (!artboard) return;

    const artboardRect = artboard.getBoundingClientRect();
    const scale = artboardRect.width / 360;

    const dx = (e.clientX - resizeStartRef.current.clientX) / scale;
    const dy = (e.clientY - resizeStartRef.current.clientY) / scale;

    const { startWidth, startHeight, startX, startY } = resizeStartRef.current;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startX;
    let newY = startY;

    // Horizontal handle adjustments
    if (resizingHandle === 'right' || resizingHandle === 'br' || resizingHandle === 'tr') {
      newWidth = Math.max(60, Math.min(340, startWidth + dx));
      const appliedDx = newWidth - startWidth;
      newX = Math.round(startX + appliedDx / 2);
    } else if (resizingHandle === 'left' || resizingHandle === 'bl' || resizingHandle === 'tl') {
      newWidth = Math.max(60, Math.min(340, startWidth - dx));
      const appliedDx = -(newWidth - startWidth);
      newX = Math.round(startX + appliedDx / 2);
    }

    // Vertical handle adjustments
    if (resizingHandle === 'bottom' || resizingHandle === 'br' || resizingHandle === 'bl') {
      newHeight = Math.max(20, Math.min(420, startHeight + dy));
      const appliedDy = newHeight - startHeight;
      newY = Math.round(startY + appliedDy / 2);
    } else if (resizingHandle === 'top' || resizingHandle === 'tr' || resizingHandle === 'tl') {
      newHeight = Math.max(20, Math.min(420, startHeight - dy));
      const appliedDy = -(newHeight - startHeight);
      newY = Math.round(startY + appliedDy / 2);
    }

    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);

    setLiveDimensions({ width: newWidth, height: newHeight });

    updateText(textId, {
      width: newWidth,
      height: newHeight,
      maxWidth: newWidth,
      position: {
        ...position,
        x: newX,
        y: newY,
      },
    });
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (!resizingHandle) return;
    setResizingHandle(null);
    setLiveDimensions(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const getFontFamilyCss = () => {
    switch (fontFamily) {
      case 'Arial Light':
        return "'Arial Light', Arial, sans-serif";
      case 'Arial':
        return "Arial, 'Helvetica Neue', sans-serif";
      case 'Instagram Sans':
        return "'Instagram Sans', sans-serif";
      case 'SF Pro Display':
        return "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif";
      case 'Helvetica Neue':
        return 'var(--font-helvetica)';
      case 'JetBrains Mono':
        return 'var(--font-mono)';
      case 'Inter':
        return 'var(--font-inter)';
      case 'Ralphi Sans':
        return 'var(--font-ralphi)';
      default:
        return "'Arial Light', Arial, sans-serif";
    }
  };

  const textShadowStyle =
    shadow && shadow.enabled
      ? `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`
      : 'none';

  const resolvedMaxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '340px';
  const resolvedWidth = width ? `${width}px` : isInlineEditing ? '310px' : 'max-content';
  const resolvedHeight = height ? `${height}px` : 'auto';

  return (
    <div
      ref={elementRef}
      className={`absolute z-30 transition-shadow select-none box-border flex flex-col justify-center touch-none ${
        !isExporting && isSelected
          ? 'outline outline-1 outline-white/80 bg-white/[0.04] rounded px-1.5 py-1 cursor-grab active:cursor-grabbing'
          : 'hover:outline hover:outline-1 hover:outline-white/30 rounded px-1.5 py-1 cursor-grab'
      }`}
      style={{
        left: `${currentX}px`,
        top: `${currentY}px`,
        transform: 'translate(-50%, -50%)',
        width: resolvedWidth,
        height: resolvedHeight,
        maxWidth: resolvedMaxWidth,
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (!isExporting) {
          e.stopPropagation();
          selectText(textId);
        }
      }}
      onDoubleClick={(e) => {
        if (!isExporting) {
          e.stopPropagation();
          setIsInlineEditing(true);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Visual drag move badge when selected */}
      {!isExporting && isSelected && !isInlineEditing && (
        <div
          title="Drag to reposition text (snaps to center)"
          className="absolute -top-5 left-1/2 -translate-x-1/2 p-0.5 rounded bg-white text-black shadow flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-none z-40"
        >
          <ArrowsOutCardinal size={11} weight="bold" />
        </div>
      )}

      {/* Live Dimension Tooltip while resizing */}
      {!isExporting && isSelected && liveDimensions && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#090a0d] border border-white/30 rounded text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap z-50">
          W: {liveDimensions.width}px × H: {liveDimensions.height}px
        </div>
      )}

      {/* ================= Canva-Style Edge and Corner Resize Handles ================= */}
      {!isExporting && isSelected && !isInlineEditing && (
        <>
          {/* Left Edge Handle (Width) */}
          <div
            title="Drag to resize column width"
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white border border-black rounded-full cursor-ew-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'left')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />

          {/* Right Edge Handle (Width) */}
          <div
            title="Drag to resize column width"
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white border border-black rounded-full cursor-ew-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'right')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />

          {/* Top Edge Handle (Height) */}
          <div
            title="Drag to resize column height"
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-black rounded-full cursor-ns-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'top')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />

          {/* Bottom Edge Handle (Height) */}
          <div
            title="Drag to resize column height"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-black rounded-full cursor-ns-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'bottom')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />

          {/* Corner Handles */}
          <div
            title="Drag to resize"
            className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-black rounded-full cursor-nwse-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'tl')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />
          <div
            title="Drag to resize"
            className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-black rounded-full cursor-nesw-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'tr')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />
          <div
            title="Drag to resize"
            className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-black rounded-full cursor-nesw-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'bl')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />
          <div
            title="Drag to resize"
            className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-black rounded-full cursor-nwse-resize hover:scale-125 active:scale-125 transition-transform shadow-md z-40"
            onPointerDown={(e) => handleResizePointerDown(e, 'br')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />
        </>
      )}

      {isInlineEditing && !isExporting ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            updateText(textId, { content: e.target.value });
            e.target.style.height = '0px';
            e.target.style.height = `${Math.max(44, e.target.scrollHeight + 8)}px`;
          }}
          onBlur={() => setIsInlineEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsInlineEditing(false);
          }}
          className="w-full bg-[#0a0c10]/95 border border-white text-white rounded-lg p-2 outline-none resize-none overflow-hidden shadow-2xl backdrop-blur-md"
          style={{
            fontFamily: getFontFamilyCss(),
            fontSize: `${fontSize}px`,
            fontWeight,
            color,
            textAlign: align,
            letterSpacing: `${letterSpacing}px`,
            lineHeight,
            fontStyle: italic ? 'italic' : 'normal',
            textTransform,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        />
      ) : (
        <div
          className="whitespace-pre-wrap leading-relaxed w-full"
          style={{
            fontFamily: getFontFamilyCss(),
            fontSize: `${fontSize}px`,
            fontWeight,
            color,
            textAlign: align,
            letterSpacing: `${letterSpacing}px`,
            lineHeight,
            fontStyle: italic ? 'italic' : 'normal',
            textTransform,
            textShadow: textShadowStyle,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
