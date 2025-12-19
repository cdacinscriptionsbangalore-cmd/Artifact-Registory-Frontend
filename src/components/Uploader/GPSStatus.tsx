import React from 'react';
import { type GeoInfo } from '@/types';

interface GPSStatusProps {
  hasGeoData: boolean | null;
  geoInfo: GeoInfo | null;
}

export const GPSStatus: React.FC<GPSStatusProps> = ({ hasGeoData, geoInfo }) => {
  if (hasGeoData === null) return null;

  return (
    <div className={`w-full mb-4 p-3 rounded-lg text-sm ${
      hasGeoData 
        ? 'bg-green-100 border border-green-700 text-green-700' 
        : 'bg-yellow-200 border border-yellow-700 text-yellow-700'
    }`}>
      {hasGeoData ? (
        <div>
          ✅ Location data found!
          {geoInfo && (
            <div className="mt-1 text-xs">
              {geoInfo.latitude && geoInfo.longitude && (
                <p>Coordinates: {geoInfo.latitude}, {geoInfo.longitude}</p>
              )}
              {geoInfo.accuracy && (
                <p>Accuracy: ±{Math.round(geoInfo.accuracy)}m</p>
              )}
            </div>
          )}
        </div>
      ) : (
        "⚠️ No location data found in image"
      )}
    </div>
  );
};