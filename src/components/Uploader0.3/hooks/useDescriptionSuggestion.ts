import { useState } from "react";
import getCurrentLocation from "../utils/Camera/getCurrentLocation";
import { getEnvConfig } from "../config/env";

export const useDescriptionSuggestion = (geoInfo: any) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchSuggestion = async (lat?: string, lon?: string) => {
    setSuggestion(null);
    setIsFetching(true);
    
    try {
      let latitude = lat || geoInfo?.latitude;
      let longitude = lon || geoInfo?.longitude;

      if (!latitude || !longitude) {
        const loc = await getCurrentLocation();
        latitude = loc.latitude;
        longitude = loc.longitude;
      }

      if (!latitude || !longitude) throw new Error("No coordinates available");

      const { webhookUrl } = getEnvConfig();
      const url = `${webhookUrl}?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Service returned ${res.status}`);

      let text = "";
      try {
        const json = await res.json();
        text = json.suggestion || json.description || json.text || JSON.stringify(json);
        console.log("Suggestion service response JSON:", json);
        console.log("Suggestion service response text:", text);
      } catch (err) {
        text = await res.text();
      }

      setSuggestion(text);
    } catch (err) {
      setSuggestion("Failed to get suggestion.");
    } finally {
      setIsFetching(false);
    }
  };

  return { suggestion, setSuggestion, isFetching, fetchSuggestion };
};