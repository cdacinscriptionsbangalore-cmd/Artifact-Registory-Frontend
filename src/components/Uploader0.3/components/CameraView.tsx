import { Camera, X } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onCapture: () => void;
  onCancel: () => void;
}

export const CameraView = ({ videoRef, canvasRef, onCapture, onCancel }: CameraViewProps) => (
  <div className="space-y-4">
    <video ref={videoRef} className="w-full h-102 object-cover rounded-lg" autoPlay muted />
    <canvas ref={canvasRef} className="hidden" />
    <div className="flex gap-3 justify-center">
      <button
        onClick={onCapture}
        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition flex items-center gap-2"
      >
        <Camera size={20} />
        Capture with GPS
      </button>
      <button
        onClick={onCancel}
        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center gap-2"
      >
        <X size={20} />
        Cancel
      </button>
    </div>
  </div>
);