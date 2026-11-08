import { useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import confetti from 'canvas-confetti';
import { useEditorStore } from '../store/useEditorStore';

export interface ExportOptions {
  format?: 'png' | 'jpeg';
  quality?: number; // 0.8 to 1.0
  pixelRatio?: number; // default 3 for 1080x1920
  fileName?: string;
}

export function useImageExport() {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const setIsExporting = useEditorStore((s) => s.setIsExporting);
  const selectSlot = useEditorStore((s) => s.selectSlot);
  const selectText = useEditorStore((s) => s.selectText);

  const exportArtboard = async (
    artboardElement: HTMLElement,
    options: ExportOptions = {}
  ): Promise<{ dataUrl: string; blob: Blob } | null> => {
    const {
      format = 'png',
      quality = 0.95,
      pixelRatio = 3, // 360x640 * 3 = 1080x1920!
      fileName = 'social-dump-recap.png',
    } = options;

    try {
      setIsExportingImage(true);
      setExportProgress('Preparing clean canvas...');

      // Deselect all active selections and notify store for clean export
      selectSlot(null);
      selectText(null);
      setIsExporting(true);

      // Allow DOM to flush out any selection rings, crop handles, etc.
      await new Promise((resolve) => setTimeout(resolve, 150));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      setExportProgress(
        `Rendering canvas (${pixelRatio >= 6 ? '4K Ultra UHD 2160x3840' : '1080p FHD 1080x1920'})...`
      );

      const exportConfig = {
        pixelRatio,
        quality,
        cacheBust: false,
        skipFonts: false,
        backgroundColor: '#000000',
        style: {
          transform: 'none',
          transformOrigin: 'top left',
        },
      };

      const dataUrl =
        format === 'jpeg'
          ? await toJpeg(artboardElement, exportConfig)
          : await toPng(artboardElement, exportConfig);

      // Convert dataUrl to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#f43f5e', '#3b82f6', '#fbbf24', '#10b981'],
        });
      } catch {
        // ignore if confetti fails
      }

      setExportProgress('Complete!');
      return { dataUrl, blob };
    } catch (error) {
      console.error('Error exporting artboard image:', error);
      alert('Export failed. Please check browser permissions and try again.');
      return null;
    } finally {
      setIsExporting(false);
      setIsExportingImage(false);
      setExportProgress(null);
    }
  };

  /**
   * Triggers download or native mobile Web Share sheet
   */
  const downloadOrShare = async (
    blob: Blob,
    dataUrl: string,
    fileName: string
  ): Promise<boolean> => {
    const file = new File([blob], fileName, { type: blob.type });

    // Try native Web Share API (Mobile Safari, Chrome on Android)
    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] }) &&
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Photo Dump Recap',
          text: 'Created with Social Photo Dump Studio',
        });
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') return true; // User cancelled
        console.warn('Web Share failed, falling back to download:', err);
      }
    }

    // Direct browser file download fallback
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  };

  return {
    exportArtboard,
    downloadOrShare,
    isExportingImage,
    exportProgress,
  };
}
