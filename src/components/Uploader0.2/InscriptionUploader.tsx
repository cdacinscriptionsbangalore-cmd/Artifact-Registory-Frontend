import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Camera, MapPin, ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';

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
  id?: number;
  photo: string;
  description?: string;
  location?: string;
  useCurrentLocation?: boolean;
  inscriptionType?: string;
  geoInfo: GeoInfo | null;
  timestamp: string;
}

// Mock API service
const mockApiService = {
  uploadInscription: async (data: InscriptionData): Promise<{ success: boolean; id: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful response
    return {
      success: true,
      id: Math.floor(Math.random() * 10000)
    };
  }
};

// IndexedDB utilities
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("InscriptionDB", 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("inscriptions")) {
        db.createObjectStore("inscriptions", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToIndexedDB = async (data: InscriptionData): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction("inscriptions", "readwrite");
  const store = tx.objectStore("inscriptions");

  return new Promise((resolve, reject) => {
    const request = store.add(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save inscription"));
  });
};

// Camera utilities
const startCameraStream = async (): Promise<MediaStream> => {
  return navigator.mediaDevices.getUserMedia({
    video: { 
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  });
};

const getCurrentLocation = (): Promise<GeoInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
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

// EXIF extraction utility
const extractEXIFData = (file: File): Promise<GeoInfo | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
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
      } catch {
        resolve(null);
      }
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
    
    return { hasGPS: true }; // Simplified for demo
  } catch {
    return null;
  }
};

// Stone detection API
const detectStoneInscription = async (file: File): Promise<boolean> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://10.182.6.144:8000/predict', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    // Assuming API returns { is_stone: true/false }
    // console.log(result);
    return true;
  } catch {
    return false;
  }
};

// Main Component
const InscriptionUploader: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [inscriptionType, setInscriptionType] = useState('Stone');
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [capturedWithCamera, setCapturedWithCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const inscriptionTypes = [
    'Stone', 'Metal', 'Wood', 'Ceramic', 'Plaque', 
    'Monument', 'Gravestone', 'Building', 'Other'
  ];

  const handleStartCamera = async () => {
    try {
      setError(null);
      setIsCapturing(true);
      const mediaStream = await startCameraStream();
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    try {
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Convert dataURL to File for API
      const res = await fetch(photoDataUrl);
      const blob = await res.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

      // Stone detection
      const isStone = await detectStoneInscription(file);
      if (!isStone) {
        setError("Only stone inscriptions are allowed. Please capture a valid stone inscription.");
        stopCamera();
        return;
      }

      const locationData = await getCurrentLocation();

      setPhoto(photoDataUrl);
      setGeoInfo(locationData);
      setCapturedWithCamera(true);
      setUseCurrentLocation(true);
      stopCamera();
    } catch (err) {
      setError("Location access required for camera photos. Please enable location services.");
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setCapturedWithCamera(false);

    // Stone detection
    const isStone = await detectStoneInscription(file);
    if (!isStone) {
      setError("Only stone inscriptions are allowed. Please upload a valid stone inscription image.");
      setPhoto(null);
      return;
    }

    try {
      const exifData = await extractEXIFData(file);
      setGeoInfo(exifData);

      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to read image metadata.");
    }
  };

  const handleUpload = async () => {
    if (!photo) return;

    // Validate required fields
    if (capturedWithCamera && !geoInfo?.hasGPS) {
      setError("Camera photos require location data. Please enable location services.");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      const inscriptionData: InscriptionData = {
        photo,
        description: description.trim() || undefined,
        location: useCurrentLocation ? undefined : location.trim() || undefined,
        useCurrentLocation,
        inscriptionType,
        geoInfo,
        timestamp: new Date().toISOString()
      };

      // Save to API (mock)
      const result = await mockApiService.uploadInscription(inscriptionData);
      
      // Save to IndexedDB with the returned ID
      await saveToIndexedDB({ ...inscriptionData, id: result.id });
      
      setSuccess(`Inscription uploaded successfully! ID: ${result.id}`);
      
      // Reset form
      setTimeout(() => {
        resetForm();
      }, 2000);
      
    } catch (err) {
      setError("Failed to upload inscription. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setPhoto(null);
    setDescription('');
    setLocation('');
    setUseCurrentLocation(false);
    setInscriptionType('Stone');
    setGeoInfo(null);
    setError(null);
    setSuccess(null);
    setCapturedWithCamera(false);
  };

  return (
    <div className="min-h-screen bg-primary-background text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Add Inscription</h1>
        
        {/* Photo Upload Section */}
        <div className="mb-6">
          {isCapturing ? (
            <div className="space-y-4">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-xl border-2 border-dashed border-gray-600"
                autoPlay
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <button
                  onClick={handleCapturePhoto}
                  className="flex-1 bg-secondary-background hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition"
                >
                  Take Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-secondary-background hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition"
                >
                  Upload
                </button>
              </div>
            </div>
          ) : photo ? (
            <div className="space-y-4">
              <img
                src={photo}
                alt="Selected"
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleStartCamera}
                  className="flex-1 bg-secondary-background hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition"
                >
                  Take Photo
                </button>
                <label className="flex-1 bg-secondary-background hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition cursor-pointer text-center">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-400">
                <Camera className="w-12 h-12 mb-4 text-orange-500" />
                <p className="text-center">Tap to upload a photo of the inscription</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleStartCamera}
                  className="flex-1 bg-secondary-background hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition"
                >
                  Take Photo
                </button>
                <label className="flex-1 bg-secondary-background hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition cursor-pointer text-center">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the inscription, its condition, and any historical context..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location manually"
                disabled={useCurrentLocation}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                  useCurrentLocation 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-secondary-background text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MapPin className="w-4 h-4" />
                My Location
              </button>
            </div>
          </div>

          {/* Type of Inscription */}
          <div>
            <label className="block text-sm font-medium mb-2">Type of Inscription</label>
            <div className="relative">
              <select
                value={inscriptionType}
                onChange={(e) => setInscriptionType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {inscriptionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-600 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-600 rounded-xl text-green-200 text-sm">
            {success}
          </div>
        )}

        {/* Location Status for Camera Photos */}
        {capturedWithCamera && geoInfo && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-600 rounded-xl text-green-200 text-sm">
            ✅ Location data captured!
            {geoInfo.latitude && geoInfo.longitude && (
              <div className="text-xs mt-1">
                Coordinates: {geoInfo.latitude}, {geoInfo.longitude}
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!photo || isUploading}
          className="w-full mt-8 bg-orange-600 hover:bg-orange-500 disabled:bg-secondary-background disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition"
        >
          {isUploading ? 'Uploading...' : 'Upload Inscription'}
        </button>

        {/* View Existing */}
        <div className="text-center mt-6">
          <NavLink to="/feed" className="text-orange-400 hover:text-orange-300 transition text-sm">
            View existing inscriptions
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default InscriptionUploader;