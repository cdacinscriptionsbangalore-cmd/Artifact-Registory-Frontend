import React, { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import type { Post } from "@/types";
import { NavLink } from "react-router-dom";
import AppImage from "@/components/AppImage";

interface ImageGalleryProps {
  posts: Post[];
}

const POSTS_PER_PAGE = 6;

const ImageGallery: React.FC<ImageGalleryProps> = ({ posts }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const displayPosts = posts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  return (
    <div className="mb-6 mt-2 p-4" >

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayPosts.map((post) => {
          console.log(post);
          return (
            <NavLink to={`https://inscriptions.cdacb.in/feed/${post._id}`} key={post._id} className="cursor-pointer border-1 border-gray-300 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
              <div key={post._id} className="relative group cursor-pointer">
                <div className="aspect-square bg-secondary-background rounded-lg overflow-hidden">
                  <AppImage
                    src={post.images.image[0]}
                    alt={post.description.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {`${post.rating ? post.rating.toFixed(1) : "N/A"}`}
                </div>
              </div>
            </NavLink>
          )
        })}
      </div>
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage((previous) => previous - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer px-4 py-1 rounded-md border border-orange-500 text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 cursor-pointer py-1 rounded-md border ${currentPage === page
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-orange-500 text-orange-500"
                }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage((previous) => previous + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer px-4 py-1 rounded-md border border-orange-500 text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ImageGallery;
