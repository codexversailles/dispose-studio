import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '../../core/store/useEditorStore';
import { POPOVER_VARIANTS } from '../../core/motion/transitions';
import { CalendarX, WarningCircle, X } from '@phosphor-icons/react';

export const RejectionNoticeModal: React.FC = () => {
  const rejectionNoticeData = useEditorStore((s) => s.rejectionNoticeData);
  const setRejectionNoticeData = useEditorStore((s) => s.setRejectionNoticeData);

  if (!rejectionNoticeData) return null;

  const { rejected, targetMonthName, targetYear } = rejectionNoticeData;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none">
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={() => setRejectionNoticeData(null)}
        />

        {/* Modal Window */}
        <motion.div
          variants={POPOVER_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative w-full max-w-md bg-[var(--neu-panel)] border border-[var(--neu-border-highlight)] rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] flex flex-col text-white z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--neu-border-highlight)] flex items-center justify-between bg-[var(--neu-panel)] shrink-0">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center text-amber-400 shrink-0">
                <CalendarX size={22} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2">
                  <span>Photos Rejected</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Does not match {targetMonthName} {targetYear}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRejectionNoticeData(null)}
              className="min-w-[40px] min-h-[40px] rounded-xl neu-button text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0 ml-2"
              aria-label="Close"
            >
              <X size={17} weight="bold" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-4 text-xs text-left">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
              <WarningCircle size={18} weight="bold" className="shrink-0 text-amber-400 mt-0.5" />
              <p className="text-[12px] leading-relaxed">
                The dates of {rejected.length === 1 ? 'this photo' : `these ${rejected.length} photos`} do not match the current calendar period (<strong>{targetMonthName} {targetYear}</strong>). They were rejected to keep your calendar accurate.
              </p>
            </div>

            {/* List of rejected photos */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1">
                Rejected Photos ({rejected.length})
              </span>
              {rejected.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl neu-well flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate flex-1">
                    <p className="font-medium text-white truncate text-[11px]">
                      {item.fileName}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      Detected date: {item.detectedDateStr}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    Mismatch
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zinc-400 leading-normal pt-1">
              💡 <strong>Tip:</strong> You can switch the active calendar month in the Calendar Inspector tab if you want to create a recap for another month.
            </p>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-[var(--neu-border-highlight)] flex justify-end bg-[var(--neu-panel)] shrink-0">
            <button
              type="button"
              onClick={() => setRejectionNoticeData(null)}
              className="min-h-[44px] px-6 rounded-xl font-semibold text-xs bg-white text-zinc-950 hover:bg-zinc-100 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Understood
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
