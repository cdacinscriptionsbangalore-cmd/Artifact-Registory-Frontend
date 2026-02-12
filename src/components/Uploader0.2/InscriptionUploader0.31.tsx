import React, { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { Camera, MapPin, Upload, X } from "lucide-react";
// import { getTokenFromCookie } from "@/utils/cookieUtils";
import styles from "./InscriptionUploader0.3.module.css";
import { Alert, Box, MenuItem, Select, Slide, Snackbar, TextField, Grid, type SnackbarOrigin } from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { getEnvConfig } from "../../config/env";

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

// Types
interface GeoInfo {
  hasGPS: boolean;
  latitude?: string;
  longitude?: string;
  accuracy?: number;
  latRef?: string;
  lonRef?: string;
}

interface InscriptionData {
  photo: string;
  geoInfo: GeoInfo | null;
  timestamp: string;
  description: string;
  manualLocation: string;
  inscriptionType: string;
  material: string;
  condition: string;
  historicalPeriod: string;
  language: string;
  dimensions: {
    height: string;
    width: string;
    depth: string;
  };
}

interface DescriptionSchema {
  title?: string;
  subject?: string;
  description?: string;
  scriptLanguage?: string[];
  language?: string[];
  geoLocation?: string; // Optional: added for geo info
}

interface PostSchema {
  description: DescriptionSchema;
  topic?: string;
  script?: string[];
  type?: string;
}

// const test_token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoidXNlciIsImV4cCI6MTc1Njk4ODY0MywidXNlciI6Im5heWFuY29kaW5nQGdtYWlsLmNvbSIsImlhdCI6MTc1NjkwMjI0M30.F207bcrhJ_CcaWDtfm3dp0SannIp2izKyRwIQ7p_rJc"

// Utility functions
const startCameraStream = async (): Promise<MediaStream> => {
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  });
};

const stopCameraStream = (stream: MediaStream): void => {
  stream.getTracks().forEach(track => track.stop());
};

const getCurrentLocation = (): Promise<GeoInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          hasGPS: true,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          accuracy
        });
      },
      () => reject(new Error("Location access denied"))
    );
  });
};

const extractEXIFData = (file: File): Promise<GeoInfo | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const dataView = new DataView(arrayBuffer);

      let offset = 2;
      const maxOffset = Math.min(65535, dataView.byteLength);

      while (offset < maxOffset) {
        const marker = dataView.getUint16(offset);
        if (marker === 0xFFE1) {
          const length = dataView.getUint16(offset + 2);
          const exifData = arrayBuffer.slice(offset + 4, offset + 4 + length - 2);
          resolve(parseEXIFForGPS(new DataView(exifData)));
          return;
        }
        offset += 2 + dataView.getUint16(offset + 2);
      }
      resolve(null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
};

const parseEXIFForGPS = (dataView: DataView): GeoInfo | null => {
  try {
    const exifHeader = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );

    if (exifHeader !== "Exif") return null;

    let offset = 6;
    const byteOrder = dataView.getUint16(offset);
    const isLittleEndian = byteOrder === 0x4949;

    const ifd0Offset = isLittleEndian
      ? dataView.getUint32(offset + 4, true)
      : dataView.getUint32(offset + 4, false);

    return findGPSIFD(dataView, offset + ifd0Offset, isLittleEndian);
  } catch (error) {
    return null;
  }
};

const findGPSIFD = (dataView: DataView, ifdOffset: number, isLittleEndian: boolean): GeoInfo | null => {
  try {
    const numEntries = isLittleEndian
      ? dataView.getUint16(ifdOffset, true)
      : dataView.getUint16(ifdOffset, false);

    let currentOffset = ifdOffset + 2;

    for (let i = 0; i < numEntries; i++) {
      const tag = isLittleEndian
        ? dataView.getUint16(currentOffset, true)
        : dataView.getUint16(currentOffset, false);

      if (tag === 0x8825) {
        const gpsOffset = isLittleEndian
          ? dataView.getUint32(currentOffset + 8, true)
          : dataView.getUint32(currentOffset + 8, false);

        return parseGPSData(dataView, ifdOffset - 4 + gpsOffset, isLittleEndian);
      }
      currentOffset += 12;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const parseGPSData = (dataView: DataView, gpsOffset: number, isLittleEndian: boolean): GeoInfo | null => {
  try {
    const gpsEntries = isLittleEndian
      ? dataView.getUint16(gpsOffset, true)
      : dataView.getUint16(gpsOffset, false);

    let latRef = null, lonRef = null;
    let currentOffset = gpsOffset + 2;

    for (let i = 0; i < gpsEntries; i++) {
      const tag = isLittleEndian
        ? dataView.getUint16(currentOffset, true)
        : dataView.getUint16(currentOffset, false);

      if (tag === 1) latRef = String.fromCharCode(dataView.getUint8(currentOffset + 8));
      if (tag === 3) lonRef = String.fromCharCode(dataView.getUint8(currentOffset + 8));

      currentOffset += 12;
    }

    if (latRef && lonRef) {
      return { hasGPS: true, latRef, lonRef };
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Main Component
const EnhancedInscriptionUploader: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGeoData, setHasGeoData] = useState<boolean | null>(null);
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCheckingStone, setIsCheckingStone] = useState(false);
  const [stoneCheckResult, setStoneCheckResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Form data
  const [formData, setFormData] = useState<PostSchema>({
    description: {},
    topic: "",
    script: [],
    type: ""
  });

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const inscriptionTypes = ["Stone", "Metal", "Wood", "Ceramic", "Papyrus", "Parchment", "Other"];
  // const conditions = ["Excellent", "Good", "Fair", "Poor", "Fragmentary"];
  // const historicalPeriods = ["Ancient", "Medieval", "Renaissance", "Modern", "Contemporary", "Unknown"];

  const startCamera = async (): Promise<void> => {
    try {
      setError(null);
      setIsCapturing(true);
      const mediaStream = await startCameraStream();
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      setIsCapturing(false);
      handleClick({ vertical: 'top', horizontal: 'center' })();
      setError("Failed to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopCamera = (): void => {
    if (stream) {
      stopCameraStream(stream);
      setStream(null);
    }
    setIsCapturing(false);
  };

  const checkStoneInscription = async (imageDataUrl: string): Promise<boolean> => {
    setIsCheckingStone(true);
    setStoneCheckResult(null);
    try {
      // Convert base64 to Blob
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "inscription.jpg");

      // return true;
      const { backendDetectUrl } = getEnvConfig();
      const response = await fetch(`${backendDetectUrl}predict/`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setStoneCheckResult(data.result);

      if (data.result === "Stone Inscription") {
        return true;
      } else {
        setError("Upload restricted: Not a Stone Inscription.");
        return false;
      }
    } catch (err) {
      setError("Failed to check inscription type.");
      return false;
    } finally {
      setIsCheckingStone(false);
    }
  };

  const capturePhoto = (): void => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const isStone = await checkStoneInscription(photoDataUrl);
      if (!isStone) {
        stopCamera();
        return;
      }
      try {
        const locationData = await getCurrentLocation();
        setPhotos(prev => [...prev, photoDataUrl]);
        setGeoInfo(locationData);
        setHasGeoData(true);
        stopCamera();
      } catch (error) {
        setError("Location access denied. Photo captured without GPS data.");
        setPhotos(prev => [...prev, photoDataUrl]);
        setHasGeoData(false);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    const newPhotos: string[] = [];
    let errorMessages: string[] = [];

    for (const [idx, file] of Array.from(files).entries()) {
      try {
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            const photoDataUrl = reader.result as string;
            const isStone = await checkStoneInscription(photoDataUrl);
            if (!isStone) {
              errorMessages.push(`File ${idx + 1} is not a stone inscription.`);
              return resolve();
            }
            newPhotos.push(photoDataUrl);
            const exifData = await extractEXIFData(file);
            if (exifData && exifData.hasGPS) {
              setHasGeoData(true);
              setGeoInfo(exifData);
            } else {
              setHasGeoData(false);
              setGeoInfo(null);
            }
            resolve();
          };
          reader.onerror = () => reject();
          reader.readAsDataURL(file);
        });
      } catch (err) {
        // console.log(err);
        errorMessages.push(`Failed to read file ${idx + 1}.`);
      }
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    if (errorMessages.length > 0) {
      setError(errorMessages.join(" "));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.startsWith("description.")) {
        const key = field.split(".")[1];
        return {
          ...prev,
          description: {
            ...prev.description,
            [key]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });

    setErrors(prevErrors => ({
      ...prevErrors,
      [field]: Array.isArray(value) ? value.length === 0 : value.trim() === ""
    }));
  };

  const handleUpload = async () => {
    const newErrors: Record<string, boolean> = {};

    if (!formData.description.title?.trim()) {
      newErrors["description.title"] = true;
    }
    if (!formData.description.subject?.trim()) {
      newErrors["description.subject"] = true;
    }
    if (!formData.topic?.trim()) {
      newErrors["topic"] = true;
    }
    if (!formData.script?.length) {
      newErrors["script"] = true;
    }
    if (!formData.description.scriptLanguage?.length) {
      newErrors["description.scriptLanguage"] = true;
    }
    if (!formData.description.language?.length) {
      newErrors["description.language"] = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError("Please fill in all required fields.");
      return;
    }

    if (photos.length === 0) return;
    setIsUploading(true);

    try {
      const form = new FormData();
      for (let i = 0; i < photos.length; i++) {
        const res = await fetch(photos[i]);
        const blob = await res.blob();
        form.append("files", blob, `inscription_${i + 1}.jpg`);
      }

      // Prepare post object
      const postData: PostSchema = {
        ...formData,
        description: {
          ...formData.description,
          geoLocation: geoInfo?.latitude && geoInfo?.longitude
            ? `${geoInfo.latitude}, ${geoInfo.longitude}`
            : undefined
        }
      };

      const token = getCookie("token");

      form.append("post", new Blob([JSON.stringify(postData)], { type: "application/json" }));

      const response = await fetch(`${backendApiUrl}/post/addPostWithFile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} - ${errorText}`);
      }

      alert("Inscription(s) uploaded successfully!");
      resetForm();
      // redirect to feed section
      window.location.href = "/feed";
    } catch (error) {
      if (error instanceof Error) {
        console.error("Backend error:", error.message);

        if (error.message.includes("409")) {
          setError("Upload failed: Conflicting image detected.");
        } else {
          setError("Upload failed: " + error.message);
        }
      } else {
        setError("An unknown error occurred during upload.");
      }
    } finally {
      setIsUploading(false);
    }
  };
  function SlideTransition(props: TransitionProps & { children: React.ReactElement }) {
    return <Slide {...props} direction="down">{props.children}</Slide>;
  }

  const resetForm = () => {
    setPhotos([]);
    setHasGeoData(null);
    setGeoInfo(null);
    setError(null);
    setFormData({
      description: {},
      topic: "",
      script: [],
      type: "Stone"
    });
  };

  const handleClick = (newState: SnackbarOrigin) => () => {
    setState({ ...newState, open: true });
  };

  const [state, setState] = useState({
    open: false,
    vertical: "top" as "top" | "bottom",
    horizontal: "center" as "center" | "right" | "left",
  });

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  const { vertical, horizontal, open } = state;

  return (
    <div className="min-h-screen text-white p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-dark px-5 mb-2">Add Inscription</h1>
        </div>

        {/* Error Message */}
        {error && (
          // <div className="mb-4 p-3 bg-red-900/40 border border-red-700 text-secondary-dark rounded-lg text-sm" style={{ display: "absolute", bottom: "0" }}>
          //   {error}
          // </div>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={open}
            onClose={handleClose}
            key={vertical + horizontal}
            autoHideDuration={3500}
            // style={{ top: "15rem", right: "4.5rem" }}
            TransitionComponent={SlideTransition}
          >
            <Alert onClose={handleClose} severity="error" sx={{ border: "1px solid red" }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {/* GPS Status */}
        {hasGeoData !== null && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${hasGeoData
            ? 'bg-green-900/50 border border-green-700 text-green-300'
            : 'bg-yellow-900/50 border border-yellow-700 text-yellow-300'
            }`}>
            {hasGeoData ? (
              <div>
                ✅ GPS data found!
                {geoInfo && geoInfo.latitude && geoInfo.longitude && (
                  <div className="mt-1 text-xs">
                    <p>Coordinates: {geoInfo.latitude}, {geoInfo.longitude}</p>
                    {geoInfo.accuracy && <p>Accuracy: ±{Math.round(geoInfo.accuracy)}m</p>}
                  </div>
                )}
              </div>
            ) : (
              "⚠️ No GPS data found in image"
            )}
          </div>
        )}

        <div className={styles["add-inscription-container"]}>        {/* Photo Section */}
          <div className={`mb-6 p-5 ${styles["add-inscription-container-div"]}`} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {isCapturing ? (
              <div className="space-y-4" style={{ flex: 1 }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Camera size={20} />
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : photos.length > 0 ? (
              <div className="space-y-4" style={{ flex: 1 }}>
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Captured inscription ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}

                </div>
                <button
                  onClick={resetForm}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
                >
                  Upload More Photos
                </button>
              </div>
            ) : (
              <div className="space-y-4" style={{ flex: 1 }}>
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg" style={{ minHeight: "22.7rem" }}>
                  <Camera size={48} className="text-orange-500 mb-4" />
                  <p className="text-gray-400 text-center text-sm">
                    Tap to upload a photo of the inscription
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={startCamera}
                    className="flex justify-center items-center gap-2 px-4 py-3 bg-primary transition-all transform hover:scale-105 shadow-lg cursor-pointer text-white rounded-lg font-medium transition"
                    style={{ width: "100%" }}
                  >
                    <Camera size={20} />
                    Take Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex justify-center items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition cursor-pointer"
                    style={{ width: "100%" }}
                  >
                    <Upload size={20} />
                    Upload Image
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
            {isCheckingStone && (
              <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                // open={open}
                onClose={handleClose}
                TransitionComponent={SlideTransition}

                // anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={isCheckingStone}
                // onClose={handleClose}
                key={vertical + horizontal}
                autoHideDuration={3500}
              // style={{ top: "15rem", right: "4.5rem" }}
              // TransitionComponent={(props) => <Slide {...props} direction="left" />} // Adjusted transition direction
              >
                <Alert onClose={handleClose} severity="info" sx={{ border: "1px solid #1976D2", top: "14rem" }}>
                  Checking inscription type...
                </Alert>
              </Snackbar>)}
            {/* {isCheckingStone && (
              <div className="mb-4 p-3 bg-blue-900/50 border border-blue-700 text-blue-300 rounded-lg text-white text-sm">

                Checking inscription type...
              </div>
            )} */}
            {stoneCheckResult && (

              <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded-lg text-sm">
                {stoneCheckResult}
              </div>
            )}

          </div>

          {/* Show stone check result */}

          {/* Form Fields for backend schema */}
          <div className={`space-y-6 p-5 ${styles["add-inscription-container-div"]}`}>
            <div>
              <TextField
                error={!!errors["description.title"]}
                helperText={errors["description.title"] ? "Title cannot be left blank." : ""}
                id="outlined-error-helper-text"
                label="Title"
                defaultValue=""
                value={formData.description.title || ""}
                onChange={e => handleInputChange("description.title", e.target.value)}
                placeholder="Title of the inscription"
                size="small"
                fullWidth
              />
            </div>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} style={{ flex: 1 }}>
                  <TextField
                    error={!!errors["description.subject"]}
                    helperText={errors["description.subject"] ? "Subject cannot be left blank." : ""}
                    id="outlined-error-helper-text"
                    label="Subject"
                    defaultValue=""
                    value={formData.description.subject || ""}
                    onChange={e => handleInputChange("description.subject", e.target.value)}
                    placeholder="Ancient History"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} style={{ flex: 1 }}>
                  <TextField
                    error={!!errors["topic"]}
                    helperText={errors["topic"] ? "Topic cannot be left blank." : ""}
                    id="outlined-error-helper-text"
                    label="Topic"
                    defaultValue=""
                    value={formData.topic || ""}
                    onChange={e => handleInputChange("topic", e.target.value)}
                    placeholder="Temple Inscriptions"
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} style={{ flex: 1 }}>
                  <TextField
                    error={!!errors["script"]}
                    helperText={errors["script"] ? "Script cannot be left blank." : ""}
                    id="outlined-error-helper-text"
                    label="Script (comma separated)"
                    defaultValue="Devanagari, Tamil"
                    value={formData.script?.join(", ") || ""}
                    onChange={e => handleInputChange("script", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="Grantha, Brahmi"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} style={{ flex: 1 }}>
                  <TextField
                    error={!!errors["description.scriptLanguage"]}
                    helperText={errors["description.scriptLanguage"] ? "Script language cannot be left blank." : ""}
                    id="outlined-error-helper-text"
                    label="Script Language (comma separated)"
                    defaultValue="Devanagari, Tamil"
                    value={formData.description.scriptLanguage?.join(", ") || ""}
                    onChange={e => handleInputChange("description.scriptLanguage", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="Devanagari, Tamil"
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2} sx={{ display: "flex", alignItems: "stretch" }}>
                <Grid item xs={6} sx={{ flex: 1 }}
                >
                  <TextField
                    error={!!errors["description.language"]}
                    helperText={errors["description.language"] ? "Language cannot be left blank." : ""}
                    id="outlined-error-helper-text"
                    label="Language (comma separated)"
                    defaultValue="Sanskrit, Prakrit"
                    value={formData.description.language?.join(", ") || ""}
                    onChange={e => handleInputChange("description.language", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="Sanskrit, Prakrit"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} style={{ flex: 1 }}>
                  <TextField
                    select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={formData.type || ""}
                    label="Manuscript Material"
                    // defaultValue="Choose manuscript material"
                    onChange={e => handleInputChange("type", e.target.value)}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value={"Stone"}>Stone</MenuItem>
                    <MenuItem value={"Metal"}>Metal</MenuItem>
                    {/* <MenuItem value={"Leaf"}>Leaf</MenuItem>
                    <MenuItem value={"Bark"}>Bark</MenuItem> */}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <div className="space-y-4">
            </div>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                id="outlined-description-error-helper-text"
                label="Description"
                placeholder="This inscription belongs to the 12th century temple walls."
                size="small"

                value={formData.description.description || ""}
                onChange={e => handleInputChange("description.description", e.target.value)}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
            {/* Upload Button */}
            <div className="mt-1 space-y-4">
              <button
                onClick={handleUpload}
                disabled={!photos.length || isUploading}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Inscription
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div >
  );
};

export default EnhancedInscriptionUploader;