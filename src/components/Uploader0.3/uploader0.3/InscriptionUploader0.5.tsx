import React, { useEffect, useRef, useState } from "react";
import piexifjs from "piexifjs";
import {
  Alert,
  CircularProgress,
  MenuItem,
  Slide,
  Snackbar,
  TextField,
  Tooltip,
  type SlideProps,
} from "@mui/material";
import { ArrowRight, RefreshCcw, RotateCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import { detectAIClient } from "@/utils/http/clients/detectAIClient";

import { Header } from "../components/Header";
import { PhotoUploadArea } from "../components/PhotoUploadArea";
import { CameraView } from "../components/CameraView";
import { GPSStatus } from "../components/GPSStatus";
import { useCamera } from "../hooks/UseCamera";
import type { GeoInfo } from "../types/types";
import verifyGPSInImage from "../utils/GPS/verifyGPSInImage";

const isOnline = true; // true => validate with AI, false => skip AI validation only
const MAX_IMAGES = 20;

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

interface GroupFormData {
  title: string;
  description: string;
  type: string;
  topic: string;
}

interface ImageGroup {
  id: string;
  name: string;
  images: ImageItem[];
  formData: GroupFormData;
  status: "idle" | "submitting" | "submitted" | "error";
}

const DEFAULT_GROUP_FORM_DATA: GroupFormData = {
  title: "",
  description: "",
  type: "Stone",
  topic: "",
};

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataUrlToFile = async (dataUrl: string, fileName: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, {
    type: blob.type || "image/jpeg",
  });
};

const rotateImageDataUrl = (dataUrl: string, degrees = 90): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const normalized = ((degrees % 360) + 360) % 360;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Failed to prepare image canvas."));
        return;
      }

      if (normalized === 90 || normalized === 270) {
        canvas.width = image.height;
        canvas.height = image.width;
      } else {
        canvas.width = image.width;
        canvas.height = image.height;
      }

      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((normalized * Math.PI) / 180);
      context.drawImage(image, -image.width / 2, -image.height / 2);

      const mimeType = dataUrl.match(/^data:(.*?);base64,/)?.[1] || "image/jpeg";
      resolve(canvas.toDataURL(mimeType));
    };

    image.onerror = () => reject(new Error("Failed to load image for rotation."));
    image.src = dataUrl;
  });

const createImageId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createGroupId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const unwrapApiData = (payload: unknown): any => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
};

const resolveApiSuccess = (body: any, payload: any, status: number): boolean => {
  if (typeof body?.ok === "boolean") return body.ok;
  if (typeof payload?.ok === "boolean") return payload.ok;
  if (body?.data === false || payload === false || payload?.data === false) return false;
  return status >= 200 && status < 300;
};

const resolveApiMessage = (body: any, payload: any, fallback: string): string => {
  if (typeof body?.message === "string" && body.message.trim()) return body.message;
  if (typeof payload?.message === "string" && payload.message.trim()) return payload.message;
  if (typeof body?.error_message === "string" && body.error_message.trim()) {
    return body.error_message;
  }
  if (typeof payload?.error_message === "string" && payload.error_message.trim()) {
    return payload.error_message;
  }
  return fallback;
};

const EnhancedInscriptionUploaderV5: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<"upload" | "grouping">("upload");
  const [ungroupedImages, setUngroupedImages] = useState<ImageItem[]>([]);
  const [groups, setGroups] = useState<ImageGroup[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [hasGeoData, setHasGeoData] = useState<boolean | null>(null);
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [isCheckingStone, setIsCheckingStone] = useState(false);
  const [stoneCheckResult, setStoneCheckResult] = useState<string | null>(null);
  const [nextGroupNumber, setNextGroupNumber] = useState(1);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarKey, setSnackbarKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadLockRef = useRef(false);
  const hasRedirectedToFeedRef = useRef(false);
  const navigate = useNavigate();

  const totalImages =
    ungroupedImages.length +
    groups.reduce((accumulator, group) => accumulator + group.images.length, 0);
  const isAnyGroupSubmitting = groups.some((group) => group.status === "submitting");

  const showSnackbar = (
    severity: "info" | "success" | "warning" | "error",
    message: string
  ) => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setSnackbarKey((previous) => previous + 1);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    if (error) {
      showSnackbar("error", error);
      return;
    }

    if (isCheckingStone) {
      showSnackbar("info", "Checking inscription type...");
      return;
    }

    if (!isCheckingStone && stoneCheckResult) {
      const lower = stoneCheckResult.toLowerCase();
      if (lower.includes("suspicious") || lower.includes("not")) {
        showSnackbar("warning", `Detection Result: ${stoneCheckResult}`);
      } else {
        showSnackbar("success", `Detection Result: ${stoneCheckResult}`);
      }
    }
  }, [error, isCheckingStone, stoneCheckResult]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (ungroupedImages.length > 0 || groups.length > 0) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [ungroupedImages.length, groups.length]);

  useEffect(() => {
    const groupsWithImages = groups.filter((group) => group.images.length > 0);
    const shouldRedirect =
      ungroupedImages.length === 0 &&
      groupsWithImages.length > 0 &&
      groupsWithImages.every((group) => group.status === "submitted");

    if (!shouldRedirect || hasRedirectedToFeedRef.current) {
      return;
    }

    hasRedirectedToFeedRef.current = true;
    navigate("/feed", { replace: true });
  }, [groups, navigate, ungroupedImages.length]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
    setError(null);
    setStoneCheckResult(null);
  };

  const updateGeoInfo = (exifData: any, hasGPS: boolean) => {
    if (hasGPS && exifData?.GPS) {
      const coordinates = {
        latitude: exifData.GPS[piexifjs.GPSIFD.GPSLatitude],
        longitude: exifData.GPS[piexifjs.GPSIFD.GPSLongitude],
        timestamp: exifData.GPS[piexifjs.GPSIFD.GPSTimeStamp],
      };

      setHasGeoData(true);
      setGeoInfo({ ...coordinates, hasGPS: true });
      return;
    }

    setHasGeoData(false);
    setGeoInfo(null);
  };

  const checkStone = async (imageDataUrl: string): Promise<boolean> => {
    if (!isOnline) {
      setStoneCheckResult("Offline mode: AI validation bypassed");
      return true;
    }

    setIsCheckingStone(true);
    setStoneCheckResult(null);

    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("file", blob, "inscription.jpg");

      interface DetectAIResponse {
        result: string;
        confidence: number;
        internal_label: string;
        filename: string;
        detail?: string;
      }

      const { data } = await detectAIClient.post<DetectAIResponse>("predict/", formData);

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
    } catch {
      setError("Failed to check inscription type.");
      return false;
    } finally {
      setIsCheckingStone(false);
    }
  };

  const addImagesToUngrouped = (images: ImageItem[]) => {
    if (!images.length) return;

    const remaining = MAX_IMAGES - totalImages;
    if (remaining <= 0) {
      showSnackbar("warning", "Maximum 20 images allowed");
      return;
    }

    if (images.length > remaining) {
      showSnackbar("warning", "Maximum 20 images allowed");
    }

    const accepted = images.slice(0, remaining);
    setUngroupedImages((previous) => [...previous, ...accepted]);
  };

  const handlePhotoCapture = async (
    photoDataUrl: string,
    locationData: any,
    hasGPS: boolean
  ) => {
    if (totalImages >= MAX_IMAGES) {
      showSnackbar("warning", "Maximum 20 images allowed");
      return;
    }

    try {
      const file = await dataUrlToFile(photoDataUrl, `camera-${Date.now()}.jpg`);
      const image: ImageItem = {
        id: createImageId(),
        file,
        preview: photoDataUrl,
      };
      addImagesToUngrouped([image]);
    } catch {
      setError("Failed to process captured image.");
      return;
    }

    if (hasGPS && locationData) {
      setGeoInfo({ ...locationData, hasGPS: true });
      setHasGeoData(true);
    } else {
      setHasGeoData(false);
      setError("Location access denied. Photo captured without GPS data.");
    }
  };

  const { isCapturing, videoRef, canvasRef, startCamera, stopCamera, capturePhoto } =
    useCamera(handlePhotoCapture);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const pendingImages: ImageItem[] = [];
    const messages: string[] = [];

    for (const file of Array.from(files)) {
      if (totalImages + pendingImages.length >= MAX_IMAGES) {
        messages.push("Maximum 20 images allowed");
        break;
      }

      try {
        const preview = await readFileAsDataUrl(file);
        const isStone = await checkStone(preview);
        if (!isStone) {
          messages.push(`${file.name}: not a stone inscription`);
          continue;
        }

        const gpsResult = verifyGPSInImage(preview);
        updateGeoInfo(gpsResult.allExif, gpsResult.hasGPS);

        if (!gpsResult.hasGPS) {
          messages.push(`${file.name}: no GPS data found`);
        }

        pendingImages.push({
          id: createImageId(),
          file,
          preview,
        });
      } catch {
        messages.push(`${file.name}: failed to process`);
      }
    }

    if (pendingImages.length > 0) {
      addImagesToUngrouped(pendingImages);
    }

    if (messages.length > 0) {
      setError(messages.join(" | "));
    }

    event.target.value = "";
  };

  const handleRemoveUngroupedPhoto = (index: number) => {
    setUngroupedImages((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const handleRotateUngroupedPhoto = async (index: number) => {
    const targetImage = ungroupedImages[index];
    if (!targetImage) return;

    try {
      const rotatedPreview = await rotateImageDataUrl(targetImage.preview, 90);
      const rotatedFile = await dataUrlToFile(rotatedPreview, targetImage.file.name);

      setUngroupedImages((previous) =>
        previous.map((image, currentIndex) =>
          currentIndex === index
            ? {
                ...image,
                preview: rotatedPreview,
                file: rotatedFile,
              }
            : image
        )
      );
    } catch {
      setError("Failed to rotate selected image.");
    }
  };

  const resetUploaderFlow = () => {
    setCurrentStage("upload");
    setUngroupedImages([]);
    setGroups([]);
    setSelectedImageIds([]);
    setNextGroupNumber(1);
    setError(null);
    setHasGeoData(null);
    setGeoInfo(null);
    setIsCheckingStone(false);
    setStoneCheckResult(null);
  };

  const handleProceedToGrouping = () => {
    if (ungroupedImages.length === 0) {
      setError("Upload at least one image before proceeding.");
      return;
    }

    setSelectedImageIds([]);
    setCurrentStage("grouping");
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds((previous) =>
      previous.includes(imageId)
        ? previous.filter((id) => id !== imageId)
        : [...previous, imageId]
    );
  };

  const createGroupFromSelected = () => {
    if (selectedImageIds.length === 0) return;

    const selectedIdSet = new Set(selectedImageIds);
    const selectedUngroupedImages = ungroupedImages.filter((image) =>
      selectedIdSet.has(image.id)
    );

    if (selectedUngroupedImages.length === 0) {
      setError("Select images from Ungrouped Images to create a group.");
      return;
    }

    setUngroupedImages((previous) =>
      previous.filter((image) => !selectedIdSet.has(image.id))
    );

    setGroups((previous) => [
      ...previous,
      {
        id: createGroupId(),
        name: `Group ${nextGroupNumber}`,
        images: selectedUngroupedImages,
        formData: { ...DEFAULT_GROUP_FORM_DATA },
        status: "idle",
      },
    ]);

    setNextGroupNumber((previous) => previous + 1);
    setSelectedImageIds([]);
  };

  const moveSelectedToUngrouped = (groupId: string) => {
    const selectedSet = new Set(selectedImageIds);
    const targetGroup = groups.find((group) => group.id === groupId);
    if (!targetGroup) return;

    const movedImages = targetGroup.images.filter((image) => selectedSet.has(image.id));

    if (movedImages.length === 0) {
      setError("Select images from this group to move.");
      return;
    }

    setGroups((previous) =>
      previous.map((group) =>
        group.id === groupId
          ? {
              ...group,
              images: group.images.filter((image) => !selectedSet.has(image.id)),
            }
          : group
      )
    );
    setUngroupedImages((previous) => [...previous, ...movedImages]);
    setSelectedImageIds((previous) => previous.filter((id) => !selectedSet.has(id)));
  };

  const updateGroupFormData = (
    groupId: string,
    field: keyof GroupFormData,
    value: string
  ) => {
    setGroups((previous) =>
      previous.map((group) =>
        group.id === groupId
          ? { ...group, formData: { ...group.formData, [field]: value } }
          : group
      )
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    const targetGroup = groups.find((group) => group.id === groupId);
    if (!targetGroup) return;

    setUngroupedImages((previous) => [...previous, ...targetGroup.images]);
    setGroups((previous) => previous.filter((group) => group.id !== groupId));

    const imageIdsInGroup = new Set(targetGroup.images.map((image) => image.id));
    setSelectedImageIds((previous) => previous.filter((id) => !imageIdsInGroup.has(id)));
  };

  const handleSubmitGroup = async (groupId: string) => {
    const group = groups.find((item) => item.id === groupId);
    if (!group || group.status === "submitted" || isAnyGroupSubmitting || uploadLockRef.current) {
      return;
    }

    if (group.images.length === 0) {
      setError("Group must contain at least one image.");
      return;
    }

    if (!group.formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    uploadLockRef.current = true;
    setIsUploading(true);
    setGroups((previous) =>
      previous.map((item) =>
        item.id === groupId ? { ...item, status: "submitting" } : item
      )
    );

    try {
      const form = new FormData();

      group.images.forEach((image) => {
        form.append("images[]", image.file, image.file.name);
        // Compatibility for older Java backend payload parser.
        form.append("files", image.file, image.file.name);
      });

      form.append("title", group.formData.title);
      form.append("description", group.formData.description);
      form.append("type", group.formData.type);
      form.append("topic", group.formData.topic);

      form.append(
        "post",
        new Blob(
          [
            JSON.stringify({
              description: {
                title: group.formData.title,
                description: group.formData.description,
                subject: group.formData.topic,
                postedAnonymously: false,
              },
              topic: group.formData.topic,
              script: [],
              type: group.formData.type,
              visiblity: true,
            }),
          ],
          { type: "application/json" }
        )
      );

      const response = await coreBackendClient.post("post/addPostWithFile", form);
      const body = response?.data;
      const payload = unwrapApiData(body);
      const success = resolveApiSuccess(body, payload, response.status);

      if (!success) {
        throw new Error(resolveApiMessage(body, payload, "Failed to submit group."));
      }

      setGroups((previous) =>
        previous.map((item) =>
          item.id === groupId ? { ...item, status: "submitted" } : item
        )
      );
      showSnackbar("success", `${group.name} submitted successfully`);
      setSelectedImageIds((previous) =>
        previous.filter((id) => !group.images.some((image) => image.id === id))
      );
    } catch (submitError: any) {
      setGroups((previous) =>
        previous.map((item) =>
          item.id === groupId ? { ...item, status: "error" } : item
        )
      );
      const body = submitError?.response?.data;
      const payload = unwrapApiData(body);
      const message =
        resolveApiMessage(body, payload, submitError?.message || "Failed to submit group");
      setError(message);
    } finally {
      setIsUploading(false);
      uploadLockRef.current = false;
    }
  };

  const selectedUngroupedCount = ungroupedImages.filter((image) =>
    selectedImageIds.includes(image.id)
  ).length;

  return (
    <div className="text-white p-4">
      <div className="mx-auto">
        <Header />

        {currentStage === "upload" ? (
          <div className="w-full space-y-4">
            {hasGeoData !== null && <GPSStatus hasGeoData={hasGeoData} geoInfo={geoInfo} />}

            {isCapturing ? (
              <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                onCapture={() => capturePhoto(checkStone)}
                onCancel={stopCamera}
              />
            ) : ungroupedImages.length > 0 ? (
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-2 gap-2 h-120 border-2 border-dashed border-gray-600 rounded-lg p-4 overflow-y-auto">
                  {ungroupedImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <Tooltip
                        placement="top"
                        arrow
                        title={
                          <div className="p-1">
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-64 h-64 object-contain rounded-md bg-black"
                            />
                          </div>
                        }
                      >
                        <img
                          src={image.preview}
                          alt={`Uploaded inscription ${index + 1}`}
                          className="w-full h-32 object-contain border border-gray-300 rounded-lg"
                        />
                      </Tooltip>

                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleRotateUngroupedPhoto(index)}
                          className="cursor-pointer p-1.5 rounded-full bg-black/70 hover:bg-black text-white"
                          aria-label={`Rotate photo ${index + 1}`}
                          title="Rotate"
                        >
                          <RotateCw size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveUngroupedPhoto(index)}
                          className="cursor-pointer p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white"
                          aria-label={`Remove photo ${index + 1}`}
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <span className="text-sm text-center text-gray-500 block">
                  {ungroupedImages.length} photo{ungroupedImages.length === 1 ? "" : "s"} selected
                  for upload
                </span>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={resetUploaderFlow}
                    className="flex-1 cursor-pointer px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={18} />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToGrouping}
                    disabled={ungroupedImages.length === 0}
                    className="flex-1 cursor-pointer px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={18} />
                    Proceed
                  </button>
                </div>
              </div>
            ) : (
              <PhotoUploadArea
                onStartCamera={startCamera}
                onUploadClick={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
            )}
          </div>
        ) : (
          <div className="w-full space-y-6">
            <section className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h3 className="text-black font-semibold">Ungrouped Images: {ungroupedImages.length}</h3>
                <span className="text-sm text-gray-600">Total Images: {totalImages} / 20</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[120px]">
                {ungroupedImages.length > 0 ? (
                  ungroupedImages.map((image, index) => (
                    <label key={image.id} className="relative block cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedImageIds.includes(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        className="absolute top-2 left-2 h-4 w-4 z-10"
                      />
                      <img
                        src={image.preview}
                        alt={`Ungrouped ${index + 1}`}
                        className="w-full h-28 object-cover rounded-md"
                      />
                    </label>
                  ))
                ) : (
                  <div className="col-span-full text-center text-sm text-gray-500 py-8">
                    No ungrouped images yet
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={createGroupFromSelected}
                disabled={selectedUngroupedCount === 0}
                className="mt-4 w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Group From Selected
              </button>
            </section>

            <section className="space-y-4">
              {groups.length === 0 ? (
                <div className="bg-white border border-gray-300 rounded-lg p-4 text-gray-500 text-sm">
                  No groups created yet
                </div>
              ) : (
                groups.map((group) => {
                  const isSubmitted = group.status === "submitted";
                  const isSubmitting = group.status === "submitting";
                  const selectedCountInGroup = group.images.filter((image) =>
                    selectedImageIds.includes(image.id)
                  ).length;
                  const disableEdits = isSubmitted || isSubmitting;

                  return (
                    <article key={group.id} className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-black font-semibold">{group.name}</h4>
                        <span className="text-xs text-gray-500">
                          {group.images.length} image{group.images.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[120px]">
                        {group.images.length > 0 ? (
                          group.images.map((image, index) => (
                            <label key={image.id} className="relative block cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedImageIds.includes(image.id)}
                                onChange={() => toggleImageSelection(image.id)}
                                disabled={disableEdits}
                                className="absolute top-2 left-2 h-4 w-4 z-10"
                              />
                              <img
                                src={image.preview}
                                alt={`${group.name} image ${index + 1}`}
                                className="w-full h-28 object-cover rounded-md"
                              />
                            </label>
                          ))
                        ) : (
                          <div className="col-span-full text-center text-sm text-gray-500 py-8">
                            No images in this group
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => moveSelectedToUngrouped(group.id)}
                          disabled={disableEdits || selectedCountInGroup === 0}
                          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Move to Ungrouped
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <TextField
                          label="Title"
                          size="small"
                          value={group.formData.title}
                          onChange={(event) =>
                            updateGroupFormData(group.id, "title", event.target.value)
                          }
                          disabled={disableEdits}
                          fullWidth
                        />
                        <TextField
                          label="Topic"
                          size="small"
                          value={group.formData.topic}
                          onChange={(event) =>
                            updateGroupFormData(group.id, "topic", event.target.value)
                          }
                          disabled={disableEdits}
                          fullWidth
                        />
                        <TextField
                          select
                          label="Type"
                          size="small"
                          value={group.formData.type}
                          onChange={(event) =>
                            updateGroupFormData(group.id, "type", event.target.value)
                          }
                          disabled={disableEdits}
                          fullWidth
                        >
                          <MenuItem value="Stone">Stone</MenuItem>
                          <MenuItem value="Metal">Metal</MenuItem>
                          <MenuItem value="Clay">Clay</MenuItem>
                        </TextField>
                        <TextField
                          label="Description"
                          size="small"
                          value={group.formData.description}
                          onChange={(event) =>
                            updateGroupFormData(group.id, "description", event.target.value)
                          }
                          disabled={disableEdits}
                          multiline
                          minRows={3}
                          fullWidth
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 items-center">
                        <button
                          type="button"
                          onClick={() => handleSubmitGroup(group.id)}
                          disabled={
                            isSubmitted ||
                            isSubmitting ||
                            (isUploading && !isSubmitting) ||
                            (isAnyGroupSubmitting && !isSubmitting)
                          }
                          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <CircularProgress size={16} sx={{ color: "white" }} />
                              Submitting...
                            </>
                          ) : isSubmitted ? (
                            "Submitted"
                          ) : group.status === "error" ? (
                            "Retry"
                          ) : (
                            "Submit Group"
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={disableEdits}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Delete Group
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </div>
        )}
      </div>

      <Snackbar
        key={snackbarKey}
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={3500}
        TransitionComponent={SlideDownTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage.split(" | ").map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EnhancedInscriptionUploaderV5;
