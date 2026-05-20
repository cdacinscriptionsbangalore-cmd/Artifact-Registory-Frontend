
import type React from "react";
import { useState } from "react";
import StarRating from "./StarRating";
import { Heart, MapPin, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { Post } from "./Feed";
import { Badge, CircularProgress } from "@mui/material";
import AppImage from "@/components/AppImage";

interface DiscoveryCardProps {
  post: Post;
  layout?: string;
  loading?: boolean;
  transcriptionCount?: number;
}

const toTimestamp = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const getPostCreatedTimestamp = (post: Post): number => {
  return (
    toTimestamp((post as any)?.createdAt) ||
    toTimestamp((post as any)?.description?.createdAt) ||
    toTimestamp((post as any)?.updatedAt) ||
    toTimestamp((post as any)?.description?.updatedAt)
  );
};

const isOnline = true; // true => use actual visibility logic, false => assume all posts are visible
const formatTimeAgo = (timestamp: number): string => {
  if (!timestamp) return "Unknown time";

  const diffMs = Date.now() - timestamp;
  if (diffMs <= 0) return "Just now";

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < week) return `${Math.floor(diffMs / day)}d ago`;
  if (diffMs < month) return `${Math.floor(diffMs / week)}w ago`;
  if (diffMs < year) return `${Math.floor(diffMs / month)}mo ago`;
  return `${Math.floor(diffMs / year)}y ago`;
};

const getCommentCount = (post: Post): number => {
  const numericCandidates = [
    (post as any)?.commentsCount,
    (post as any)?.commentCount,
    (post as any)?.totalComments,
    (post as any)?.descriptionCount,
    (post as any)?.discriptionCount,
    (post as any)?.comment_count,
    (post as any)?.comments_count,
  ];

  for (const value of numericCandidates) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }
  }

  const arrayCandidates = [
    (post as any)?.comments,
    (post as any)?.descriptions,
    (post as any)?.discriptions,
    (post as any)?.postDescriptions,
    (post as any)?.postDiscriptions,
  ];

  for (const value of arrayCandidates) {
    if (Array.isArray(value)) {
      return value.length;
    }
  }

  return 0;
};

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ post, layout = "grid", loading, transcriptionCount }) => {
  const [isLiked, setIsLiked] = useState(false);

  const city = post?.description?.geolocation?.city ?? "Unknown";
  const state = post?.description?.geolocation?.state ?? "Unknown";
  const commentCount = typeof transcriptionCount === "number" ? transcriptionCount : getCommentCount(post);
  const postedTimeAgo = formatTimeAgo(getPostCreatedTimestamp(post));
  const visibilityRaw = (post as any)?.visibility ?? (post as any)?.visiblity;
  const postedAnonymously = (post as any)?.description?.postedAnonymously;
  const isPostVisible =
    typeof visibilityRaw === "boolean"
      ? visibilityRaw
      : typeof postedAnonymously === "boolean"
        ? !postedAnonymously
        : true;
  const resolvedAuthorName = (post as any)?.username ?? (post as any)?.user_name;
  const authorName = isPostVisible ? (resolvedAuthorName || "Anonymous") : "Anonymous";

  // console.log(post);
  if (layout === "list") {
    return (
      <div className="bg-secondary-background rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
        <div className="flex" >


          <div className="w-32 h-24 sm:w-48 sm:h-32 flex-shrink-0 relative">
            <AppImage
              src={post.images.image[0]}
              alt={post.description.title}
              className="w-full h-full object-cover"
            />
            {/* <div className="absolute top-2 right-2 text-white text-xs bg-primary-background bg-opacity-50 px-2 py-1 rounded">
              {post.distance} miles
            </div> */}
          </div>

          <div className="flex-1 p-4 min-w-0">

            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-1 truncate">{post.description.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {post.rating && post.rating != 0 && <StarRating rating={post.rating} />}
                  <h1 className="text-9xl font-bold text-red-500">Hello</h1>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 ml-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${isLiked ? 'text-red-400' : 'text-gray-400'
                    } hover:text-red-400 transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {post.description.upvote}
                </button>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-3 line-clamp-2" style={{ textTransform: "capitalize" }}>
              {post.description.subject}
            </p>

            <div className={`flex ${city && state ? "items-center" : "items-end"} justify-between`}>
              {city && state &&
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{city}, {state}</span>
                </div>
              }

              <NavLink
                to={post._id}
                state={{ authorName }}
                className="text-orange-500 hover:text-orange-400 text-sm font-medium cursor-pointer"
              >
                View details
              </NavLink>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700/40 flex items-center justify-between text-xs text-gray-400">
              {isOnline ? <span>{commentCount} {commentCount === 1 ? "transcription" : "transcriptions"}</span> : <span>{Math.floor(Math.random() * 50) + 1} transcriptions</span>}
              <span>Posted {postedTimeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-styling bg-primary-text rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">

      <div className="relative">
        <Badge color="error" badgeContent={`${post?.images.image.length < 10 ? post?.images.image.length || 0 : `9+`}` + `${post.images.image.length === 1 ? " Image" : " Images"}`} className="p-2" style={{ width: "100%", position: "absolute", right: "10%", top: "8%" }} />
        {!loading ? <AppImage
          src={post.images.image[0]}
          alt={post.description.title}
          className="w-full h-48 sm:h-56 object-cover"
        /> : <div className="w-full h-48 sm:h-56 object-cover"
        >
          <CircularProgress className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" color="white" />
        </div>}
        {/* <div className="absolute top-3 right-3 text-white text-sm bg-black bg-opacity-60 px-2 py-1 rounded">
          {post.distance} miles
        </div> */}
        <div className="absolute bottom-0 left-0 right-0" style={{ minHeight: "80px", background: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.2) 80%, rgba(0, 0, 0, 0) 100%)" }}>
          {
            (<div className="bg-primary-background bg-opacity-80 rounded-lg p-3 flex items-center justify-between m-3 ">
              <div className="flex flex-col">
                <span className="text-white font-semibold text-lg capitalize  lg:max-w-[19vw] truncate" >{post.description.title ? post.description.title : "Untitled"}</span>
                <span className="text-white font-semibold text-xs capitalize lg:max-w-[19vw] truncate" >Posted by: {authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                {post.rating > 0 ? (
                  <div className="flex items-center space-x-1">
                    <Star fill="currentColor" className="w-4 h-4 text-yellow-400" />
                    <div className="text-white">{post.rating.toFixed(1)}</div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <div className="text-white">N/A</div>
                  </div>
                )}
              </div>
            </div>)
          }
        </div>
      </div>

      <div className="p-4">
        <p className="text-secondary-dark text-sm mb-3 line-clamp-3 capitalize">
          {post.description.subject ? post.description.subject : "No description available."}
        </p>


        <div className="flex items-center justify-between capitalize">
          <div className="flex items-center gap-2 text-secondary-dark text-sm">
            <MapPin className="w-4 h-4" />
            <span>{city}, {state}</span>
          </div>
          {/* <button
            onClick={() => setIsLiked(!isLiked)
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${isLiked ? 'text-red-400 bg-red-900' : 'text-gray-400 bg-white border-1'
              } hover:text-red-400 hover:bg-red-900 transition-colors`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className={isLiked ? `text-white` : `text-black`}>
              {post.description.upvote}
            </span>
          </button> */}

          <NavLink
            to={post._id}
            state={{ authorName }}
            className=" text-orange-500 hover:text-orange-400 text-sm font-medium cursor-pointer"
          >
            View details
          </NavLink>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-secondary-dark/70">
          {isOnline ? <span>{commentCount} {commentCount === 1 ? "transcription" : "transcriptions"}</span> : <span>{Math.floor(Math.random() * 50) + 1} transcriptions</span>}
          <span>Posted {postedTimeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryCard;
