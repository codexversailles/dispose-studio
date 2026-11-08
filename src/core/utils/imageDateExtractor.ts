/**
 * Extracts date information from an uploaded photo file.
 * Prioritizes:
 * 1. EXIF DateTimeOriginal / DateTimeDigitized in JPEG
 * 2. Filename timestamp patterns (e.g. IMG_20261015, 2026-10-15, 20261015, etc.)
 * 3. File lastModified timestamp
 */

export interface PhotoDateInfo {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
  timeStr?: string; // "HH:MM:SS" if available
  source: 'exif' | 'filename' | 'lastModified';
}

/**
 * Fast pure JS EXIF parser for DateTimeOriginal (0x9003) & ModifyDate (0x0132)
 */
export function extractDateFromExif(buffer: ArrayBuffer): PhotoDateInfo | null {
  try {
    const view = new DataView(buffer);
    if (view.byteLength < 16) return null;
    if (view.getUint16(0) !== 0xffd8) return null; // Only JPEG supports APP1 Exif segment

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 4) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);

      if (marker === 0xe1) {
        // APP1 Marker
        const app1Length = view.getUint16(offset + 2);
        if (offset + 4 + 4 > length) return null;

        const exifHeader = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7)
        );
        if (exifHeader !== 'Exif') return null;

        const tiffOffset = offset + 10;
        if (tiffOffset + 8 > length) return null;

        const isLittle = view.getUint16(tiffOffset) === 0x4949; // 'II' = Intel Little Endian

        const getU16 = (o: number) => view.getUint16(tiffOffset + o, isLittle);
        const getU32 = (o: number) => view.getUint32(tiffOffset + o, isLittle);

        const firstIFDOffset = getU32(4);
        if (firstIFDOffset <= 0 || firstIFDOffset > app1Length) return null;

        let exifSubIFDOffset = 0;
        let dateStr: string | null = null;

        const parseIFD = (ifdOff: number): string | null => {
          if (ifdOff + 2 >= app1Length || tiffOffset + ifdOff + 2 > length) return null;
          const numEntries = getU16(ifdOff);
          let foundDate: string | null = null;

          for (let i = 0; i < numEntries; i++) {
            const entryOff = ifdOff + 2 + i * 12;
            if (tiffOffset + entryOff + 12 > length) break;
            const tag = getU16(entryOff);
            const count = getU32(entryOff + 4);
            const valueOffset = getU32(entryOff + 8);

            if (tag === 0x8769) {
              exifSubIFDOffset = valueOffset;
            } else if (tag === 0x9003 || tag === 0x9004 || tag === 0x0132) {
              // Date tags: DateTimeOriginal, DateTimeDigitized, ModifyDate
              if (count >= 19 && tiffOffset + valueOffset + 19 <= length) {
                let s = '';
                for (let c = 0; c < 19; c++) {
                  s += String.fromCharCode(view.getUint8(tiffOffset + valueOffset + c));
                }
                foundDate = s;
                if (tag === 0x9003) return foundDate; // Priority 1
              }
            }
          }
          return foundDate;
        };

        dateStr = parseIFD(firstIFDOffset);
        if (exifSubIFDOffset && !dateStr) {
          dateStr = parseIFD(exifSubIFDOffset);
        }

        if (dateStr) {
          // Format is typically "YYYY:MM:DD HH:MM:SS"
          const match = (dateStr as string).match(/^(\d{4}):(\d{2}):(\d{2})(?:\s+(\d{2}:\d{2}:\d{2}))?/);
          if (match) {
            return {
              year: parseInt(match[1], 10),
              month: parseInt(match[2], 10),
              day: parseInt(match[3], 10),
              timeStr: match[4] || undefined,
              source: 'exif',
            };
          }
        }
        return null;
      } else if ((marker >= 0xe0 && marker <= 0xef) || marker === 0xfe) {
        const segLen = view.getUint16(offset + 2);
        offset += 2 + segLen;
      } else {
        break;
      }
    }
  } catch (err) {
    console.debug('Exif parse error:', err);
  }
  return null;
}

/**
 * Extracts date from filename timestamp conventions
 * e.g. IMG_20261014_123456, 2026-10-14, 2026.10.14, PXL_20261014
 */
export function extractDateFromFilename(filename: string): PhotoDateInfo | null {
  // Pattern 1: YYYY-MM-DD or YYYYMMDD preceded by non-digit or string start
  const match1 = filename.match(
    /(?:^|[^0-9])(20\d\d)[-_.]?(0[1-9]|1[0-2])[-_.]?(0[1-9]|[12]\d|3[01])(?:[^0-9]|$)/
  );
  if (match1) {
    return {
      year: parseInt(match1[1], 10),
      month: parseInt(match1[2], 10),
      day: parseInt(match1[3], 10),
      source: 'filename',
    };
  }

  // Pattern 2: MM-DD-YYYY
  const match2 = filename.match(
    /(?:^|[^0-9])(0[1-9]|1[0-2])[-_.](0[1-9]|[12]\d|3[01])[-_.](20\d\d)(?:[^0-9]|$)/
  );
  if (match2) {
    return {
      year: parseInt(match2[3], 10),
      month: parseInt(match2[1], 10),
      day: parseInt(match2[2], 10),
      source: 'filename',
    };
  }

  return null;
}

/**
 * Extracts photo date using EXIF, filename patterns, or file lastModified
 */
export async function extractPhotoDate(file: File): Promise<PhotoDateInfo> {
  // 1. Check EXIF if JPEG
  if (file.type === 'image/jpeg' || file.name.match(/\.jpe?g$/i)) {
    try {
      // Read first 128KB which contains the EXIF APP1 block
      const slice = file.slice(0, 131072);
      const buffer = await slice.arrayBuffer();
      const exifResult = extractDateFromExif(buffer);
      if (exifResult) {
        return exifResult;
      }
    } catch (e) {
      // Fall through to filename
    }
  }

  // 2. Check filename pattern
  const fromFilename = extractDateFromFilename(file.name);
  if (fromFilename) {
    return fromFilename;
  }

  // 3. Fallback to file.lastModified
  if (file.lastModified) {
    const d = new Date(file.lastModified);
    if (!isNaN(d.getTime())) {
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        timeStr: `${hours}:${mins}:${secs}`,
        source: 'lastModified',
      };
    }
  }

  // Final fallback to today's date if nothing found
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    source: 'lastModified',
  };
}
