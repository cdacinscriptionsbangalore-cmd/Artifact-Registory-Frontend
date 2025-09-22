import { ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { Comment } from "./InscriptionDetailPage";
import type { User } from "@/types";

const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;

interface CommentCardProps{
    comments: Comment;
}

// Comment Component
const CommentCard: React.FC<CommentCardProps> = ({ comments }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comments.upvote);
  const [UserDetails, SetUserDetails] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }  

  // Like/Dislike API
  const LikeDisLikeAPI = async () => {
    const token = getCookie('token');
    if (!token || !UserDetails?._id) {
      console.error('No token or user');
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const urlencoded = new URLSearchParams();
    urlencoded.append("descriptionId", comments.id || "");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
    };

    // Optimistically update UI
    setIsLiked((prev) => !prev);
    setLikes((prev) => prev + (isLiked ? -1 : 1));

    try {
      const response = await fetch(`${backendApiUrl}post/addVote`, requestOptions);
      const result = await response.text();
      console.log(result);
      // Optionally, you can refetch the comment or update userVote array here
    } catch (error) {
      // Revert UI if error
      setIsLiked((prev) => !prev);
      setLikes((prev) => prev + (isLiked ? 1 : -1));
      console.error(error);
    }
  };

  useEffect(() => {
      // Get token at the beginning
      const token = getCookie('token');
      
      if (!token) {
        console.error('No token found');
        // Redirect to login or handle no token case
        return;
      }
  
      const fetchUser = async () => {
        try {
          const token = getCookie('token');
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
          myHeaders.append("Authorization", `Bearer ${token}`);

          const urlencoded = new URLSearchParams();
          urlencoded.append("descriptionId", comments.id);

          const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
            redirect: "follow"
          };
          const response = await fetch(`${backendApiUrl}/post/userProfile`, requestOptions)
          
          const data = await response.json();
          SetUserDetails(data.data);
        } catch (error) {
          console.error('Failed to fetch posts:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }, []);
    
  // Set isLiked based on userVote and UserDetails
  useEffect(() => {
    if (UserDetails?._id) {
      const liked = comments.userVote.includes(UserDetails._id);
      setIsLiked(liked);
      setLikes(comments.upvote + (liked ? 0 : 0)); // upvote is already correct
    }
  }, [UserDetails, comments.userVote, comments.upvote]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-700 pb-6 mb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-yellow-400 font-semibold text-lg mb-1">{comments.username}</h4>
          <p className="text-gray-300 text-base leading-relaxed">
            {comments.description}
          </p>
        </div>
        <div className="ml-4 flex items-center gap-2">
          <button
            onClick={LikeDisLikeAPI}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              isLiked ? 'text-blue-400 bg-blue-900/30' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;