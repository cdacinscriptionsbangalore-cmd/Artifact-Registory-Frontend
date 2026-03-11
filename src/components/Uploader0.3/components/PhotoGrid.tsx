import CircularProgess from "@/components/Spinner/CircularProgess";
import { RefreshCcw, RotateCw, Trash2 } from "lucide-react";
import { Tooltip } from "@mui/material";

interface PhotoGridProps {
  photos: string[];
  onReset: () => void;
  onRemovePhoto: (index: number) => void;
  onRotatePhoto: (index: number) => void;
}

export const PhotoGrid = ({
  photos,
  onReset,
  onRemovePhoto,
  onRotatePhoto,
}: PhotoGridProps) => (
  <div className="space-y-4 w-full h-120 flex flex-col justify-between">
    <div className="grid grid-cols-2 gap-2 h-120 border-2 border-dashed border-gray-600 rounded-lg p-4 overflow-y-auto">
      {photos ? (
        photos.map((photo, idx) => (
          <div key={idx} className="relative group">
            <Tooltip
              placement="top"
              arrow
              title={
                <div className="p-1">
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
                className="w-full h-32 object-contain border border-gray-300 rounded-lg"
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
        <CircularProgess size={40} />
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
