import { TemplateSchema } from '../core/types/template';
import { WEEKDAYS_SUN_START } from '../core/utils/calendarGenerator';

export const calendarRecapTemplate: TemplateSchema = {
  id: 'calendar-recap',
  name: 'Monthly Calendar Recap',
  description: 'The viral 7x5 monthly photo dump with full-bleed background & crisp framed days.',
  category: 'calendar',
  aspectRatio: '9:16',
  canvasWidth: 360,
  canvasHeight: 640,
  defaultBackground: {
    imageUrl: '', // No image on background by default
    scale: 1.0,
    position: { x: 0, y: 0 },
    dimOpacity: 0,
    grainOpacity: 0.04,
    blur: 0,
    fallbackColor: '#13161e',
  },
  gridConfig: {
    columns: 7,
    rows: 5,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    borderRadius: 0,
    x: 0,
    y: 0,
    padding: {
      top: 155,
      bottom: 120,
      left: 28,
      right: 28,
    },
  },
  calendarConfig: {
    enabled: true,
    year: 2026,
    month: 10,
    monthName: 'oktober',
    startDay: 'sun',
    rowCount: 5,
    showWeekdayHeader: true,
    showDateNumbers: false, // User can toggle this ON/OFF
    weekdays: WEEKDAYS_SUN_START,
    weekdayFontFamily: 'Arial',
    weekdayFontWeight: 400,
    weekdayFontSize: 9.5,
    weekdayColor: '#ffffff',
    weekdayLetterSpacing: 0.3,
    weekdayTransform: 'capitalize',
    weekdayItalic: false,
  },
  textLayers: {
    header: {
      id: 'header',
      content: 'oktober recap',
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 400,
      color: '#ffffff',
      align: 'center',
      letterSpacing: 0.4,
      textTransform: 'lowercase',
      shadow: {
        enabled: true,
        blur: 4,
        color: 'rgba(0,0,0,0.6)',
        offsetX: 0,
        offsetY: 1,
      },
      position: {
        x: 180,
        y: 115,
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
      },
    },
    footer: {
      id: 'footer',
      content: "Even though I have a lot of college assignments to do\nthis month, it's still fun.",
      fontFamily: 'Arial',
      fontSize: 9.5,
      fontWeight: 400,
      color: 'rgba(255, 255, 255, 0.92)',
      align: 'center',
      letterSpacing: 0.2,
      lineHeight: 1.45,
      textTransform: 'none',
      shadow: {
        enabled: true,
        blur: 4,
        color: 'rgba(0,0,0,0.65)',
        offsetX: 0,
        offsetY: 1,
      },
      position: {
        x: 180,
        y: 575,
        bottom: '8%',
        left: '50%',
        transform: 'translateX(-50%)',
      },
      maxWidth: '82%',
    },
  },
  defaultSlots: Array.from({ length: 35 }, (_, i) => {
    // Oct 2026 starts on Thursday (index 4 for Sunday start):
    const dayNumber = i - 3;
    const isDay = dayNumber >= 1 && dayNumber <= 31;

    return {
      id: `slot-${i}`,
      imageUrl: null, // Keep all frames empty by default
      scale: 1.0,
      x: 0,
      y: 0,
      frameStyle: 'empty-bordered', // Crisp empty bordered frame
      hasBorder: true,
      borderWidth: 1.5,
      borderColor: '#ffffff',
      borderRadius: 0,
      label: isDay ? String(dayNumber) : undefined,
      aspectRatio: '1:1',
    };
  }),
};
