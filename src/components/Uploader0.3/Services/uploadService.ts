import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import type { PostSchema, GeoInfo } from "../types/types";

export const uploadInscription = async (
  photos: string[],
  formData: PostSchema,
  geoInfo: GeoInfo | null
) => {
  try {
    console.log("[UPLOAD] Starting upload...");
    console.log("[UPLOAD] Total photos:", photos.length);

    const form = new FormData();

    // Convert image URLs to blobs
    for (let i = 0; i < photos.length; i++) {
      console.log(`[UPLOAD] Processing photo ${i + 1}/${photos.length}`);

      const res = await fetch(photos[i]);

      if (!res.ok) {
        throw new Error(`Failed to fetch image at index ${i}`);
      }

      const blob = await res.blob();
      form.append("files", blob, `inscription_${i + 1}.jpg`);
    }

    // Prepare post metadata
    const postData: PostSchema = {
      ...formData,
      description: {
        ...formData.description,
        geoLocation:
          geoInfo?.latitude && geoInfo?.longitude
            ? `${geoInfo.latitude}, ${geoInfo.longitude}`
            : undefined,
      },
    };

    // Attach JSON metadata as blob
    form.append(
      "post",
      new Blob([JSON.stringify(postData)], {
        type: "application/json",
      })
    );

    console.log("[UPLOAD] Sending request to backend...");

    const response = await coreBackendClient.post(
      "post/addPostWithFile",
      form
    );

    const backend = response.data;

    console.log("[UPLOAD] Backend response:", backend);

    // ✅ Success case
    if (response.status >= 200 && response.status < 300) {
      if (backend?.data === true) {
        console.log("[UPLOAD] Upload successful:", backend.message);
        return backend;
      }

      // Unexpected success format
      throw new Error(
        backend?.message || "Unexpected success response format"
      );
    }

    // Should rarely reach here because axios throws for 4xx/5xx
    throw new Error(
      backend?.error_message ||
        backend?.message ||
        "Upload failed"
    );

  } catch (error: any) {
    console.error("[UPLOAD] Upload failed:", error);

    // Axios error with backend response
    if (error?.response?.data) {
      const backendError = error.response.data;

      const meaningfulMessage =
        backendError.error_message ||
        backendError.message ||
        `Request failed with status ${error.response.status}`;

      throw new Error(meaningfulMessage);
    }

    // Network or unexpected error
    throw new Error(
      error?.message || "Unexpected server error. Please try again later."
    );
  }
};
