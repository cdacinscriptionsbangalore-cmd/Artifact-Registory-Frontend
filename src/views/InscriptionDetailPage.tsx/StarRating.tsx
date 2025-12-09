// StarRating component
import { Star } from "lucide-react";
import type React from "react";
import { useState } from "react";

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

interface StarRatingProps {
  rating: number;
  size?: string;
  interactive?: boolean;
  usersRated?: number;
  onRate?: (rating: number) => void;
}

// Star Rating Component
const StarRating: React.FC<StarRatingProps> = ({ rating, size = "w-5 h-5", interactive = false, onRate = null, usersRated }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleClick = (index: number) => {
    if (interactive) {
      const newRating = index + 1;
      setCurrentRating(newRating);
      if (onRate) onRate(newRating);
    }
  };

  const displayRating = interactive ? (hoverRating || currentRating) : rating;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const isFilled = index < fullStars;
        const isHalf = index === fullStars && hasHalfStar;

        return (
          <Star
            key={index}
            className={`${size} cursor-${interactive ? 'pointer' : 'default'} transition-colors ${isFilled || isHalf ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
              } ${interactive && hoverRating > index ? 'fill-yellow-300 text-yellow-300' : ''}`}
            onClick={() => handleClick(index)}
            onMouseEnter={() => interactive && setHoverRating(index + 1)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        );
      })}
      <span className="text-gray-300">({usersRated})</span>
    </div>
  );
};

export default StarRating;

// API service for rating
const submitRatingToAPI = async (postId: string, rating: number): Promise<string> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoidXNlciIsImV4cCI6MTc1NzA1MjE5OSwidXNlciI6Im5pbmpha2Fua2FpMUBnbWFpbC5jb20iLCJpYXQiOjE3NTY5NjU3OTl9.58fo0J8OVPL53fZeK0sgVvGzbSxSGg8p0tq0gtKJPwc");

  const urlencoded = new URLSearchParams();
  urlencoded.append("postId", postId);
  urlencoded.append("rating", rating.toString());

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${backendApiUrl}post/addRating`, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.text();
    return result;
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};

