import { Heart, ThumbsUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  username: string;
  userImageUrl?: string;
  postImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  upvote: number;
  userVote: string[];
}

interface ContributionsListProps {
  comments: Comment[];
}

const ContributionsList: React.FC<ContributionsListProps> = ({ comments }) => {
  const [viewAll, setViewAll] = useState(false);
  const [layout, setLayout] = useState('grid');

  const displayPosts = viewAll ? comments : comments.slice(0, 3);

  useEffect(() => {
    const handleResize = () => {
      setLayout(window.innerWidth < 768 ? 'list' : 'grid');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    // console.log("displayPosts: ", displayPosts);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (date: any) => {
    const parsedDate = new Date(date); // ✅ handles ISO strings
    if (isNaN(parsedDate.getTime())) return "Invalid date";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - parsedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  };


  if (layout === 'list') {
    return (
      <Link to="/profile/contributions">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setViewAll(!viewAll)}
            className="text-orange-500 cursor-pointer hover:text-orange-400 text-sm font-medium outline-none focus:outline-none cursor-pointer"
          >
            {viewAll ? 'View Less' : 'View All'}
          </button>
        </div>
        <div className="space-y-4">
          {displayPosts.map((post) => (
            <NavLink to={`/feed/${post.postId}`} key={post._id} className="cursor-pointer">
              <div className="bg-secondary-background rounded-lg p-4">
                <div className="flex gap-4">
                  <img
                    // src={post.postImageUrl || '/default-profile.png'} 
                    src={post.postImageUrl || ''}
                    // src={post.userImageUrl || '/default-profile.png'} 
                    alt={post.description}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-black font-medium text-sm leading-tight">{post.title}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs ml-2">
                        <Heart className="w-3 h-3 fill-current" />
                        {post.upvote}
                      </div>
                    </div>

                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {post.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-orange-400">{post.description}</span>
                      <span className="text-gray-500">•</span>
                      {/* <span className="text-gray-500">{post.script && post.script.join(', ')}</span> */}
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </Link>
    );
  }

  return (
    <div className="mb-6 mt-2 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" >
        {displayPosts.length !== 0 && displayPosts.map((post) => (
          <NavLink to={`/feed/${post.postId}`} key={post._id} className="cursor-pointer" >
            <div className="card-styling rounded-lg p-4" >
              <div className="flex justify-between space-x-3 " >
                <div className="">
                  <img
                    // src={post.postImageUrl || '/default-profile.png'} 
                    src={post.postImageUrl || ''}
                    // src={post.userImageUrl || '/default-profile.png'} 
                    alt={post.description}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                </div>
                <div className="flex-1 min-w-0 relative">
                  <div>
                    <h3 className="text-black font-medium">{post.description.title}</h3>
                    <div className="mt-3 text-sm">
                      {post.description}
                    </div>

                  </div>
                  <div className="text-black text-sm mb-3 line-clamp-3 mb-4 pb-4">

                    <div className="text-gray-500 text-xs absolute right-3 top-14 flex justify-around items-center gap-4">
                      <div className="flex items-center gap-1 text-orange-500">
                        <ThumbsUp className={`w-4 h-4 fill-current`} />
                        {post.upvote} {post.upvote !== 1 ? "Upvotes" : "Upvote"}
                      </div>

                      {/* Added {post.description.subject || "No Subject"} • {formatDate(post.createdAt)} */}
                      <span className="text-gray-500 text-xs">
                        Added on &nbsp;
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                          .format(new Date(post.createdAt))
                          .replace(",", "")
                        } • {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>



              <div className="flex flex-wrap gap-2 text-xs">
                {/* <span className="bg-gray-700 text-orange-400 px-2 py-1 rounded">{post.topic}</span>
              <span className="bg-gray-700 text-blue-400 px-2 py-1 rounded">{post.script.join(', ')}</span> */}
              </div>
            </div>
          </NavLink>
        ))}
      </div>
      <div className="flex justify-center items-center mt-7">
        {/* <h4 className="text-xl font-bold text-black">My Comments</h4> */}
        <button
          onClick={() => setViewAll(!viewAll)}
          className="text-orange-500 cursor-pointer hover:text-orange-400 text-sm font-medium"
        >
          {viewAll ? 'View Less' : 'View All'}
        </button>
      </div>

    </div>
  );
};

export default ContributionsList;