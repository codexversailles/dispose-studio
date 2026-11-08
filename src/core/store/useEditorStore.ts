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

  // Actions
  setIsMobileInspectorOpen: (open: boolean) => void;
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
        set((state) => ({
          gridConfig: { ...state.gridConfig, ...partial },
        }));
      },

      updateCalendarConfig: (partial) => {
        set((state) => ({
          calendarConfig: { ...state.calendarConfig, ...partial },
        }));
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
                hasBorder: imageUrl ? false : true,
                scale: 1.0,
                x: 0,
                y: 0,
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
                hasBorder: false,
                scale: 1.0,
                x: 0,
                y: 0,
              };
            }
          });

          return { slots: updatedSlots };
        });
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
          activeInspectorTab: slotId ? 'slot' : 'canvas',
          isMobileInspectorOpen: Boolean(slotId),
        });
      },

      selectText: (textId) => {
        set({
          selectedTextId: textId,
          selectedSlotId: null,
          activeInspectorTab: textId ? 'text' : 'canvas',
          isMobileInspectorOpen: Boolean(textId),
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

        const newSlotsMap: Record<string, SlotState> = {};
        generated.forEach((s) => {
          newSlotsMap[s.id] = s;
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
            // If text layers are still on old default (Ralphi Sans), migrate to new default Arial Light
            Object.keys(restoredTextLayers).forEach((key) => {
              if (restoredTextLayers[key].fontFamily === 'Ralphi Sans') {
                restoredTextLayers[key] = {
                  ...restoredTextLayers[key],
                  fontFamily: 'Arial Light',
                  fontWeight: 300,
                };
              }
            });

            const restoredCalendarConfig = snapshot.calendarConfig
              ? {
                  ...snapshot.calendarConfig,
                  weekdayFontFamily:
                    snapshot.calendarConfig.weekdayFontFamily === 'Ralphi Sans'
                      ? 'Arial Light'
                      : snapshot.calendarConfig.weekdayFontFamily || 'Arial Light',
                  weekdayFontWeight:
                    snapshot.calendarConfig.weekdayFontFamily === 'Ralphi Sans'
                      ? 300
                      : snapshot.calendarConfig.weekdayFontWeight || 300,
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
    }
  )
);
