import { ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { Comment } from "./InscriptionDetailPage";
import type { User } from "@/types";
import { getCookie } from "@/utils/auth";
import { Tooltip } from "@mui/material";

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

interface CommentCardProps {
  comments: Comment;
  currentUser?: User; // Pass user from parent to avoid redundant fetches
}

const CommentCard: React.FC<CommentCardProps> = ({ comments, currentUser }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comments.upvote);

  // Initialize isLiked based on userVote
  useEffect(() => {
    if (currentUser?._id) {
      const liked = comments.userVote.includes(currentUser._id);
      setIsLiked(liked);
    }
  }, [currentUser, comments.userVote]);

  // Like/Dislike API
  const LikeDisLikeAPI = async () => {
    const token = getCookie('token');
    const xsrfToken = getCookie('XSRF-TOKEN') || '50d7115f-8f84-4e07-a8ae-1a155afe4864';

    if (!token || !currentUser?._id) {
      console.error('No token or user');
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("X-XSRF-TOKEN", xsrfToken);

    const urlencoded = new URLSearchParams();
    urlencoded.append("descriptionId", comments.id || "");

    const requestOptions = {
      credentials: 'include' as RequestCredentials,
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
    };

    // Save current state for rollback
    const previousLiked = isLiked;
    const previousLikes = likes;

    // Optimistically update UI
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikes(prevLikes => prevLikes + (newLikedState ? 1 : -1));

    try {
      const response = await fetch(`${backendApiUrl}/post/addVote`, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Vote result:', result);

      // Optionally update with server response if it returns updated vote count
      if (result.upvote !== undefined) {
        setLikes(result.upvote);
      }
    } catch (error) {
      // Revert UI on error
      console.error('Failed to update vote:', error);
      setIsLiked(previousLiked);
      setLikes(previousLikes);
    }
  };

  if (!currentUser) {
    return (
      <div className="border-1 border-gray-700 pb-6 mb-6 last:border-b-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-yellow-400 font-semibold text-lg mb-1">{comments.username}</h4>
            <p className="text-gray-300 text-base leading-relaxed">
              {comments.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-1 border-solid border-yellow-400 rounded-lg bg-white mb-6 p-2">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-orange-400 font-semibold text-lg mb-1">{comments.username}</h4>
          <p className="text-black text-base leading-relaxed">
            {comments.description}
          </p>
        </div>
        <div className="ml-4 flex items-center gap-2">
          <Tooltip title="Like">
            <button
              onClick={LikeDisLikeAPI}
              className={`flex cursor-pointer items-center gap-1 px-3 py-1 rounded-full transition-colors ${isLiked
                  ? 'text-blue-400 bg-blue-900/30'
                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20'
                }`}
              aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likes}</span>
            </button>
          </Tooltip>

        </div>
      </div>
    </div>
  );
};

export default CommentCard;