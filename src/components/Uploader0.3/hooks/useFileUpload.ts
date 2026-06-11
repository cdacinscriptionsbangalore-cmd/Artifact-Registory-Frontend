import { extractCoordinates } from "../Services/ocrService";
import extractEXIFData from "../utils/Camera/extractEXIFData";
import verifyGPSInImage from '../utils/GPS/verifyGPSInImage';

interface FileUploadResult {
  newPhotos: string[];
  errorMessages: string[];
}

export const useFileUpload = (
  onFileUploadData: (exifData: any, hasGPS: boolean) => void,
  onStoneCheck?: (imageDataUrl: string) => Promise<boolean>
) => {
  const handleFileUpload = async (files: FileList | null): Promise<FileUploadResult | null> => {
    if (!files) return null;

    const newPhotos: string[] = [];
    const errorMessages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const reader = new FileReader();

        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });

        // First check if it's a stone inscription
        if (onStoneCheck) {
          const isStoneInscription = await onStoneCheck(imageDataUrl);
          if (!isStoneInscription) {
            errorMessages.push(`Uploaded file is not a stone inscription - discarded`);
            continue; // Skip this file and move to next
          }
        }

        // Only process GPS data if it's a valid stone inscription
        const gpsResult = verifyGPSInImage(imageDataUrl);

        if (gpsResult.hasGPS) {
          onFileUploadData(
            gpsResult.allExif,
            true
          );
        } else {

          try {
            const ocrResult =
              await extractCoordinates(file);

            if (
              ocrResult?.success &&
              ocrResult.latitude != null &&
              ocrResult.longitude != null
            ) {

              onFileUploadData(
                {
                  OCR: {
                    latitude: ocrResult.latitude,
                    longitude: ocrResult.longitude,
                  },
                },
                true
              );

            } else {

              onFileUploadData(
                gpsResult.allExif,
                false
              );

              errorMessages.push(
                "Warning: No GPS data found"
              );
            }

          } catch {

            onFileUploadData(
              gpsResult.allExif,
              false
            );

            errorMessages.push(
              "Warning: No GPS data found"
            );
          }
        }

        newPhotos.push(imageDataUrl);

      } catch (error) {
        console.error('Error processing file:', error);
        // errorMessages.push(`Failed to process ${files[i].name}`);
        errorMessages.push(`Failed to process one or more uploaded files`);
      }
    }

    return { newPhotos, errorMessages };
  };

  return { handleFileUpload };
};