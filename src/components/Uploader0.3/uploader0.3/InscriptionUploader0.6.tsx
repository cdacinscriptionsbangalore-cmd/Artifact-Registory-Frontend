import React, { useEffect, useRef, useState } from "react";
import piexifjs from "piexifjs";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  MenuItem,
  Slide,
  Snackbar,
  TextField,
  type SlideProps,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Camera, FolderPlus, RefreshCcw, Upload } from "lucide-react";

import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import { detectAIClient } from "@/utils/http/clients/detectAIClient";

import { Header } from "../components/Header";
import { CameraView } from "../components/CameraView";
import { PhotoUploadArea } from "../components/PhotoUploadArea";
import { GPSStatus } from "../components/GPSStatus";
import { useCamera } from "../hooks/UseCamera";
import type { GeoInfo } from "../types/types";
import verifyGPSInImage from "../utils/GPS/verifyGPSInImage";

const isOnline = true; // true => validate with AI, false => skip AI validation only

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
}

const DEFAULT_GROUP_FORM_DATA: GroupFormData = {
  title: "",
  description: "",
  type: "Stone",
  topic: "",
};

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

const createUngroupedGroup = (): ImageGroup => ({
  id: "ungrouped",
  name: "Ungrouped",
  images: [],
  formData: { ...DEFAULT_GROUP_FORM_DATA },
});

function SlideDownTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
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

const EnhancedInscriptionUploaderV5: React.FC = () => {
  const [groups, setGroups] = useState<ImageGroup[]>([createUngroupedGroup()]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGeoData, setHasGeoData] = useState<boolean | null>(null);
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingStone, setIsCheckingStone] = useState(false);
  const [stoneCheckResult, setStoneCheckResult] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImagesToUngrouped = (images: ImageItem[]) => {
    if (!images.length) return;

    setGroups((prev) =>
      prev.map((group) =>
        group.id === "ungrouped"
          ? { ...group, images: [...group.images, ...images] }
          : group
      )
    );
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
  };

  const checkStone = async (imageDataUrl: string): Promise<boolean> => {
    if (!isOnline) {
      setStoneCheckResult("Offline mode: AI validation bypassed");
      return true;
    }

    setIsCheckingStone(true);
    setStoneCheckResult(null);

    try {
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "inscription.jpg");

      interface DetectAIResponse {
        result: string;
        detail?: string;
      }

      const { data } = await detectAIClient.post<DetectAIResponse>(
        "predict/",
        formData
      );

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

  const handlePhotoCapture = async (
    photoDataUrl: string,
    locationData: any,
    hasGPS: boolean
  ) => {
    try {
      const file = await dataUrlToFile(photoDataUrl, `camera-${Date.now()}.jpg`);
      addImagesToUngrouped([{ id: createImageId(), file, preview: photoDataUrl }]);
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

  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  };

  const createGroupFromSelected = () => {
    if (!selectedImageIds.length) return;

    setGroups((prevGroups) => {
      let movedImages: ImageItem[] = [];

      const updatedGroups = prevGroups.map((group) => {
        const selectedInThisGroup = group.images.filter((img) =>
          selectedImageIds.includes(img.id)
        );

        if (selectedInThisGroup.length > 0) {
          movedImages = [...movedImages, ...selectedInThisGroup];
        }

        return {
          ...group,
          images: group.images.filter((img) => !selectedImageIds.includes(img.id)),
        };
      });

      if (!movedImages.length) {
        return prevGroups;
      }

      const nextGroupNumber =
        updatedGroups.filter((group) => group.id !== "ungrouped").length + 1;

      return [
        ...updatedGroups,
        {
          id: createGroupId(),
          name: `Group ${nextGroupNumber}`,
          images: movedImages,
          formData: { ...DEFAULT_GROUP_FORM_DATA },
        },
      ];
    });

    setSelectedImageIds([]);
  };

  const updateGroupFormData = (
    groupId: string,
    field: keyof GroupFormData,
    value: string
  ) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, formData: { ...group.formData, [field]: value } }
          : group
      )
    );
  };

  const uploadGroup = async (group: ImageGroup) => {
    const form = new FormData();

    group.images.forEach((image) => {
      form.append("images[]", image.file, image.file.name);
    });

    form.append("title", group.formData.title || "");
    form.append("description", group.formData.description || "");
    form.append("type", group.formData.type || "Stone");
    form.append("topic", group.formData.topic || "");

    await coreBackendClient.post("post/addPostWithFile", form);
  };

  const resetForm = () => {
    setGroups([createUngroupedGroup()]);
    setSelectedImageIds([]);
    setError(null);
    setHasGeoData(null);
    setGeoInfo(null);
    setStoneCheckResult(null);
  };

  const handleSubmitAll = async () => {
    const groupsToUpload = groups.filter((group) => group.images.length > 0);
    if (!groupsToUpload.length) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const group of groupsToUpload) {
        await uploadGroup(group);
      }

      alert("All groups uploaded successfully!");
      resetForm();
      window.location.href = "/feed";
    } catch (uploadError: any) {
      setError(uploadError?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarKey, setSnackbarKey] = useState(0);

  const showSnackbar = (
    severity: "info" | "success" | "warning" | "error",
    message: string
  ) => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setSnackbarKey((prev) => prev + 1);
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
      return;
    }

    setSnackbarOpen(false);
  }, [isCheckingStone, stoneCheckResult, error]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
    setError(null);
    setStoneCheckResult(null);
  };

  const hasAnyImages = groups.some((group) => group.images.length > 0);

  return (
    <div className="text-white p-4">
      <div className="mx-auto">
        <Header />
        <div className="space-x-6 sm:flex">
          <div style={{ width: "100%" }}>
            {hasGeoData !== null && (
              <GPSStatus hasGeoData={hasGeoData} geoInfo={geoInfo} />
            )}

            <div className="mb-6">
              {isCapturing ? (
                <CameraView
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  onCapture={() => capturePhoto(checkStone)}
                  onCancel={stopCamera}
                />
              ) : hasAnyImages ? (
                <div className="space-y-4">
                  <div className="flex h-14 gap-3">
                    <button
                      onClick={startCamera}
                      className="flex-1 cursor-pointer px-4 py-3 bg-primary hover:bg-yellow-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <Camera size={16} />
                      Take Photo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 cursor-pointer py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <Upload size={16} />
                      Upload from Device
                    </button>
                  </div>

                  <div className="flex h-12 gap-3">
                    <button
                      onClick={createGroupFromSelected}
                      disabled={selectedImageIds.length === 0}
                      className="flex-1 cursor-pointer px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <FolderPlus size={16} />
                      Create Group
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 cursor-pointer px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <RefreshCcw size={16} />
                      Reset
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
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
          </div>

          <div style={{ width: "100%" }} className="space-y-4">
            {groups.map((group) => (
              <section key={group.id} className="bg-white border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-black font-semibold text-sm">{group.name}</h3>
                  <span className="text-xs text-gray-500">
                    {group.images.length} image{group.images.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-2 border-dashed border-gray-600 rounded-lg p-3 max-h-56 overflow-y-auto">
                  {group.images.length > 0 ? (
                    group.images.map((image, idx) => (
                      <div key={image.id} className="relative">
                        <input
                          type="checkbox"
                          checked={selectedImageIds.includes(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          className="absolute top-2 left-2 h-4 w-4 z-10"
                        />
                        <img
                          src={image.preview}
                          alt={`Group image ${idx + 1}`}
                          className="w-full h-28 object-cover rounded-lg"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-xs text-gray-500 py-4">
                      No images in this group
                    </div>
                  )}
                </div>

                <Accordion disableGutters defaultExpanded={group.id === "ungrouped"} className="mt-3">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <span className="text-sm font-medium text-black">Post Form</span>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField
                        label="Title"
                        size="small"
                        value={group.formData.title}
                        onChange={(event) =>
                          updateGroupFormData(group.id, "title", event.target.value)
                        }
                        fullWidth
                      />
                      <TextField
                        label="Topic"
                        size="small"
                        value={group.formData.topic}
                        onChange={(event) =>
                          updateGroupFormData(group.id, "topic", event.target.value)
                        }
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
                        multiline
                        minRows={3}
                        fullWidth
                      />
                    </div>
                  </AccordionDetails>
                </Accordion>
              </section>
            ))}

            <button
              onClick={handleSubmitAll}
              disabled={!hasAnyImages || isUploading}
              className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting all groups...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Submit All
                </>
              )}
            </button>
          </div>
        </div>
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
