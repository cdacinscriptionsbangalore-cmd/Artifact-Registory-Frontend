import extractEXIFData from "../utils/Camera/extractEXIFData";
import verifyGPSInImage from '../utils/GPS/verifyGPSInImage';

interface FileUploadResult {
  newPhotos: string[];
  errorMessages: string[];
}

export const useFileUpload = (
  onFileUploadData: (exifData: any, hasGPS: boolean) => void,
  onStoneCheck?: (imageDataUrl: string) => void
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

        // Verify GPS data in the image
        const gpsResult = verifyGPSInImage(imageDataUrl);
        
        // Pass GPS data to parent component
        onFileUploadData(gpsResult.allExif, gpsResult.hasGPS);

        if (!gpsResult.hasGPS) {
          errorMessages.push(`Warning: No GPS data found in image ${file.name}`);
        }

        newPhotos.push(imageDataUrl);

        // If stone check is enabled, perform it
        if (onStoneCheck) {
          onStoneCheck(imageDataUrl);
        }

      } catch (error) {
        console.error('Error processing file:', error);
        errorMessages.push(`Failed to process ${files[i].name}`);
      }
    }

    return { newPhotos, errorMessages };
  };

  return { handleFileUpload };
};