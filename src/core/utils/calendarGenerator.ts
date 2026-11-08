import { SlotState } from '../types/template';

export const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'oktober', 'november', 'december'
];

export const MONTH_NAMES_CAPITAL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS_SUN_START = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'];
export const WEEKDAYS_MON_START = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

export interface GenerateCalendarOptions {
  year: number;
  month: number; // 1-12
  startDay: 'sun' | 'mon';
  rowCount: 5 | 6;
  preservePhotos?: Record<string, string | null>;
  preserveStyles?: Record<string, 'photo' | 'empty-bordered' | 'hidden'>;
}

/**
 * Generates slots for a 7-column calendar grid based on month/year
 */
export function generateCalendarSlots(options: GenerateCalendarOptions): SlotState[] {
  const { year, month, startDay, rowCount, preservePhotos = {}, preserveStyles = {} } = options;
  const totalSlots = 7 * rowCount; // 35 or 42
  
  // Date of 1st day of the target month
  const firstDayDate = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Day of week for the 1st: 0=Sun, 1=Mon, ..., 6=Sat
  let firstDayIndex = firstDayDate.getDay();
  if (startDay === 'mon') {
    // Mon=0, Tue=1, ..., Sun=6
    firstDayIndex = (firstDayIndex + 6) % 7;
  }

  const slots: SlotState[] = [];

  for (let i = 0; i < totalSlots; i++) {
    const slotId = `slot-${i}`;
    const dayNumber = i - firstDayIndex + 1;
    const isWithinMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

    const existingPhoto = preservePhotos[slotId];
    const existingStyle = preserveStyles[slotId];

    let frameStyle: 'photo' | 'empty-bordered' | 'hidden' = 'empty-bordered';
    let hasBorder = true;

    if (existingStyle) {
      frameStyle = existingStyle;
      if (frameStyle === 'photo' && !existingPhoto) {
        frameStyle = 'empty-bordered';
      }
    } else if (existingPhoto) {
      frameStyle = 'photo';
      hasBorder = false;
    } else if (!isWithinMonth) {
      // Out of bounds slots: hidden or subtle empty bordered
      frameStyle = i < firstDayIndex ? 'hidden' : 'hidden';
      hasBorder = false;
    }

    slots.push({
      id: slotId,
      imageUrl: existingPhoto || null,
      scale: 1,
      x: 0,
      y: 0,
      frameStyle,
      hasBorder,
      borderWidth: 1.5,
      borderColor: '#ffffff',
      borderRadius: 0,
      label: isWithinMonth ? String(dayNumber) : undefined,
      aspectRatio: '1:1',
    });
  }

  return slots;
}
