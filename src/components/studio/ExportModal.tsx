import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageExport } from '../../core/hooks/useImageExport';
import { useEditorStore } from '../../core/store/useEditorStore';
import { POPOVER_VARIANTS } from '../../core/motion/transitions';
import { X, Download, Share2, Sparkles, Loader2 } from 'lucide-react';

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
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#0e1017] border border-white/10 rounded-2xl shadow-2xl flex flex-col text-white z-10"
          >
            {/* Header (Swiss Minimalist) */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#12151e]">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                    <span className="italic font-bold">Disposé</span>
                    <span className="text-white/40">•</span>
                    <span>Export Story</span>
                  </h2>
                  <p className="text-[11px] text-white/50">
                    {resolution === '4k'
                      ? '2160 × 3840 px • 4K Ultra HD resolution'
                      : '1080 × 1920 px • Crisp Swiss Full HD'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors active:scale-[0.97]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col items-center">
              {/* Preview Container */}
              <div className="relative w-48 aspect-[9/16] bg-black/50 rounded-xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center mb-5">
                {isExportingImage ? (
                  <div className="flex flex-col items-center gap-2 text-white/70">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <span className="text-[10px] font-mono text-center px-2">
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
                  <span className="text-xs text-white/40">Ready to export</span>
                )}
              </div>

              {/* Resolution Options (1080p vs 4K Ultra HD) */}
              <div className="w-full max-w-xs flex items-center justify-between mb-3 text-xs">
                <span className="text-white/60 font-medium">Quality:</span>
                <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    className={`px-3 py-1 rounded-md transition-all active:scale-[0.97] cursor-pointer ${
                      resolution === '1080p'
                        ? 'bg-blue-600 text-white font-medium shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    1080p (FHD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('4k')}
                    className={`px-3 py-1 rounded-md transition-all active:scale-[0.97] cursor-pointer flex items-center gap-1.5 ${
                      resolution === '4k'
                        ? 'bg-blue-600 text-white font-medium shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>4K (UHD)</span>
                    <span className="text-[8.5px] uppercase font-mono tracking-wider px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Ultra
                    </span>
                  </button>
                </div>
              </div>

              {/* Format Options */}
              <div className="w-full max-w-xs flex items-center justify-between gap-2 mb-6 text-xs">
                <span className="text-white/60 font-medium">Format:</span>
                <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`px-3 py-1 rounded-md transition-all active:scale-[0.97] cursor-pointer ${
                      format === 'png'
                        ? 'bg-blue-600 text-white font-medium shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('jpeg')}
                    className={`px-3 py-1 rounded-md transition-all active:scale-[0.97] cursor-pointer ${
                      format === 'jpeg'
                        ? 'bg-blue-600 text-white font-medium shadow'
                        : 'text-white/60 hover:text-white'
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
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Download {resolution === '4k' ? '4K Ultra (2160×3840)' : '1080p (1080×1920)'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isExportingImage || !exportedDataUrl}
                  onClick={handleShare}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-[0.97] cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
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
