import CircularProgess from "@/components/Spinner/CircularProgess";
import { RefreshCcw } from "lucide-react";

interface PhotoGridProps {
  photos: string[];
  onReset: () => void;
}

export const PhotoGrid = ({ photos, onReset }: PhotoGridProps) => (
  <div className="space-y-4 w-full h-120 flex flex-col justify-between">
    <div className="grid grid-cols-2 gap-2 h-120 border-2 border-dashed border-gray-600 rounded-lg p-4 overflow-y-auto">
      {photos? photos.map((photo, idx) => (
        <img
          key={idx}
          src={photo}
          alt={`Captured inscription ${idx + 1}`}
          className="w-full h-32 object-cover rounded-lg"
        />
      )): <CircularProgess size={40} /> }
    </div>
      <span className="text-sm text-center text-gray-500" style={{width:"100%"}}>{photos.length>0?photos.length: "No"} photos selected for upload</span>
    <button
      onClick={onReset}
      className="cursor-pointer w-full px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition w-full px-6 py-4 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
    >
      <RefreshCcw className="inline mr-2" />
      Reset
    </button>
  </div>
);
