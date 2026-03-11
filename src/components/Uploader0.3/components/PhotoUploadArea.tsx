import { Camera, Upload } from "lucide-react";

interface PhotoUploadAreaProps {
  onStartCamera: () => void;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhotoUploadArea = ({ 
  onStartCamera, 
  onUploadClick, 
  fileInputRef, 
  onFileChange 
}: PhotoUploadAreaProps) => (
  <div className="space-y-4">
    <div className="w-full cursor-pointer h-102 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-black rounded-lg"         onClick={onUploadClick}
>
      <Camera size={48} className="text-orange-500 mb-4" />
      <p className="text-gray-400 text-center text-sm">
        Capture or upload photos with GPS coordinates
      </p>
      <p className="text-gray-500 text-center text-xs mt-2">
        Images with existing GPS data will be automatically detected
      </p>
      <p className="text-red-500 text-center text-xs mt-2 text-bold">
        File size must not exceed 75MB.
      </p>
      <p className="text-blue-500 text-center text-xs mt-2 text-bold">
        Acceptable formats: .jpg, .jpeg, .png, .webp
      </p>
    </div>
    <div className="flex h-14 gap-3">
      <button
        onClick={onStartCamera}
        className="flex-1 cursor-pointer px-4 py-3 bg-primary hover:bg-yellow-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
      >
        <Camera size={16} />
        Take Photo
      </button>
      <button
        onClick={onUploadClick}
        className="flex-1 px-4 cursor-pointer py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
      >
        <Upload size={16} />
        Upload from Device
      </button>
    </div>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={onFileChange}
      className="hidden"
    />
  </div>
);