import { Upload } from "lucide-react";

interface UploadButtonProps {
  onClick: () => void;
  disabled: boolean;
  isUploading: boolean;
}

export const UploadButton = ({ onClick, disabled, isUploading }: UploadButtonProps) => {
  console.log("isUploading:", isUploading, "disabled:", disabled);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
    >
      {isUploading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          Uploading with GPS data...
        </>
      ) : (
        <>
          <Upload size={20} />
          Submit Inscription
        </>
      )}
    </button>
  )
};