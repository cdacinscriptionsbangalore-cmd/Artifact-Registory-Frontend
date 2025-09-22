import React, { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { Camera, MapPin, Upload, X } from "lucide-react";
// import { getTokenFromCookie } from "@/utils/cookieUtils";
const backendDetectUrl = import.meta.env.VITE_BACKEND_AI_URL;
const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;

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
  
  // Form data
  const [formData, setFormData] = useState<PostSchema>({
    description: {},
    topic: "",
    script: [],
    type: "Stone"
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
        console.log(err);
        errorMessages.push(`Failed to read file ${idx + 1}.`);
      }
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    if (errorMessages.length > 0) {
      setError(errorMessages.join(" "));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("description.")) {
      const key = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        description: {
          ...prev.description,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // const getCurrentUserLocation = () => {
  //   getCurrentLocation()
  //     .then((location) => {
  //       if (location.latitude && location.longitude) {
  //         setFormData(prev => ({
  //           ...prev,
  //           manualLocation: `${location.latitude}, ${location.longitude}`
  //         }));
  //       }
  //     })
  //     .catch(() => {
  //       setError("Could not get current location. Please enter manually.");
  //     });
  // };

  const handleUpload = async () => {
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

      const response = await fetch(`${backendApiUrl}post/addPostWithFile`, {
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

  return (
    <div className="min-h-screen  text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">Add Inscription</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* GPS Status */}
        {hasGeoData !== null && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            hasGeoData 
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

        {/* Photo Section */}
        <div className="mb-6">
          {isCapturing ? (
            <div className="space-y-4">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg"
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
            <div className="space-y-4">
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
            <div className="space-y-4">
              <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                <Camera size={48} className="text-orange-500 mb-4" />
                <p className="text-gray-400 text-center text-sm">
                  Tap to upload a photo of the inscription
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startCamera}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Take Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Upload
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
        </div>

        {/* Show stone check result */}
        {isCheckingStone && (
          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-700 text-blue-300 rounded-lg text-sm">
            Checking inscription type...
          </div>
        )}
        {stoneCheckResult && (
          <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded-lg text-sm">
            {stoneCheckResult}
          </div>
        )}

        {/* Form Fields for backend schema */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.description.title || ""}
              onChange={e => handleInputChange("description.title", e.target.value)}
              placeholder="Stone Inscription Title"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={formData.description.subject || ""}
              onChange={e => handleInputChange("description.subject", e.target.value)}
              placeholder="Ancient History"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description.description || ""}
              onChange={e => handleInputChange("description.description", e.target.value)}
              placeholder="This inscription belongs to the 12th century temple walls."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Script Language (comma separated)</label>
            <input
              type="text"
              value={formData.description.scriptLanguage?.join(", ") || ""}
              onChange={e => handleInputChange("description.scriptLanguage", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              placeholder="Devanagari, Tamil"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language (comma separated)</label>
            <input
              type="text"
              value={formData.description.language?.join(", ") || ""}
              onChange={e => handleInputChange("description.language", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              placeholder="Sanskrit, Prakrit"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Topic</label>
            <input
              type="text"
              value={formData.topic || ""}
              onChange={e => handleInputChange("topic", e.target.value)}
              placeholder="Temple Inscriptions"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Script (comma separated)</label>
            <input
              type="text"
              value={formData.script?.join(", ") || ""}
              onChange={e => handleInputChange("script", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              placeholder="Grantha, Brahmi"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <input
              type="text"
              value={formData.type || ""}
              onChange={e => handleInputChange("type", e.target.value)}
              placeholder="Stone"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-8 space-y-4">
          <button
            onClick={handleUpload}
            disabled={!photos.length || isUploading}
            className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
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
  );
};

export default EnhancedInscriptionUploader;