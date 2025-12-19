import { Check, WandSparkles } from "lucide-react";
import type { GeoInfo } from "../types/types";
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

interface SuggestionControlsProps {
  isFetching: boolean;
  onFetch: (lat?: string, lon?: string) => void;
  geoInfo: GeoInfo | null;
  suggestion: string | null;
  onUseSuggestion: (text: string) => void;
}

const SuggestionControls: React.FC<SuggestionControlsProps> = ({
  isFetching,
  onFetch,
  geoInfo,
  suggestion,
  onUseSuggestion
}) => {
  const handleUseSuggestion = async () => {
    if (!suggestion) return;
    onUseSuggestion(suggestion);
    try {
      await navigator.clipboard.writeText(suggestion);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={() => onFetch()}
        disabled={isFetching}
        className="flex cursor-pointer items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
      >
        {/* <WandSparkles /> */}
        <AutoAwesomeOutlinedIcon />
        <span>
          {isFetching ? "Suggesting…" : "Suggest Description"}
        </span>
      </button>

      {/* <button
        onClick={() => {
          if (geoInfo?.latitude && geoInfo?.longitude) {
            onFetch(geoInfo.latitude, geoInfo.longitude);
          } else {
            onFetch();
          }
        }}
        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
      >
        Use current location
      </button> */}

      {suggestion && suggestion!== "Failed to get suggestion." && (
        <button
          onClick={handleUseSuggestion}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
        >
          <Check />
          <span>
            Use suggestion
          </span>
        </button>
      )}
    </div>
  );
};

export default SuggestionControls;