import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageExport } from '../../core/hooks/useImageExport';
import { useEditorStore } from '../../core/store/useEditorStore';
import { POPOVER_VARIANTS } from '../../core/motion/transitions';
import {
  X,
  DownloadSimple,
  ShareNetwork,
  Sparkle,
  CircleNotch,
} from '@phosphor-icons/react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  artboardElement: HTMLElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  artboardElement,
}) => {
  const { exportArtboard, downloadOrShare, isExportingImage, exportProgress } =
    useImageExport();
  const activeTemplateId = useEditorStore((s) => s.activeTemplateId);

  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [resolution, setResolution] = useState<'1080p' | '4k'>('4k');
  const [exportedDataUrl, setExportedDataUrl] = useState<string | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  const pixelRatio = resolution === '4k' ? 6 : 3;
  const fileName = `dispose-story-${resolution}.${format === 'jpeg' ? 'jpg' : 'png'}`;

  // Auto trigger render on modal open or options change
  useEffect(() => {
    if (isOpen && artboardElement) {
      setExportedDataUrl(null);
      setExportedBlob(null);

      exportArtboard(artboardElement, {
        format,
        pixelRatio,
        fileName,
      }).then((res) => {
        if (res) {
          setExportedDataUrl(res.dataUrl);
          setExportedBlob(res.blob);
        }
      });
    }
  }, [isOpen, format, resolution, artboardElement, activeTemplateId]);

  const handleDownload = () => {
    if (exportedBlob && exportedDataUrl) {
      downloadOrShare(exportedBlob, exportedDataUrl, fileName);
    }
  };

  const handleShare = async () => {
    if (exportedBlob && exportedDataUrl) {
      await downloadOrShare(exportedBlob, exportedDataUrl, fileName);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            variants={POPOVER_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[var(--neu-panel)] border border-[var(--neu-border-highlight)] rounded-2xl shadow-[18px_18px_45px_rgba(0,0,0,0.7)] flex flex-col text-white z-10"
          >
            {/* Header (Tactile Neumorphic) */}
            <div className="p-4 border-b border-[var(--neu-border-highlight)] flex items-center justify-between bg-[var(--neu-panel)]">
              <div className="flex items-center gap-2.5">
                <Sparkle size={18} weight="bold" className="text-white" />
                <div className="text-left">
                  <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                    <span className="italic font-bold">Disposé</span>
                    <span className="text-white/40">•</span>
                    <span>Export Story</span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    {resolution === '4k'
                      ? '2160 × 3840 px • 4K Ultra HD resolution'
                      : '1080 × 1920 px • Crisp Swiss Full HD'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl neu-button text-zinc-300 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col items-center">
              {/* Preview Container */}
              <div className="relative w-48 aspect-[9/16] neu-well rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center mb-5 border border-black/40">
                {isExportingImage ? (
                  <div className="flex flex-col items-center gap-2 text-white/70">
                    <CircleNotch size={24} weight="bold" className="animate-spin text-white" />
                    <span className="text-[10px] text-center px-2">
                      {exportProgress || 'Rendering...'}
                    </span>
                  </div>
                ) : exportedDataUrl ? (
                  <img
                    src={exportedDataUrl}
                    alt="Disposé Story Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-zinc-500">Ready to export</span>
                )}
              </div>

              {/* Resolution Options (1080p vs 4K Ultra HD) */}
              <div className="w-full max-w-xs flex items-center justify-between mb-3 text-xs">
                <span className="text-zinc-400 font-medium text-left">Quality</span>
                <div className="flex neu-well p-1 rounded-xl text-right">
                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    className={`px-3 py-1 rounded-lg transition-all active:scale-[0.97] cursor-pointer ${
                      resolution === '1080p'
                        ? 'neu-raised-sm text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    1080p (FHD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('4k')}
                    className={`px-3 py-1 rounded-lg transition-all active:scale-[0.97] cursor-pointer ${
                      resolution === '4k'
                        ? 'neu-raised-sm text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    4K (UHD)
                  </button>
                </div>
              </div>

              {/* Format Options */}
              <div className="w-full max-w-xs flex items-center justify-between gap-2 mb-6 text-xs">
                <span className="text-zinc-400 font-medium text-left">Format</span>
                <div className="flex neu-well p-1 rounded-xl text-right">
                  <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`px-3 py-1 rounded-lg transition-all active:scale-[0.97] cursor-pointer ${
                      format === 'png'
                        ? 'neu-raised-sm text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('jpeg')}
                    className={`px-3 py-1 rounded-lg transition-all active:scale-[0.97] cursor-pointer ${
                      format === 'jpeg'
                        ? 'neu-raised-sm text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    JPEG (Compact)
                  </button>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isExportingImage || !exportedDataUrl}
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 rounded-xl neu-button text-white disabled:opacity-40 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <DownloadSimple size={16} weight="bold" />
                  <span>
                    Download {resolution === '4k' ? '4K Ultra (2160×3840)' : '1080p (1080×1920)'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isExportingImage || !exportedDataUrl}
                  onClick={handleShare}
                  className="py-3 px-4 rounded-xl neu-button text-zinc-300 hover:text-white disabled:opacity-40 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShareNetwork size={16} weight="bold" />
                  <span>Share {resolution === '4k' ? '4K' : 'HD'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
