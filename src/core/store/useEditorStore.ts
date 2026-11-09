import { create } from 'zustand';
import { temporal } from 'zundo';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import {
  AspectRatio,
  BackgroundConfig,
  CalendarConfig,
  FrameStyle,
  GridConfig,
  SlotState,
  SnapGuide,
  TextLayerState,
} from '../types/template';
import { getTemplateById, DEFAULT_TEMPLATE_ID } from '../../templates';
import { generateCalendarSlots, MONTH_NAMES } from '../utils/calendarGenerator';
import {
  DateConflictDay,
  ProcessedPhotoItem,
  RejectedPhotoItem,
} from '../utils/batchPhotoProcessor';

const IDB_STATE_KEY = 'dumpstudio_project_state_v2';

export interface EditorState {
  // Core template state (tracked in Undo/Redo)
  activeTemplateId: string;
  aspectRatio: AspectRatio;
  background: BackgroundConfig;
  gridConfig: GridConfig;
  calendarConfig: CalendarConfig;
  slots: Record<string, SlotState>;
  textLayers: Record<string, TextLayerState>;

  // Session & UI state (NOT tracked in Undo/Redo)
  selectedSlotId: string | null;
  selectedTextId: string | null;
  draggedSlotId: string | null;
  isExporting: boolean;
  zoomLevel: number; // 0 for "auto-fit", or 0.5 - 2.0
  activeInspectorTab: 'canvas' | 'slot' | 'text' | 'calendar';
  activeSnapGuides: SnapGuide[];
  isMobileInspectorOpen: boolean;
  isGridSelected: boolean;

  // Date Conflict & Rejection Floating Modals (UI state)
  dateConflictData: {
    conflicts: DateConflictDay[];
    directMatches: Record<number, ProcessedPhotoItem>;
    rejected: RejectedPhotoItem[];
    targetMonthName: string;
    targetYear: number;
  } | null;
  setDateConflictData: (
    data: {
      conflicts: DateConflictDay[];
      directMatches: Record<number, ProcessedPhotoItem>;
      rejected: RejectedPhotoItem[];
      targetMonthName: string;
      targetYear: number;
    } | null
  ) => void;

  rejectionNoticeData: {
    rejected: RejectedPhotoItem[];
    targetMonthName: string;
    targetYear: number;
  } | null;
  setRejectionNoticeData: (
    data: {
      rejected: RejectedPhotoItem[];
      targetMonthName: string;
      targetYear: number;
    } | null
  ) => void;

  // Actions
  setIsMobileInspectorOpen: (open: boolean) => void;
  selectGrid: (selected: boolean) => void;
  setTemplate: (templateId: string) => void;
  updateBackground: (partial: Partial<BackgroundConfig>) => void;
  updateGridConfig: (partial: Partial<GridConfig>) => void;
  updateCalendarConfig: (partial: Partial<CalendarConfig>) => void;
  toggleDateNumbers: () => void;
  updateSlot: (slotId: string, partial: Partial<SlotState>) => void;
  updateSlotImage: (slotId: string, imageUrl: string | null) => void;
  swapSlots: (slotIdA: string, slotIdB: string) => void;
  clearSlot: (slotId: string) => void;
  toggleSlotBorder: (slotId: string) => void;
  setSlotFrameStyle: (slotId: string, frameStyle: FrameStyle) => void;
  bulkFillSlots: (imageUrls: string[]) => void;
  fillCalendarDaySlots: (placements: Record<number, string>) => void;
  confirmDateConflictPlacements: (resolvedPlacements: Record<number, string>) => void;
  shufflePhotos: () => void;
  updateText: (textId: string, partial: Partial<TextLayerState>) => void;
  updateTextPosition: (textId: string, x: number, y: number) => void;
  updateGridPosition: (x: number, y: number) => void;
  setActiveSnapGuides: (guides: SnapGuide[]) => void;
  selectSlot: (slotId: string | null) => void;
  selectText: (textId: string | null) => void;
  setDraggedSlotId: (slotId: string | null) => void;
  setIsExporting: (isExporting: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  setActiveInspectorTab: (tab: 'canvas' | 'slot' | 'text' | 'calendar') => void;
  applyMonthCalendar: (year: number, month: number, startDay: 'sun' | 'mon') => void;
  resetCurrentTemplate: () => void;
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<boolean>;
}

const defaultTemplate = getTemplateById(DEFAULT_TEMPLATE_ID);

const initialSlots: Record<string, SlotState> = {};
defaultTemplate.defaultSlots.forEach((s) => {
  initialSlots[s.id] = { ...s };
});

let firstPastState: any = null;
let lastDeltaState: any = null;
let pendingDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingHandleSetFn: any = null;
let pendingCurrentStateObj: any = null;

export function flushPendingHistory(): void {
  if (pendingDebounceTimer) {
    clearTimeout(pendingDebounceTimer);
    pendingDebounceTimer = null;
  }
  if (firstPastState && pendingHandleSetFn) {
    const s = firstPastState;
    firstPastState = null;
    pendingHandleSetFn(s, undefined, pendingCurrentStateObj, lastDeltaState);
    pendingHandleSetFn = null;
  }
}

export function clearPendingHistory(): void {
  if (pendingDebounceTimer) {
    clearTimeout(pendingDebounceTimer);
    pendingDebounceTimer = null;
  }
  firstPastState = null;
  lastDeltaState = null;
  pendingHandleSetFn = null;
  pendingCurrentStateObj = null;
}

export function hasPendingHistory(): boolean {
  return Boolean(firstPastState);
}

export const useEditorStore = create<EditorState>()(
  temporal(
    (set, get) => ({
      activeTemplateId: defaultTemplate.id,
      aspectRatio: defaultTemplate.aspectRatio,
      background: { ...defaultTemplate.defaultBackground },
      gridConfig: { ...defaultTemplate.gridConfig },
      calendarConfig: defaultTemplate.calendarConfig
        ? { ...defaultTemplate.calendarConfig }
        : {
            enabled: false,
            year: 2026,
            month: 10,
            monthName: 'oktober',
            startDay: 'sun',
            rowCount: 5,
            showWeekdayHeader: true,
            showDateNumbers: false,
            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'],
            weekdayFontFamily: 'Arial Light',
            weekdayFontWeight: 300,
          },
      slots: initialSlots,
      textLayers: { ...defaultTemplate.textLayers },

      // UI state
      selectedSlotId: null,
      selectedTextId: null,
      draggedSlotId: null,
      isExporting: false,
      zoomLevel: 0, // auto-fit
      activeInspectorTab: 'canvas',
      activeSnapGuides: [],
      isMobileInspectorOpen: false,
      isGridSelected: false,
      dateConflictData: null,
      rejectionNoticeData: null,

      setDateConflictData: (data) => set({ dateConflictData: data }),
      setRejectionNoticeData: (data) => set({ rejectionNoticeData: data }),

      setTemplate: (templateId: string) => {
        const tmpl = getTemplateById(templateId);
        const newSlots: Record<string, SlotState> = {};
        tmpl.defaultSlots.forEach((s) => {
          newSlots[s.id] = { ...s };
        });

        set({
          activeTemplateId: tmpl.id,
          aspectRatio: tmpl.aspectRatio,
          background: { ...tmpl.defaultBackground },
          gridConfig: { ...tmpl.gridConfig },
          calendarConfig: tmpl.calendarConfig
            ? { ...tmpl.calendarConfig }
            : { ...get().calendarConfig, enabled: false },
          slots: newSlots,
          textLayers: { ...tmpl.textLayers },
          selectedSlotId: null,
          selectedTextId: null,
          activeInspectorTab: 'canvas',
          activeSnapGuides: [],
        });
      },

      updateBackground: (partial) => {
        set((state) => ({
          background: { ...state.background, ...partial },
        }));
      },

      updateGridConfig: (partial) => {
        set((state) => {
          const newGrid = { ...state.gridConfig, ...partial };
          let updatedSlots = state.slots;
          let updatedCalendar = state.calendarConfig;

          // Keep weekdays header color in sync with grid border color
          if (partial.borderColor !== undefined && updatedCalendar) {
            updatedCalendar = {
              ...updatedCalendar,
              weekdayColor: partial.borderColor,
            };
          }

          if (partial.borderColor !== undefined || partial.borderWidth !== undefined) {
            updatedSlots = {};
            for (const [id, slot] of Object.entries(state.slots)) {
              updatedSlots[id] = {
                ...slot,
                ...(partial.borderColor !== undefined ? { borderColor: partial.borderColor } : {}),
                ...(partial.borderWidth !== undefined ? { borderWidth: partial.borderWidth } : {}),
              };
            }
          }
          return {
            gridConfig: newGrid,
            slots: updatedSlots,
            calendarConfig: updatedCalendar,
          };
        });
      },

      updateCalendarConfig: (partial) => {
        set((state) => {
          const newCalendar = { ...state.calendarConfig, ...partial };
          let newGrid = state.gridConfig;
          let updatedSlots = state.slots;

          // If weekdayColor is updated directly, synchronize grid borderColor and slots
          if (partial.weekdayColor !== undefined) {
            newGrid = {
              ...state.gridConfig,
              borderColor: partial.weekdayColor,
            };
            updatedSlots = {};
            for (const [id, slot] of Object.entries(state.slots)) {
              updatedSlots[id] = {
                ...slot,
                borderColor: partial.weekdayColor,
              };
            }
          }

          return {
            calendarConfig: newCalendar,
            gridConfig: newGrid,
            slots: updatedSlots,
          };
        });
      },

      toggleDateNumbers: () => {
        set((state) => ({
          calendarConfig: {
            ...state.calendarConfig,
            showDateNumbers: !state.calendarConfig.showDateNumbers,
          },
        }));
      },

      updateTextPosition: (textId, x, y) => {
        set((state) => {
          const current = state.textLayers[textId];
          if (!current) return state;
          return {
            textLayers: {
              ...state.textLayers,
              [textId]: {
                ...current,
                position: {
                  ...current.position,
                  x,
                  y,
                },
              },
            },
          };
        });
      },

      updateGridPosition: (x, y) => {
        set((state) => ({
          gridConfig: {
            ...state.gridConfig,
            x,
            y,
          },
        }));
      },

      setActiveSnapGuides: (guides) => {
        set({ activeSnapGuides: guides });
      },

      updateSlot: (slotId, partial) => {
        set((state) => {
          const current = state.slots[slotId];
          if (!current) return state;
          return {
            slots: {
              ...state.slots,
              [slotId]: { ...current, ...partial },
            },
          };
        });
      },

      updateSlotImage: (slotId, imageUrl) => {
        set((state) => {
          const current = state.slots[slotId];
          if (!current) return state;
          return {
            slots: {
              ...state.slots,
              [slotId]: {
                ...current,
                imageUrl,
                frameStyle: imageUrl ? 'photo' : 'empty-bordered',
                hasBorder: current.hasBorder !== undefined ? current.hasBorder : true,
                scale: 1.0,
                x: 0,
                y: 0,
                aspectRatio: current.aspectRatio || '1:1',
              },
            },
          };
        });
      },

      swapSlots: (slotIdA, slotIdB) => {
        set((state) => {
          const slotA = state.slots[slotIdA];
          const slotB = state.slots[slotIdB];
          if (!slotA || !slotB) return state;

          return {
            slots: {
              ...state.slots,
              [slotIdA]: {
                ...slotA,
                imageUrl: slotB.imageUrl,
                scale: slotB.scale,
                x: slotB.x,
                y: slotB.y,
                frameStyle: slotB.frameStyle,
                hasBorder: slotB.hasBorder,
              },
              [slotIdB]: {
                ...slotB,
                imageUrl: slotA.imageUrl,
                scale: slotA.scale,
                x: slotA.x,
                y: slotA.y,
                frameStyle: slotA.frameStyle,
                hasBorder: slotA.hasBorder,
              },
            },
          };
        });
      },

      clearSlot: (slotId) => {
        set((state) => {
          const current = state.slots[slotId];
          if (!current) return state;
          return {
            slots: {
              ...state.slots,
              [slotId]: {
                ...current,
                imageUrl: null,
                scale: 1.0,
                x: 0,
                y: 0,
                frameStyle: 'empty-bordered',
                hasBorder: true,
              },
            },
          };
        });
      },

      toggleSlotBorder: (slotId) => {
        set((state) => {
          const current = state.slots[slotId];
          if (!current) return state;
          return {
            slots: {
              ...state.slots,
              [slotId]: {
                ...current,
                hasBorder: !current.hasBorder,
              },
            },
          };
        });
      },

      setSlotFrameStyle: (slotId, frameStyle) => {
        set((state) => {
          const current = state.slots[slotId];
          if (!current) return state;
          return {
            slots: {
              ...state.slots,
              [slotId]: {
                ...current,
                frameStyle,
                hasBorder:
                  frameStyle === 'photo'
                    ? false
                    : frameStyle === 'empty-bordered'
                    ? true
                    : current.hasBorder,
              },
            },
          };
        });
      },

      bulkFillSlots: (imageUrls: string[]) => {
        if (!imageUrls.length) return;
        set((state) => {
          const updatedSlots = { ...state.slots };
          const slotKeys = Object.keys(updatedSlots);

          // Find empty slots first, then overwrite if more images
          const emptySlotKeys = slotKeys.filter(
            (k) => updatedSlots[k].frameStyle !== 'hidden' && !updatedSlots[k].imageUrl
          );

          const targetKeys = emptySlotKeys.length > 0 ? emptySlotKeys : slotKeys.filter(k => updatedSlots[k].frameStyle !== 'hidden');

          imageUrls.forEach((url, idx) => {
            if (idx < targetKeys.length) {
              const k = targetKeys[idx];
              updatedSlots[k] = {
                ...updatedSlots[k],
                imageUrl: url,
                frameStyle: 'photo',
                hasBorder: updatedSlots[k].hasBorder !== undefined ? updatedSlots[k].hasBorder : true,
                scale: 1.0,
                x: 0,
                y: 0,
                aspectRatio: updatedSlots[k].aspectRatio || '1:1',
              };
            }
          });

          return { slots: updatedSlots };
        });
      },

      fillCalendarDaySlots: (placements: Record<number, string>) => {
        set((state) => {
          const updatedSlots = { ...state.slots };
          let changed = false;

          Object.entries(placements).forEach(([dayStr, blobUrl]) => {
            const slot = Object.values(updatedSlots).find(
              (s) => s.label === dayStr && s.frameStyle !== 'hidden'
            );
            if (slot) {
              updatedSlots[slot.id] = {
                ...slot,
                imageUrl: blobUrl,
                frameStyle: 'photo',
                hasBorder: slot.hasBorder !== undefined ? slot.hasBorder : true,
                scale: 1.0,
                x: 0,
                y: 0,
                aspectRatio: slot.aspectRatio || '1:1',
              };
              changed = true;
            }
          });

          return changed ? { slots: updatedSlots } : {};
        });
      },

      confirmDateConflictPlacements: (resolvedPlacements: Record<number, string>) => {
        const pendingRejected = get().dateConflictData?.rejected;
        const targetMonthName = get().dateConflictData?.targetMonthName;
        const targetYear = get().dateConflictData?.targetYear;

        get().fillCalendarDaySlots(resolvedPlacements);
        set({ dateConflictData: null });

        if (pendingRejected && pendingRejected.length > 0 && targetMonthName && targetYear) {
          set({
            rejectionNoticeData: {
              rejected: pendingRejected,
              targetMonthName,
              targetYear,
            },
          });
        }
      },

      shufflePhotos: () => {
        set((state) => {
          const activePhotos = Object.values(state.slots)
            .map((s) => s.imageUrl)
            .filter((url): url is string => Boolean(url));

          if (activePhotos.length < 2) return state;

          // Fisher-Yates shuffle
          const shuffled = [...activePhotos];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          const updatedSlots = { ...state.slots };
          let photoIndex = 0;

          Object.keys(updatedSlots).forEach((key) => {
            if (updatedSlots[key].imageUrl) {
              updatedSlots[key] = {
                ...updatedSlots[key],
                imageUrl: shuffled[photoIndex++],
              };
            }
          });

          return { slots: updatedSlots };
        });
      },

      updateText: (textId, partial) => {
        set((state) => {
          const current = state.textLayers[textId];
          if (!current) return state;
          return {
            textLayers: {
              ...state.textLayers,
              [textId]: { ...current, ...partial },
            },
          };
        });
      },

      selectSlot: (slotId) => {
        set({
          selectedSlotId: slotId,
          selectedTextId: null,
          isGridSelected: false,
          activeInspectorTab: slotId ? 'slot' : 'canvas',
          isMobileInspectorOpen: Boolean(slotId),
        });
      },

      selectText: (textId) => {
        set({
          selectedTextId: textId,
          selectedSlotId: null,
          isGridSelected: false,
          activeInspectorTab: textId ? 'text' : 'canvas',
          isMobileInspectorOpen: Boolean(textId),
        });
      },

      selectGrid: (selected) => {
        set({
          isGridSelected: selected,
          selectedSlotId: null,
          selectedTextId: null,
          activeInspectorTab: 'canvas',
          isMobileInspectorOpen: selected,
        });
      },

      setIsMobileInspectorOpen: (open) => {
        set({ isMobileInspectorOpen: open });
      },

      setDraggedSlotId: (slotId) => {
        set({ draggedSlotId: slotId });
      },

      setIsExporting: (isExporting) => {
        set({ isExporting });
      },

      setZoomLevel: (zoomLevel) => {
        set({ zoomLevel });
      },

      setActiveInspectorTab: (tab) => {
        set({ activeInspectorTab: tab });
      },

      applyMonthCalendar: (year, month, startDay) => {
        const state = get();
        const currentSlots = state.slots;

        // Preserve current photos by index
        const preservePhotos: Record<string, string | null> = {};
        const preserveStyles: Record<string, 'photo' | 'empty-bordered' | 'hidden'> = {};

        Object.keys(currentSlots).forEach((k) => {
          preservePhotos[k] = currentSlots[k].imageUrl || null;
          preserveStyles[k] = currentSlots[k].frameStyle;
        });

        const generated = generateCalendarSlots({
          year,
          month,
          startDay,
          rowCount: state.calendarConfig.rowCount,
          preservePhotos,
          preserveStyles,
        });

        const currentBorderColor = state.gridConfig.borderColor || '#ffffff';
        const currentBorderWidth = state.gridConfig.borderWidth || 1.5;
        const newSlotsMap: Record<string, SlotState> = {};
        generated.forEach((s) => {
          newSlotsMap[s.id] = {
            ...s,
            borderColor: currentBorderColor,
            borderWidth: currentBorderWidth,
          };
        });

        const monthName = MONTH_NAMES[month - 1] || 'month';

        // Update header text to match selected month if standard format
        const textLayers = { ...state.textLayers };
        if (textLayers.header) {
          textLayers.header = {
            ...textLayers.header,
            content: `${monthName} recap`,
          };
        }

        set({
          calendarConfig: {
            ...state.calendarConfig,
            year,
            month,
            monthName,
            startDay,
          },
          slots: newSlotsMap,
          textLayers,
        });
      },

      resetCurrentTemplate: () => {
        const currentId = get().activeTemplateId;
        get().setTemplate(currentId);
      },

      saveToStorage: async () => {
        try {
          const s = get();
          const snapshot = {
            activeTemplateId: s.activeTemplateId,
            background: s.background,
            gridConfig: s.gridConfig,
            calendarConfig: s.calendarConfig,
            slots: s.slots,
            textLayers: s.textLayers,
            aspectRatio: s.aspectRatio,
          };
          await idbSet(IDB_STATE_KEY, snapshot);
        } catch (e) {
          console.warn('Failed to save state to IndexedDB:', e);
        }
      },

      loadFromStorage: async () => {
        try {
          const snapshot = await idbGet<Partial<EditorState>>(IDB_STATE_KEY);
          if (snapshot && snapshot.slots && snapshot.textLayers) {
            const tmpl = getTemplateById(snapshot.activeTemplateId || DEFAULT_TEMPLATE_ID);

            const restoredTextLayers = { ...snapshot.textLayers };
            // If text layers are still on old default (Ralphi Sans / Arial Light), migrate to new default Arial
            Object.keys(restoredTextLayers).forEach((key) => {
              if (restoredTextLayers[key].fontFamily === 'Ralphi Sans' || restoredTextLayers[key].fontFamily === 'Arial Light') {
                restoredTextLayers[key] = {
                  ...restoredTextLayers[key],
                  fontFamily: 'Arial',
                  fontWeight: 400,
                };
              }
            });

            const restoredCalendarConfig = snapshot.calendarConfig
              ? {
                  ...snapshot.calendarConfig,
                  weekdayFontFamily:
                    snapshot.calendarConfig.weekdayFontFamily === 'Ralphi Sans' || snapshot.calendarConfig.weekdayFontFamily === 'Arial Light'
                      ? 'Arial'
                      : snapshot.calendarConfig.weekdayFontFamily || 'Arial',
                  weekdayFontWeight:
                    snapshot.calendarConfig.weekdayFontFamily === 'Ralphi Sans' || snapshot.calendarConfig.weekdayFontFamily === 'Arial Light'
                      ? 400
                      : snapshot.calendarConfig.weekdayFontWeight || 400,
                }
              : tmpl.calendarConfig!;

            set({
              activeTemplateId: snapshot.activeTemplateId || DEFAULT_TEMPLATE_ID,
              aspectRatio: snapshot.aspectRatio || '9:16',
              background: snapshot.background || tmpl.defaultBackground,
              gridConfig: snapshot.gridConfig || tmpl.gridConfig,
              calendarConfig: restoredCalendarConfig,
              slots: snapshot.slots,
              textLayers: restoredTextLayers,
            });
            // Reset undo/redo history to clean baseline
            setTimeout(() => {
              useEditorStore.temporal?.getState()?.clear();
            }, 0);
            return true;
          }
        } catch (e) {
          console.warn('Failed to load state from IndexedDB:', e);
        }
        return false;
      },
    }),
    {
      limit: 50,
      partialize: (state) => ({
        activeTemplateId: state.activeTemplateId,
        background: state.background,
        gridConfig: state.gridConfig,
        calendarConfig: state.calendarConfig,
        slots: state.slots,
        textLayers: state.textLayers,
        aspectRatio: state.aspectRatio,
      }),
      equality: (pastState, currentState) => {
        return (
          pastState.activeTemplateId === currentState.activeTemplateId &&
          pastState.aspectRatio === currentState.aspectRatio &&
          pastState.background === currentState.background &&
          pastState.gridConfig === currentState.gridConfig &&
          pastState.calendarConfig === currentState.calendarConfig &&
          pastState.slots === currentState.slots &&
          pastState.textLayers === currentState.textLayers
        );
      },
      handleSet: (handleSet) => {
        return (pastState, replace, currentState, deltaState) => {
          if (!firstPastState) {
            firstPastState = pastState;
          }
          lastDeltaState = deltaState;
          pendingHandleSetFn = handleSet;
          pendingCurrentStateObj = currentState;

          if (pendingDebounceTimer) clearTimeout(pendingDebounceTimer);
          pendingDebounceTimer = setTimeout(() => {
            flushPendingHistory();
          }, 240);
        };
      },
    }
  )
);
