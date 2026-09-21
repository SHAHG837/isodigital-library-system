/**
 * Utility to compress image data client-side using an offscreen canvas.
 * Prevents bloated base64 strings from exceeding Firestore document limits (1MB)
 * and browser localStorage quota (5MB).
 */
export async function compressImage(
  dataUrlOrFile: string | File,
  maxWidth: number = 500,
  maxHeight: number = 500,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // If it's an external URL (e.g. unsplash), keep as is
    if (typeof dataUrlOrFile === 'string' && !dataUrlOrFile.startsWith('data:image')) {
      resolve(dataUrlOrFile);
      return;
    }

    const processDataUrl = (src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG compression with high optical quality
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => {
        resolve(src);
      };
      img.src = src;
    };

    if (dataUrlOrFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          processDataUrl(reader.result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(dataUrlOrFile);
    } else {
      processDataUrl(dataUrlOrFile);
    }
  });
}
