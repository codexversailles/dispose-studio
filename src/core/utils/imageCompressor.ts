import { get, set, del, keys } from 'idb-keyval';

export interface CompressedImageResult {
  id: string;
  blobUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

const IDB_IMAGE_PREFIX = 'dumpstudio_img_';

/**
 * Resizes and compresses an uploaded image file client-side using offscreen canvas.
 * Supports up to 4K UHD (3840px) resolution to preserve maximum clarity.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 3840,
  quality = 0.92
): Promise<CompressedImageResult> {
  const id = `${IDB_IMAGE_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Modern browsers: use createImageBitmap to strictly honor EXIF orientation and prevent cropping
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const origWidth = bitmap.width;
      const origHeight = bitmap.height;

      // If already within 4K bounds, preserve original file blob directly without re-compression or cropping
      if (origWidth <= maxDimension && origHeight <= maxDimension) {
        bitmap.close();
        try {
          await set(id, file);
        } catch (err) {
          console.warn('Could not cache image in IndexedDB:', err);
        }
        const blobUrl = URL.createObjectURL(file);
        return {
          id,
          blobUrl,
          width: origWidth,
          height: origHeight,
          sizeBytes: file.size,
        };
      }

      // Proportional downscale to maxDimension
      const scale = Math.min(maxDimension / origWidth, maxDimension / origHeight);
      const targetWidth = Math.max(1, Math.round(origWidth * scale));
      const targetHeight = Math.max(1, Math.round(origHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        bitmap.close();

        return new Promise((resolve) => {
          canvas.toBlob(
            async (blob) => {
              const finalBlob = blob || file;
              try {
                await set(id, finalBlob);
              } catch (err) {
                console.warn('Could not cache image in IndexedDB:', err);
              }
              const blobUrl = URL.createObjectURL(finalBlob);
              resolve({
                id,
                blobUrl,
                width: targetWidth,
                height: targetHeight,
                sizeBytes: finalBlob.size,
              });
            },
            'image/webp',
            quality
          );
        });
      }
      bitmap.close();
    } catch {
      // Fallback to Image element below if createImageBitmap fails
    }
  }

  // Fallback using HTMLImageElement
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      const origWidth = img.naturalWidth || img.width || 1;
      const origHeight = img.naturalHeight || img.height || 1;

      if (origWidth <= maxDimension && origHeight <= maxDimension) {
        try {
          await set(id, file);
        } catch (err) {
          console.warn('Could not cache image in IndexedDB:', err);
        }
        const blobUrl = URL.createObjectURL(file);
        resolve({
          id,
          blobUrl,
          width: origWidth,
          height: origHeight,
          sizeBytes: file.size,
        });
        return;
      }

      const scale = Math.min(maxDimension / origWidth, maxDimension / origHeight);
      const targetWidth = Math.max(1, Math.round(origWidth * scale));
      const targetHeight = Math.max(1, Math.round(origHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        try {
          await set(id, file);
        } catch {
          // ignore
        }
        resolve({
          id,
          blobUrl: URL.createObjectURL(file),
          width: origWidth,
          height: origHeight,
          sizeBytes: file.size,
        });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        async (blob) => {
          const finalBlob = blob || file;
          try {
            await set(id, finalBlob);
          } catch (err) {
            console.warn('Could not cache image in IndexedDB:', err);
          }

          const blobUrl = URL.createObjectURL(finalBlob);
          resolve({
            id,
            blobUrl,
            width: targetWidth,
            height: targetHeight,
            sizeBytes: finalBlob.size,
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image file: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses multiple files in parallel with controlled concurrency (up to 4K resolution)
 */
export async function compressMultipleImages(
  files: File[],
  maxDimensionOrProgress?: number | ((completed: number, total: number) => void),
  onProgress?: (completed: number, total: number) => void
): Promise<CompressedImageResult[]> {
  const maxDimension =
    typeof maxDimensionOrProgress === 'number' ? maxDimensionOrProgress : 3840;
  const progressCallback =
    typeof maxDimensionOrProgress === 'function' ? maxDimensionOrProgress : onProgress;

  const results: CompressedImageResult[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const res = await compressImageFile(file, maxDimension);
      results.push(res);
    } catch (err) {
      console.error(`Skipping file ${file.name}:`, err);
    }
    completed++;
    progressCallback?.(completed, files.length);
  }

  return results;
}

/**
 * Restore cached blob from IndexedDB by image ID
 */
export async function getCachedBlobUrl(id: string): Promise<string | null> {
  try {
    const blob = await get<Blob>(id);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn('Failed to retrieve blob from IndexedDB:', err);
  }
  return null;
}

/**
 * Clears old cached images from IndexedDB
 */
export async function clearCachedImages(): Promise<void> {
  try {
    const allKeys = await keys();
    for (const key of allKeys) {
      if (typeof key === 'string' && key.startsWith(IDB_IMAGE_PREFIX)) {
        await del(key);
      }
    }
  } catch (err) {
    console.error('Error clearing image cache:', err);
  }
}
