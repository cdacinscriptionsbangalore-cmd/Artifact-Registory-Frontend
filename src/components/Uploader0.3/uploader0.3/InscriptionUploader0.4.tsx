import React, { useRef } from "react";

import { useFileUpload } from "../hooks/useFileUpload";
import { useDescriptionSuggestion } from "../hooks/useDescriptionSuggestion";

import { Header } from "../components/Header";
import { ErrorMessage } from "../components/ErrorMessage";
import { GPSStatus } from "../components/GPSStatus";
import { CameraView } from "../components/CameraView";
import { PhotoGrid } from "../components/PhotoGrid";
import { PhotoUploadArea } from "../components/PhotoUploadArea";
import { StoneCheckStatus } from "../components/StoneCheckStatus";
import { UploadButton } from "../components/UploadButton";
import InscriptionForm from "../components/InscriptionForm";
import { useInscriptionUploader } from "../hooks/UseInscriptionUploader";
import { checkStoneInscription } from "../Services/inscriptionService";
import { useCamera } from "../hooks/UseCamera";
// declare module 'piexifjs';
const piexifjs: any = require('piexifjs');

const EnhancedInscriptionUploader: React.FC = () => {
  const {
    photos, setPhotos,
    error, setError,
    hasGeoData, setHasGeoData,
    geoInfo, setGeoInfo,
    isUploading,
    isCheckingStone, setIsCheckingStone,
    stoneCheckResult, setStoneCheckResult,
    formData,
    handleInputChange,
    handleUpload,
    resetForm
  } = useInscriptionUploader();

  const handlePhotoCapture = (photoDataUrl: string, locationData: any, hasGPS: boolean) => {
    setPhotos(prev => [...prev, photoDataUrl]);
    if (hasGPS && locationData) {
      setGeoInfo({ ...locationData, hasGPS: true });
      setHasGeoData(true);
    } else {
      setHasGeoData(false);
      setError("Location access denied. Photo captured without GPS data.");
    }
  };

  const { isCapturing, videoRef, canvasRef, startCamera, stopCamera, capturePhoto } = useCamera(handlePhotoCapture);

  const checkStone = (imageDataUrl: string) => 
    checkStoneInscription(imageDataUrl, setIsCheckingStone, setStoneCheckResult, setError);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const result = await fileUpload.handleFileUpload(files);
    if (result) {
      setPhotos(prev => [...prev, ...result.newPhotos]);
      if (result.errorMessages.length > 0) {
        setError(result.errorMessages.join(" "));
      }
    }
  };

  // const handleFileUploadData = (newPhotos: string[], exifData: any, hasGPS: boolean) => {
  const handleFileUploadData = (exifData: any, hasGPS: boolean) => {
    if (hasGPS && exifData?.GPS) {
      const coordinates = {
        latitude: exifData.GPS[piexifjs.GPSIFD.GPSLatitude],
        longitude: exifData.GPS[piexifjs.GPSIFD.GPSLongitude],
        timestamp: exifData.GPS[piexifjs.GPSIFD.GPSTimeStamp],
      };
      
      setHasGeoData(true);
      setGeoInfo({ ...coordinates, hasGPS: true });
    } else {
      setHasGeoData(false);
      setGeoInfo(null);
      setError("No GPS data found in uploaded image");
    }
  };

  const fileUpload = useFileUpload(handleFileUploadData, checkStone);
  const { suggestion, setSuggestion, isFetching, fetchSuggestion } = useDescriptionSuggestion(geoInfo);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-md mx-auto">
        <Header />
        
        {error && <ErrorMessage message={error} />}
        
        {hasGeoData !== null && <GPSStatus hasGeoData={hasGeoData} geoInfo={geoInfo} />}

        <div className="mb-6">
          {isCapturing ? (
            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              onCapture={() => capturePhoto(checkStone)}
              onCancel={stopCamera}
            />
          ) : photos.length > 0 ? (
            <PhotoGrid photos={photos} onReset={resetForm} />
          ) : (
            <PhotoUploadArea
              onStartCamera={startCamera}
              onUploadClick={() => fileInputRef.current?.click()}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />
          )}
        </div>

        <StoneCheckStatus isChecking={isCheckingStone} result={stoneCheckResult} />

        <InscriptionForm
          formData={formData}
          onChange={handleInputChange}
          suggestion={suggestion}
          onSuggestionClose={() => setSuggestion(null)}
          isFetchingSuggestion={isFetching}
          onFetchSuggestion={fetchSuggestion}
          geoInfo={geoInfo}
        />

        <div className="mt-8 space-y-4">
          <UploadButton
            onClick={handleUpload}
            disabled={!photos.length || isUploading}
            isUploading={isUploading}
          />
          {/* <InfoFooter /> */}
        </div>
      </div>
    </div>
  );
};

export default EnhancedInscriptionUploader;