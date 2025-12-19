
import type React from "react";
import { useState } from "react";
import StarRating from "./StarRating";
import { Heart, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { Post } from "./Feed";

interface DiscoveryCardProps {
  post: Post;
  layout?: string;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ post, layout = "grid" }) => {
  const [isLiked, setIsLiked] = useState(false);

  const city = post?.description?.geolocation?.city ?? "Unknown";
  const state = post?.description?.geolocation?.state ?? "Unknown";

  if (layout === "list") {
    return (
      <div className="bg-secondary-background rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
        <div className="flex " >
          <div className="w-32 h-24 sm:w-48 sm:h-32 flex-shrink-0 relative">
            <img
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

            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {post.description.subject}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{city}, {state}</span>
              </div>

              <NavLink to={post._id} className="text-orange-500 hover:text-orange-400 text-sm font-medium cursor-pointer">
                View details
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-styling bg-primary-text rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
      <div className="relative">
        <img
          src={post.images.image[0]}
          alt={post.description.title}
          className="w-full h-48 sm:h-56 object-cover"
        />
        {/* <div className="absolute top-3 right-3 text-white text-sm bg-black bg-opacity-60 px-2 py-1 rounded">
          {post.distance} miles
        </div> */}
        <div className="absolute bottom-0 left-0 right-0" style={{ minHeight: "80px", background: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.2) 80%, rgba(0, 0, 0, 0) 100%)" }}>
          {
            post.rating == 0 && post.description.title == null ? null :
              (<div className="bg-primary-background bg-opacity-80 rounded-lg p-3 flex items-center justify-between m-3 ">
                <span className="text-white font-semibold text-lg " >{post.description.title}</span>
                {
                  post.rating != 0 && (
                    <div className="flex items-center gap-2">
                      {post.rating && <StarRating rating={post.rating} />}
                    </div>
                  )
                }
              </div>)
          }
        </div>
      </div>

      <div className="p-4">
        <p className="text-secondary-dark text-sm mb-3 line-clamp-3">
          {post.description.subject ? post.description.subject : "No description available."}
        </p>


        <div className="flex items-center justify-between">
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

          <NavLink to={post._id} className="text-orange-500 hover:text-orange-400 text-sm font-medium cursor-pointer">
            View details
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryCard;