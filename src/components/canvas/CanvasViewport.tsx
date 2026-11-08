import React, { useRef, useState, useEffect, RefObject } from 'react';
import { useEditorStore } from '../../core/store/useEditorStore';
import { compressMultipleImages } from '../../core/utils/imageCompressor';
import { StoryArtboard } from './StoryArtboard';
import { CloudArrowUp } from '@phosphor-icons/react';

interface CanvasViewportProps {
  artboardRef: RefObject<HTMLDivElement | null>;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({ artboardRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const setZoomLevel = useEditorStore((s) => s.setZoomLevel);
  const bulkFillSlots = useEditorStore((s) => s.bulkFillSlots);

  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1);
  const lastTapTimeRef = useRef<number>(0);

  // Auto-fit calculation
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const paddingX = clientWidth < 640 ? 16 : 60;
      const paddingY = clientWidth < 640 ? 80 : 60;

      if (zoomLevel > 0) {
        setScale(zoomLevel);
        return;
      }

      const availableW = clientWidth - paddingX;
      const availableH = clientHeight - paddingY;

      const scaleW = availableW / 360;
      const scaleH = availableH / 640;
      const fitScale = Math.min(scaleW, scaleH, 1.4); // max scale 1.4 for sharpness

      setScale(Math.max(0.35, fitScale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [zoomLevel]);

  // Touch Pinch-to-Zoom (Mobile) & Trackpad/Ctrl+Wheel Zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDistance = (touches: TouchList) => {
      return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialPinchDistRef.current = getDistance(e.touches);
        initialPinchScaleRef.current = scale;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        // Double-tap on canvas background resets zoom to auto-fit
        if (now - lastTapTimeRef.current < 300) {
          setZoomLevel(0);
        }
        lastTapTimeRef.current = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
        e.preventDefault();
        const currentDist = getDistance(e.touches);
        const factor = currentDist / initialPinchDistRef.current;
        const nextScale = Math.min(Math.max(0.35, initialPinchScaleRef.current * factor), 3.0);
        setScale(nextScale);
        setZoomLevel(nextScale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialPinchDistRef.current = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.005;
        const nextScale = Math.min(Math.max(0.35, scale + delta), 3.0);
        setScale(nextScale);
        setZoomLevel(nextScale);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [scale, setZoomLevel]);

  // Global Drag and Drop for Bulk Photos
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDropTarget) setIsDropTarget(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );

    if (files.length === 0) return;

    setUploadStatus(`Ingesting & compressing ${files.length} photos...`);
    try {
      const results = await compressMultipleImages(files, (curr, total) => {
        setUploadStatus(`Processed ${curr}/${total} photos...`);
      });

      const urls = results.map((r) => r.blobUrl);
      bulkFillSlots(urls);
      setUploadStatus(null);
    } catch (err) {
      console.error('Bulk drop failed:', err);
      setUploadStatus(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full bg-[var(--color-studio-viewport)] overflow-hidden flex items-center justify-center p-2 sm:p-4 pb-18 md:pb-4 select-none touch-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Artboard Scaled Container */}
      <div
        className="relative transition-transform duration-100 ease-out flex items-center justify-center"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <StoryArtboard ref={artboardRef} />
      </div>

      {/* Drag & Drop Visual Overlay (Swiss Monochrome) */}
      {isDropTarget && (
        <div className="absolute inset-4 z-50 rounded-xl border border-dashed border-white/20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white pointer-events-none">
          <CloudArrowUp size={44} weight="bold" className="text-white mb-2" />
          <p className="text-lg font-semibold tracking-tight">Drop photos here to fill grid</p>
          <p className="text-xs text-zinc-400 mt-1">
            Photos will be compressed client-side and saved to your project
          </p>
        </div>
      )}

      {/* Uploading progress notification */}
      {uploadStatus && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 neu-raised text-white text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 z-40">
          <CloudArrowUp size={16} weight="bold" />
          <span>{uploadStatus}</span>
        </div>
      )}
    </div>
  );
};
