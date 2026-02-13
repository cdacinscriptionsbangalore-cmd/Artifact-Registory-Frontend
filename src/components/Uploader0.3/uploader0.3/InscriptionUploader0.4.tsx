import React, { useRef, useState, useEffect } from "react";

import { useFileUpload } from "../hooks/useFileUpload";
import { useDescriptionSuggestion } from "../hooks/useDescriptionSuggestion";

import { Header } from "../components/Header";
// import { ErrorMessage } from "../components/ErrorMessage";
import { GPSStatus } from "../components/GPSStatus";
import { CameraView } from "../components/CameraView";
import { PhotoGrid } from "../components/PhotoGrid";
import { PhotoUploadArea } from "../components/PhotoUploadArea";
// import { StoneCheckStatus } from "../components/StoneCheckStatus";
import { UploadButton } from "../components/UploadButton";
import InscriptionForm from "../components/InscriptionForm";
import { useInscriptionUploader } from "../hooks/UseInscriptionUploader";
// import { checkStoneInscription } from "../Services/inscriptionService";
import { useCamera } from "../hooks/UseCamera";
// import { getEnvConfig } from "../config/env";
// declare module 'piexifjs';
import piexifjs from "piexifjs";
import { Alert, Slide, Snackbar, type SlideProps } from "@mui/material";
// import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import { detectAIClient } from "@/utils/http/clients/detectAIClient";

function SlideDownTransition(props: SlideProps) {
  // direction="down" makes it slide top -> down
  return <Slide {...props} direction="down" />;
}

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

  const checkStone = async (imageDataUrl: string): Promise<boolean> => {
    setIsCheckingStone(true);
    setStoneCheckResult(null);

    try {
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "inscription.jpg");

      // const response = await detectAIClient.post('predict/',formData);1

      // const { data } = response.data;
      interface DetectAIResponse {
        result: string;
        confidence: number;
        internal_label: string;
        filename: string;
        detail?: string;
      }

      const { data } = await detectAIClient.post<DetectAIResponse>(
        "predict/",
        formData
      );

      console.log(data.result);
      // console.log("AI Detection Response:", response);
      if (data?.detail?.toLowerCase().includes("suspicious content")) {
        setStoneCheckResult("Suspicious content detected");
        setError("Upload restricted: Suspicious content detected in file.");
        return false;
      }

      if (data?.result === "Stone Inscription") {
        setStoneCheckResult(data.result);
        return true;
      }

      setStoneCheckResult(data?.result || "Not a Stone Inscription");
      setError("Upload restricted: Not a Stone Inscription.");
      return false;
    } catch (err) {
      setError("Failed to check inscription type.");
      // console.log(formData);
      return false;
    } finally {
      setIsCheckingStone(false);
    }
  };

  // Handle photo capture with stone inscription check
  const handlePhotoCapture = async (photoDataUrl: string, locationData: any, hasGPS: boolean) => {
    const isStoneInscription = await checkStone(photoDataUrl);
    if (!isStoneInscription) {
      setError("Photo discarded: Not a stone inscription");
      return;
    }

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


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // fileUpload is the returned object from useFileUpload { handleFileUpload }
      const result = await fileUpload.handleFileUpload(files);
      if (!result) return;

      // only append when there are new photos
      if (result.newPhotos && result.newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...result.newPhotos]);
      }

      // if hook returned any error messages, combine them and set error state
      if (result.errorMessages && result.errorMessages.length > 0) {
        // join with bullet or newline for readability in Snackbar
        const combined = result.errorMessages.join(" • ");
        setError(combined);
      }
    } catch (err) {
      console.error("handleFileChange error:", err);
      setError("Unexpected error processing uploaded files.");
    } finally {
      // reset input value so same files can be re-selected if needed
      if (e.target) e.target.value = "";
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  useEffect(() => {
    // If there is an explicit error, show it immediately (highest priority)
    if (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error);
      setSnackbarOpen(true);
      return;
    }

    // If currently checking (no error), show checking info
    if (isCheckingStone) {
      setSnackbarSeverity("info");
      setSnackbarMessage("Checking inscription type...");
      setSnackbarOpen(true);
      return;
    }

    // If checking finished and there's a stone-check result, show it
    if (!isCheckingStone && stoneCheckResult) {
      const lower = stoneCheckResult.toLowerCase();
      if (lower.includes("suspicious") || lower.includes("not")) {
        setSnackbarSeverity("warning");
      } else {
        setSnackbarSeverity("success");
      }
      setSnackbarMessage(`Detection Result: ${stoneCheckResult}`);
      setSnackbarOpen(true);
      return;
    }

    // fallback: close snackbar when nothing important to show
    setSnackbarOpen(false);
  }, [isCheckingStone, stoneCheckResult, error]);

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div className="text-white p-4" >
      <div className="mx-auto ">
        <Header />
        <div className="space-x-6 sm:flex">

          <div style={{ width: "100%" }}>

            {/* {error && <ErrorMessage message={error} />} */}

            {hasGeoData !== null && <GPSStatus hasGeoData={hasGeoData} geoInfo={geoInfo} />}

            <div className="mb-6" >
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

            {/* <StoneCheckStatus isChecking={isCheckingStone} result={stoneCheckResult} /> */}
          </div>
          <div style={{ width: "100%" }}>
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
            {/* <div className="text-black" onClick={checkStone}>upload</div> */}
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={3500}
        TransitionComponent={SlideDownTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {/* <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert> */}
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage.split(" • ").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EnhancedInscriptionUploader;