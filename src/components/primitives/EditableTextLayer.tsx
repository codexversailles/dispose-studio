import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { SnapGuide } from '../../core/types/template';
import { ArrowsOutCardinal } from '@phosphor-icons/react';

interface EditableTextLayerProps {
  textId: string;
}

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

  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 180,
    startY: 100,
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize inline textarea height to scrollHeight smoothly
  useEffect(() => {
    if (isInlineEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${Math.max(28, textareaRef.current.scrollHeight)}px`;
    }
  }, [isInlineEditing]);

  useEffect(() => {
    if (isInlineEditing && textareaRef.current) {
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${Math.max(28, textareaRef.current.scrollHeight)}px`;
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
    if (isExporting || isInlineEditing) return;

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

    // Pause history tracking during continuous text drag
    useEditorStore.temporal?.getState()?.pause();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isExporting || isInlineEditing) return;

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

    // Commit final drop position as a single clean undo/redo step
    const currentText = useEditorStore.getState().textLayers[textId];
    const finalX = currentText?.position?.x ?? currentX;
    const finalY = currentText?.position?.y ?? currentY;
    const startX = dragStartRef.current.startX;
    const startY = dragStartRef.current.startY;

    if (finalX !== startX || finalY !== startY) {
      updateTextPosition(textId, startX, startY);
      useEditorStore.temporal?.getState()?.resume();
      updateTextPosition(textId, finalX, finalY);
    } else {
      useEditorStore.temporal?.getState()?.resume();
    }

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
      className="absolute z-30 select-none box-border flex flex-col justify-center touch-none"
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
          setIsInlineEditing(true);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Visual drag move badge when selected */}
      {!isExporting && isSelected && (
        <div
          title="Drag to reposition text (snaps to center)"
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#141722] text-zinc-300 hover:text-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-40 touch-none"
          onPointerDown={handlePointerDown}
        >
          <ArrowsOutCardinal size={12} weight="bold" />
        </div>
      )}

      {isInlineEditing && !isExporting ? (
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              updateText(textId, { content: e.target.value });
              e.target.style.height = '0px';
              e.target.style.height = `${Math.max(28, e.target.scrollHeight)}px`;
            }}
            onBlur={() => setIsInlineEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsInlineEditing(false);
            }}
            className="w-full bg-transparent border-0 outline-none resize-none overflow-hidden p-0 m-0 shadow-none block selection:bg-white/20"
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
              caretColor: color || '#ffffff',
            }}
          />
          {content.length === 0 && (
            <span
              className="absolute top-0 left-0 pointer-events-none select-none animate-blink font-light"
              style={{
                fontFamily: getFontFamilyCss(),
                fontSize: `${fontSize}px`,
                color: color || '#ffffff',
                lineHeight,
              }}
            >
              |
            </span>
          )}
        </div>
      ) : (
        <div
          className="whitespace-pre-wrap leading-relaxed w-full cursor-text"
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
          {!isExporting && isSelected && (
            <span
              className="inline-block animate-blink font-light ml-0.5 select-none pointer-events-none"
              style={{ color: color || '#ffffff' }}
            >
              |
            </span>
          )}
        </div>
      )}
    </div>
  );
};
