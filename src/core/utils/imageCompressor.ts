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
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image to blob'));
            return;
          }

          const id = `${IDB_IMAGE_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          
          // Persist blob to IndexedDB
          try {
            await set(id, blob);
          } catch (err) {
            console.warn('Could not cache image in IndexedDB:', err);
          }

          const blobUrl = URL.createObjectURL(blob);
          resolve({
            id,
            blobUrl,
            width,
            height,
            sizeBytes: blob.size,
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
