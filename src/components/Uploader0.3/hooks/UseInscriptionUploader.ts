import { useState } from "react";
import type { GeoInfo, PostSchema } from "../types/types";
import { uploadInscription } from "../Services/uploadService";

const isFilled = (value?: string) => typeof value === "string" && value.trim().length >= 3;
const hasItems = (value?: string[]) =>
  Array.isArray(value) && value.some((item) => typeof item === "string" && item.trim().length > 0);

const getMissingRequiredFields = (formData: PostSchema) => {
  const missing: string[] = [];

  if (!isFilled(formData.description.title)) missing.push("Title");
  if (!isFilled(formData.description.subject)) missing.push("Subject");
  if (!isFilled(formData.topic)) missing.push("Topic");
  if (!formData.type?.trim()) missing.push("Type");
  if (!hasItems(formData.script)) missing.push("Script");
  if (!hasItems(formData.description.language)) missing.push("Language");
  if (!isFilled(formData.description.description)) missing.push("Description");
  if (typeof formData.description.postedAnonymously !== "boolean") missing.push("Post anonymously");

  return missing;
};

export const useInscriptionUploader = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGeoData, setHasGeoData] = useState<boolean | null>(null);
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingStone, setIsCheckingStone] = useState(false);
  const [stoneCheckResult, setStoneCheckResult] = useState<string | null>(null);

  const [formData, setFormData] = useState<PostSchema>({
    description: { postedAnonymously: false },
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
    } else if (field.startsWith("type")) {
      setFormData(prev => ({ ...prev, [field]: value.target.value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const missingFields = getMissingRequiredFields(formData);
  const isFormValid = missingFields.length === 0;

  const handleUpload = async () => {
    if (photos.length === 0) return;
    if (!isFormValid) {
      setError(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

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
    setFormData({ description: { postedAnonymously: false }, topic: "", script: [], type: "Stone" });
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
    isFormValid,
    handleInputChange,
    handleUpload,
    resetForm
  };
};
