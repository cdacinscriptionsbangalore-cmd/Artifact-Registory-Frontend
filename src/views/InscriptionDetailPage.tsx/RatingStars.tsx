import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 20,
  className = "",
}) => {
  const safeRating = Math.max(0, Math.min(rating, max));
  const fillPercentage = (safeRating / max) * 100;

  return (
    <div
      className={`relative inline-block leading-none ${className}`}
      style={{
        width: `${max * size}px`,
        height: `${size}px`,
      }}
      aria-label={`Rating: ${safeRating} out of ${max}`}
    >
      {/* Background stars */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={`bg-${i}`}
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Star
              style={{ width: size, height: size,  }}
              className="text-gray-300 fill-gray-300 stroke-gray-600 stroke-2"
            />
          </span>
        ))}
      </div>

      {/* Filled stars */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fillPercentage}%` }}
      >
        <div className="flex">
          {Array.from({ length: max }).map((_, i) => (
            <span
              key={`fg-${i}`}
              className="flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <Star
                style={{ width: size, height: size }}
                className="text-yellow-400 fill-yellow-400 stroke-gray-600 stroke-2"
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingStars;