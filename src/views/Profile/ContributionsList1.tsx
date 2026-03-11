import { ThumbsUp } from "lucide-react";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

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

const POSTS_PER_PAGE = 3;

const ContributionsList: React.FC<ContributionsListProps> = ({ comments }) => {

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(comments.length / POSTS_PER_PAGE);

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;

    const displayPosts = comments.slice(startIndex, endIndex);


    const formatDate = (date: any) => {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return "Invalid date";

        const now = new Date();
        const diffDays = Math.ceil(
            Math.abs(now.getTime() - parsedDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;

        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        }

        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? "s" : ""} ago`;
    };


    return (

        <div className="mb-6 mt-2 p-4">

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

                {displayPosts.map(post => (

                    <NavLink
                        key={post._id}
                        to={`https://inscriptions.cdacb.in/feed/${post.postId}`}
                        className="h-full"
                    >

                        <div className="card-styling rounded-lg p-4 h-full min-h-[120px] flex flex-col">

                            <div className="flex gap-4 flex-1">

                                <img
                                    src={post.postImageUrl || ""}
                                    alt={post.description}
                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />

                                <p className="text-black text-sm break-words">
                                    {post.description}
                                </p>

                            </div>


                            <div className="flex items-center justify-between mt-auto pt-3 text-xs text-gray-500">

                                <div className="flex items-center gap-1 text-orange-500">
                                    <ThumbsUp className="w-4 h-4 fill-current" />
                                    {post.upvote} {post.upvote === 1 ? "Upvote" : "Upvotes"}
                                </div>


                                <span>
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
                                    }
                                    {" • "}
                                    {formatDate(post.createdAt)}
                                </span>

                            </div>

                        </div>

                    </NavLink>

                ))}

            </div>



            {/* Pagination Controls */}

            <div className="flex justify-center items-center gap-2 mt-8">

                {/* Prev */}
                <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="cursor-pointer px-4 py-1 rounded-md border border-orange-500 text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Prev
                </button>


                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => {

                    const page = index + 1;

                    return (

                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 cursor-pointer py-1 rounded-md border
                                ${currentPage === page
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-orange-500 text-orange-500'
                                }
                            `}
                        >
                            {page}
                        </button>

                    );

                })}


                {/* Next */}
                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer px-4 py-1 rounded-md border border-orange-500 text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next
                </button>

            </div>

        </div>

    );

};

export default ContributionsList;