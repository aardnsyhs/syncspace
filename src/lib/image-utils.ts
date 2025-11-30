/**
 * Compress and crop image to square (for avatars)
 * @param file - The image file to compress
 * @param size - Output size (default 400px square)
 * @param quality - JPEG quality 0-1 (default 0.8)
 * @returns Compressed square image as Blob
 */
export async function compressImage(
  file: File,
  size = 400,
  _maxHeight = 400, // kept for backward compatibility
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const { width, height } = img;

        // Calculate crop dimensions (center crop to square)
        const minDimension = Math.min(width, height);
        const cropX = (width - minDimension) / 2;
        const cropY = (height - minDimension) / 2;

        // Set canvas to target size
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw cropped and scaled image
        ctx.drawImage(
          img,
          cropX, // source x
          cropY, // source y
          minDimension, // source width
          minDimension, // source height
          0, // dest x
          0, // dest y
          size, // dest width
          size // dest height
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}

/**
 * Convert Blob to File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}
