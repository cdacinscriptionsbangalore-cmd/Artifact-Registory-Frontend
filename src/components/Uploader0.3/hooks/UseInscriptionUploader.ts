import { useState } from "react";
import type { GeoInfo, PostSchema } from "../types/types";
import { uploadInscription } from "../Services/uploadService";

export const useInscriptionUploader = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGeoData, setHasGeoData] = useState<boolean | null>(null);
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingStone, setIsCheckingStone] = useState(false);
  const [stoneCheckResult, setStoneCheckResult] = useState<string | null>(null);

  const [formData, setFormData] = useState<PostSchema>({
    description: {},
    topic: "",
    script: [],
    type: "Stone"
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("description.")) {
      const key = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        description: { ...prev.description, [key]: value }
      }));
    } if (field.startsWith("type")) {
      setFormData(prev => ({ ...prev, [field]: value.target.value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleUpload = async () => {
    if (photos.length === 0) return;
    setIsUploading(true);

    try {
      await uploadInscription(photos, formData, geoInfo);
      alert("Inscription(s) with embedded GPS data uploaded successfully!");
      resetForm();
      window.location.href = "/feed";
    } catch (error: any) {
      setError(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
    // console.log(formData)
  };

  const resetForm = () => {
    setPhotos([]);
    setHasGeoData(null);
    setGeoInfo(null);
    setError(null);
    setStoneCheckResult(null);
    setFormData({ description: {}, topic: "", script: [], type: "Stone" });
  };

  return {
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
  };
};
