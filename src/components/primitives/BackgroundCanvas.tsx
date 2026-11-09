import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { FILM_GRAIN_SVG } from '../../core/utils/sampleImages';

interface BackgroundCanvasProps {
  interactive?: boolean;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ interactive = false }) => {
  const background = useEditorStore((s) => s.background);
  const updateBackground = useEditorStore((s) => s.updateBackground);
  const isExporting = useEditorStore((s) => s.isExporting);

  const [isPanning, setIsPanning] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startBgPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive || isExporting || !background.imageUrl) return;
    setIsPanning(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startBgPos.current = { ...background.position };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || !interactive) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const factor = 0.25;
    updateBackground({
      position: {
        x: Math.min(100, Math.max(-100, startBgPos.current.x + dx * factor)),
        y: Math.min(100, Math.max(-100, startBgPos.current.y + dy * factor)),
      },
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setIsPanning(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const { imageUrl, scale, position, dimOpacity, grainOpacity, blur, fallbackColor } = background;

  return (
    <div
      className={`absolute inset-0 overflow-hidden select-none ${
        interactive && !isExporting && imageUrl ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{ backgroundColor: fallbackColor || '#13161e' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background Image: only rendered when user has uploaded an image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Canvas Background"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full max-w-full max-h-full object-contain pointer-events-none select-none will-change-transform"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center center',
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
            transition: isPanning ? 'none' : 'transform 0.08s ease-out',
          }}
        />
      )}

      {/* Dimming overlay (when image is present) */}
      {imageUrl && dimOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${dimOpacity})`,
          }}
        />
      )}

      {/* Film grain texture overlay */}
      {grainOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("${FILM_GRAIN_SVG}")`,
            backgroundRepeat: 'repeat',
            opacity: grainOpacity * 2.5,
          }}
        />
      )}
    </div>
  );
};
