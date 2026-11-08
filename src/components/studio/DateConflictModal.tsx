import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '../../core/store/useEditorStore';
import { POPOVER_VARIANTS } from '../../core/motion/transitions';
import {
  CalendarBlank,
  CheckCircle,
  WarningCircle,
  X,
  Check,
} from '@phosphor-icons/react';

export const DateConflictModal: React.FC = () => {
  const dateConflictData = useEditorStore((s) => s.dateConflictData);
  const setDateConflictData = useEditorStore((s) => s.setDateConflictData);
  const confirmDateConflictPlacements = useEditorStore(
    (s) => s.confirmDateConflictPlacements
  );

  // Local state mapping day -> chosen photo blobUrl
  const [selections, setSelections] = useState<Record<number, string>>({});

  useEffect(() => {
    if (dateConflictData) {
      const initial: Record<number, string> = {};
      dateConflictData.conflicts.forEach((c) => {
        initial[c.day] = c.photos[0]?.blobUrl || '';
      });
      setSelections(initial);
    }
  }, [dateConflictData]);

  if (!dateConflictData) return null;

  const { conflicts, directMatches, rejected, targetMonthName, targetYear } =
    dateConflictData;
  const directMatchCount = Object.keys(directMatches).length;

  const handleSelectPhoto = (day: number, blobUrl: string) => {
    setSelections((prev) => ({
      ...prev,
      [day]: blobUrl,
    }));
  };

  const handleApply = () => {
    // Combine chosen conflict photos with direct matches
    const allPlacements: Record<number, string> = {};

    Object.entries(directMatches).forEach(([dayStr, item]) => {
      allPlacements[Number(dayStr)] = item.blobUrl;
    });

    Object.entries(selections).forEach(([dayStr, blobUrl]) => {
      if (blobUrl) {
        allPlacements[Number(dayStr)] = blobUrl;
      }
    });

    confirmDateConflictPlacements(allPlacements);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none">
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={() => setDateConflictData(null)}
        />

        {/* Modal Window */}
        <motion.div
          variants={POPOVER_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative w-full max-w-xl max-h-[88vh] bg-[var(--neu-panel)] border border-[var(--neu-border-highlight)] rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] flex flex-col text-white z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--neu-border-highlight)] flex items-center justify-between bg-[var(--neu-panel)] shrink-0">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center text-white shrink-0">
                <CalendarBlank size={20} weight="bold" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2">
                  <span>Select Photos for Duplicate Dates</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                    {targetMonthName} {targetYear}
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Multiple photos share the same date. Tap the picture you want for each day.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDateConflictData(null)}
              className="min-w-[40px] min-h-[40px] rounded-xl neu-button text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0 ml-2"
              aria-label="Close"
            >
              <X size={17} weight="bold" />
            </button>
          </div>

          {/* Optional Rejection Warning Banner */}
          {rejected.length > 0 && (
            <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5 shrink-0">
              <WarningCircle size={17} weight="bold" className="shrink-0 text-amber-400 mt-0.5" />
              <div className="flex-1 text-left">
                <p className="font-medium text-amber-300">
                  {rejected.length} photo{rejected.length > 1 ? 's were' : ' was'} rejected
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Dates do not match {targetMonthName} {targetYear}. Only matching photos are shown below.
                </p>
              </div>
            </div>
          )}

          {/* Scrollable Conflict Sections */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-xs">
            {conflicts.map((conflict) => {
              const selectedBlob = selections[conflict.day];

              return (
                <div
                  key={conflict.day}
                  className="space-y-3 pb-4 border-b border-[var(--neu-border-highlight)] last:border-b-0"
                >
                  {/* Day Title & Photo Count */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2 text-left">
                      <span>{conflict.dateTitle}</span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                        Day {conflict.day}
                      </span>
                    </span>
                    <span className="text-[11px] text-zinc-400 text-right">
                      {conflict.photos.length} photos available
                    </span>
                  </div>

                  {/* Candidate Photo Cards */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {conflict.photos.map((photo) => {
                      const isSelected = selectedBlob === photo.blobUrl;

                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => handleSelectPhoto(conflict.day, photo.blobUrl)}
                          className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-1 text-left ${
                            isSelected
                              ? 'border-white ring-2 ring-white/40 shadow-xl scale-[1.02]'
                              : 'border-white/10 opacity-60 hover:opacity-90 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={photo.blobUrl}
                            alt={photo.fileName}
                            className="w-full h-full object-cover rounded-lg"
                          />

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 rounded-full bg-white text-zinc-950 p-0.5 shadow-md">
                              <CheckCircle size={18} weight="fill" className="text-zinc-950" />
                            </div>
                          )}

                          {/* Time / Filename Pill */}
                          <div className="absolute bottom-1.5 inset-x-1.5 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-300 truncate text-center">
                            {photo.timeStr || photo.fileName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Matches Summary Banner */}
          {directMatchCount > 0 && (
            <div className="px-5 py-2.5 border-t border-[var(--neu-border-highlight)] bg-black/20 flex items-center gap-2 text-[11px] text-zinc-400 shrink-0 text-left">
              <Check size={14} weight="bold" className="text-emerald-400 shrink-0" />
              <span>
                <strong className="text-zinc-200">{directMatchCount}</strong> other photo
                {directMatchCount > 1 ? 's' : ''} have unique dates and will be placed automatically.
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-[var(--neu-border-highlight)] flex items-center justify-between gap-3 bg-[var(--neu-panel)] shrink-0">
            <button
              type="button"
              onClick={() => setDateConflictData(null)}
              className="min-h-[44px] px-4 rounded-xl neu-button text-zinc-400 hover:text-white text-xs font-medium cursor-pointer active:scale-95 transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="min-h-[44px] px-5 rounded-xl font-semibold text-xs flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Check size={16} weight="bold" />
              <span>Apply Selected Photos</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
