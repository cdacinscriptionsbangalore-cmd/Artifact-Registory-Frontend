import CircularProgess from "@/components/Spinner/CircularProgess";
import { RefreshCcw, RotateCw, Trash2 } from "lucide-react";
import { Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface PhotoGridProps {
  photos: string[];
  onReset: () => void;
  onRemovePhoto: (index: number) => void;
  onRotatePhoto: (index: number) => void;
}

const useActualOverflow = <T extends HTMLElement>(dependency: number) => {
  const ref = useRef<T | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      setHasOverflow(false);
      return;
    }

    const updateOverflowState = () => {
      setHasOverflow(element.scrollHeight > element.clientHeight + 1);
    };

    updateOverflowState();
    window.addEventListener("resize", updateOverflowState);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateOverflowState);

    resizeObserver?.observe(element);
    Array.from(element.children).forEach((child) => resizeObserver?.observe(child));

    return () => {
      window.removeEventListener("resize", updateOverflowState);
      resizeObserver?.disconnect();
    };
  }, [dependency]);

  return { ref, hasOverflow };
};

export const PhotoGrid = ({
  photos,
  onReset,
  onRemovePhoto,
  onRotatePhoto,
}: PhotoGridProps) => {
  const photoGridOverflow = useActualOverflow<HTMLDivElement>(photos.length);

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        ref={photoGridOverflow.ref}
        className={`grid grid-cols-2 sm:grid-cols-4 gap-3 border-2 border-dashed border-gray-600 rounded-lg p-4 min-h-[180px] max-h-[520px] ${
          photoGridOverflow.hasOverflow ? "overflow-y-auto" : "overflow-visible"
        }`}
      >
      {photos.length > 0 ? (
        photos.map((photo, idx) => (
          <div key={idx} id={`test-image-${idx}`} className="relative group h-32">
            <Tooltip
              placement="top"
              arrow
              title={
                <div className="p-1 max-w-[calc(100vw-3rem)] overflow-hidden rounded-md">
                  <img
                    src={photo}
                    alt={`Preview ${idx + 1}`}
                    className="w-64 h-64 object-contain rounded-md bg-black"
                  />
                </div>
              }
            >
              <img
                src={photo}
                alt={`Captured inscription ${idx + 1}`}
                className="w-full h-full object-contain border border-gray-300 rounded-lg"
              />
            </Tooltip>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onRotatePhoto(idx)}
                className="cursor-pointer p-1.5 rounded-full bg-black/70 hover:bg-black text-white"
                aria-label={`Rotate photo ${idx + 1}`}
                title="Rotate"
              >
                <RotateCw size={14} />
              </button>
              <button
                type="button"
                onClick={() => onRemovePhoto(idx)}
                className="cursor-pointer p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white"
                aria-label={`Remove photo ${idx + 1}`}
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex items-center justify-center py-8">
          <CircularProgess size={40} />
        </div>
      )}
      </div>

      <span className="text-sm text-center text-gray-500" style={{ width: "100%" }}>
        {photos.length > 0 ? photos.length : "No"} photos selected for upload
      </span>

      <button
        onClick={onReset}
        className="cursor-pointer w-full px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition w-full px-6 py-4 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
      >
        <RefreshCcw className="inline mr-2" />
        Reset
      </button>
    </div>
  );
};
