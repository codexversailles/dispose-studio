import { CalendarConfig } from '../types/template';
import { compressImageFile } from './imageCompressor';
import { extractPhotoDate, PhotoDateInfo } from './imageDateExtractor';
import { MONTH_NAMES_CAPITAL } from './calendarGenerator';

export interface ProcessedPhotoItem {
  id: string;
  blobUrl: string;
  fileName: string;
  day: number;
  timeStr?: string;
  dateLabel: string;
}

export interface DateConflictDay {
  day: number;
  dateTitle: string; // e.g. "October 14, 2026"
  photos: ProcessedPhotoItem[];
  selectedPhotoId: string; // defaults to photos[0].id
}

export interface RejectedPhotoItem {
  fileName: string;
  detectedDateStr: string;
  reason: string;
}

export type BatchProcessResult =
  | {
      status: 'non_calendar';
      blobUrls: string[];
    }
  | {
      status: 'all_rejected';
      rejected: RejectedPhotoItem[];
      targetMonthName: string;
      targetYear: number;
    }
  | {
      status: 'has_conflicts';
      conflicts: DateConflictDay[];
      directMatches: Record<number, ProcessedPhotoItem>;
      rejected: RejectedPhotoItem[];
      targetMonthName: string;
      targetYear: number;
    }
  | {
      status: 'ready';
      placements: Record<number, string>; // day -> blobUrl
      rejected: RejectedPhotoItem[];
      targetMonthName: string;
      targetYear: number;
    };

/**
 * Processes batch uploaded photos with intelligent date recognition for calendar matching
 */
export async function processBatchPhotos(
  files: File[],
  calendarConfig?: CalendarConfig | null,
  onProgress?: (current: number, total: number) => void
): Promise<BatchProcessResult> {
  if (!files || files.length === 0) {
    return { status: 'non_calendar', blobUrls: [] };
  }

  // If calendar is not enabled, return standard flat list
  if (!calendarConfig || !calendarConfig.enabled) {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i], 3840, 0.92);
        urls.push(compressed.blobUrl);
      } catch (err) {
        console.error('Failed to compress file:', files[i].name, err);
      }
      onProgress?.(i + 1, files.length);
    }
    return { status: 'non_calendar', blobUrls: urls };
  }

  const targetYear = calendarConfig.year;
  const targetMonth = calendarConfig.month; // 1 - 12
  const targetMonthName =
    MONTH_NAMES_CAPITAL[targetMonth - 1] || `Month ${targetMonth}`;
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

  const matchedByDay = new Map<number, ProcessedPhotoItem[]>();
  const rejected: RejectedPhotoItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const [compressed, dateInfo] = await Promise.all([
        compressImageFile(file, 3840, 0.92),
        extractPhotoDate(file),
      ]);

      const isMatch =
        dateInfo.year === targetYear &&
        dateInfo.month === targetMonth &&
        dateInfo.day >= 1 &&
        dateInfo.day <= daysInMonth;

      const detectedMonthName =
        MONTH_NAMES_CAPITAL[dateInfo.month - 1] || `Month ${dateInfo.month}`;
      const detectedDateStr = `${detectedMonthName} ${dateInfo.day}, ${dateInfo.year}`;

      if (isMatch) {
        const item: ProcessedPhotoItem = {
          id: compressed.id,
          blobUrl: compressed.blobUrl,
          fileName: file.name,
          day: dateInfo.day,
          timeStr: dateInfo.timeStr,
          dateLabel: detectedDateStr,
        };

        const existing = matchedByDay.get(dateInfo.day) || [];
        existing.push(item);
        matchedByDay.set(dateInfo.day, existing);
      } else {
        rejected.push({
          fileName: file.name,
          detectedDateStr,
          reason: `Photo date (${detectedDateStr}) does not match the active calendar (${targetMonthName} ${targetYear}).`,
        });
      }
    } catch (err) {
      console.error('Failed to process file:', file.name, err);
      rejected.push({
        fileName: file.name,
        detectedDateStr: 'Unknown',
        reason: 'Failed to process or read photo metadata.',
      });
    }
    onProgress?.(i + 1, files.length);
  }

  // Case 1: All selected photos were rejected
  if (matchedByDay.size === 0) {
    return {
      status: 'all_rejected',
      rejected,
      targetMonthName,
      targetYear,
    };
  }

  // Separate direct matches (1 photo for that day) vs conflicts (> 1 photo for that day)
  const conflicts: DateConflictDay[] = [];
  const directMatches: Record<number, ProcessedPhotoItem> = {};
  const placements: Record<number, string> = {};

  matchedByDay.forEach((photos, day) => {
    if (photos.length > 1) {
      conflicts.push({
        day,
        dateTitle: `${targetMonthName} ${day}, ${targetYear}`,
        photos,
        selectedPhotoId: photos[0].id,
      });
    } else {
      directMatches[day] = photos[0];
      placements[day] = photos[0].blobUrl;
    }
  });

  // Sort conflicts by day ascending
  conflicts.sort((a, b) => a.day - b.day);

  if (conflicts.length > 0) {
    return {
      status: 'has_conflicts',
      conflicts,
      directMatches,
      rejected,
      targetMonthName,
      targetYear,
    };
  }

  return {
    status: 'ready',
    placements,
    rejected,
    targetMonthName,
    targetYear,
  };
}
