import Tesseract from "tesseract.js";

export interface OcrCoordinatesResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  raw?: string;
}

/**
 * Crops the bottom portion of the image — GPS Map Camera watermarks always
 * appear at the bottom, so we only OCR that slice, which is much faster.
 */
const cropBottomOfImage = (file: File, cropFraction = 0.22): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const cropHeight = Math.floor(img.height * cropFraction);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = cropHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw only the bottom slice
      ctx.drawImage(
        img,
        0, img.height - cropHeight,  // source: bottom of image
        img.width, cropHeight,
        0, 0,                         // dest: top of canvas
        img.width, cropHeight
      );

      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("canvas.toBlob returned null"));
        },
        "image/png"   // lossless — better OCR accuracy on text
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for cropping"));
    };

    img.src = url;
  });
};

/**
 * Parses coordinates from OCR text.
 *
 * Handles the formats produced by "GPS Map Camera" and similar apps:
 *   "Lat 9.393758° Long 78.098491°"
 *   "Lat: 9.393758 Long: 78.098491"
 *   "9.393758°N 78.098491°E"
 */
const parseCoordinates = (
  text: string
): { latitude: number; longitude: number } | null => {
  // Pattern 1 — GPS Map Camera style: "Lat 9.393758° Long 78.098491°"
  const p1 = /[Ll]at[\s:°]*([+-]?\d+\.?\d*)[\s°].*?[Ll]ong?[\s:°]*([+-]?\d+\.?\d*)/s;
  const m1 = text.match(p1);
  if (m1) {
    const lat = parseFloat(m1[1]);
    const lon = parseFloat(m1[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // Pattern 2 — decimal with hemisphere letter: "9.393758°N 78.098491°E"
  const p2 = /([+-]?\d+\.\d+)\s*°?\s*([NS])[^\d+-]*([+-]?\d+\.\d+)\s*°?\s*([EW])/i;
  const m2 = text.match(p2);
  if (m2) {
    let lat = parseFloat(m2[1]);
    let lon = parseFloat(m2[3]);
    if (m2[2].toUpperCase() === "S") lat = -lat;
    if (m2[4].toUpperCase() === "W") lon = -lon;
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  return null;
};

/**
 * Runs fully client-side OCR on the image to extract GPS coordinates embedded
 * as a text watermark (e.g. by "GPS Map Camera").
 *
 * No backend call is made — everything runs in the browser via Tesseract.js.
 */
export const extractCoordinates = async (
  file: File
): Promise<OcrCoordinatesResult> => {
  try {
    const croppedBlob = await cropBottomOfImage(file, 0.22);

    const {
      data: { text },
    } = await Tesseract.recognize(croppedBlob, "eng", {
      logger: () => {}, // suppress noisy progress events
    });

    const coords = parseCoordinates(text);

    if (coords) {
      return {
        success: true,
        latitude: coords.latitude,
        longitude: coords.longitude,
        raw: text,
      };
    }

    return { success: false, raw: text };
  } catch (err) {
    console.error("[ocrService] Tesseract failed:", err);
    return { success: false };
  }
};