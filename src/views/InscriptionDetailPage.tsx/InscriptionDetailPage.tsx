import React, { useState, useEffect } from 'react';
import { ThumbsUp, MapPin, Calendar, Languages, BookOpen, Share2, Heart, Plus } from 'lucide-react';
import StarRating from './StarRating';
import CommentCard from './CommentCard';
import RatingModal from './RatingModal';
import { useParams } from 'react-router-dom';
import Model from './Model';
import ImageCarousel from './ImageCarousel';
import { coreBackendClient } from '@/utils/http/clients/coreBackend.client';

export interface Comment {
    id?: string;
    _id: string;
    postId: string;
    userId: string;
    username: string;
    userImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    upvote: number;
    userVote: string[];
}

interface UserRating {
  userId: string;
  rating: number;
}

interface Post {
    _id: string;
    user_id: string;
    user_name: string;
    createdAt: Date;
    images: {
        thumbnailImage: string[];
        image: string[];
    };
    description: {
        title: string;
        description: string;
        scriptLanguage: string[];
        language: string[];
        englishTranslation: string;
        upvote: number;
        geolocation?: {
            lon: number;
            lat?: number;
            state?: string;
            city?: string;
            region?: string;
        };
        createdAt: Date;
        updatedAt: Date;
    };
    userrating?: UserRating[];
    topic: string;
    script: string[];
    type: string;
    rating: number;
}
// Main Inscription Details Component
const InscriptionDetailsPage: React.FC = () => {
    // Mock data based on your structure


  const [post, setPost] = useState(null as Post | null);
  const [comments, setComments] = useState([] as Comment[]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [display, setDisplay] = useState(false);

  const handleOpen = () => setDisplay(true);
  const handleClose = () => setDisplay(false);

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }
   

// inside your component
const { id: postId } = useParams<{ id: string }>();

useEffect(() => {
  const fetchPostDetails = async () => {
    if (!postId) {
      console.error("No postId found in route params");
      setPost(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getCookie('token');
      const response = await coreBackendClient.post('post/getAllPost');

      const { data } = response;
      const allPosts = Array.isArray(data.data) ? data.data : [];
      const matchedPost =
        allPosts.find((p: Post) => String(p._id) === String(postId)) || null;

      // console.log("Route param postId:", postId);
      // console.log("Available IDs:", allPosts.map((p: Post) => p._id));
      // console.log("Matched Post:", matchedPost);
      console.log(matchedPost);
      setPost(matchedPost);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchComments = async () => {
    if (!postId) {
      console.error("No postId found in route params");
      setComments([]);
      return;
    }
    try {
      setLoading(true);
      const token = getCookie('token');
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const urlencoded = new URLSearchParams();
      urlencoded.append("postId", postId);

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };

      const response = await coreBackendClient.post("post/getPostDiscription")

      const { data } = response;
      const fetchedComments = Array.isArray(data.data) ? data.data : [];
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchComments();
  fetchPostDetails();
}, [postId]); // ✅ now it listens to route changes


// Add this function inside your component
const submitRatingToAPI = async (postId: string, rating: number): Promise<string> => {
  const myHeaders = new Headers();
  const token = getCookie('token');
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", `Bearer ${token}`);
  const urlencoded = new URLSearchParams();
  urlencoded.append("postId", postId);
  urlencoded.append("rating", rating.toString());
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };
  const response = await coreBackendClient.post("post/addRating");
  if (!response.status || response.status !== 200) {
    throw new Error(`Error: ${response.statusText}`);
  }
  const result = await response.data.text();
  return result;
};

const handleRating = async (newRating: number) => {
  setUserRating(newRating);
  try {
    await submitRatingToAPI(postId as string, newRating);
    // Update post.rating in state so UI updates
    setPost(prev => prev ? { ...prev, rating: newRating } : prev);
  } catch (error) {
    console.error('Failed to submit rating:', error);
    // Optionally show error to user
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-background flex items-center justify-center">
        <div className="text-[#000000] text-lg">Loading inscription details...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-secondary-background flex items-center justify-center">
        <div className="text-[#000000] text-lg">Inscription not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-background">
      <Model postId={postId as string} display={display} onClose={handleClose} />
      <div className="max-w-4xl mx-auto p-4">
        <ImageCarousel
          images={Array.isArray(post.images.image) ? post.images.image : []}
        />

        {/* Title and Location */}
        <div className="mb-6">
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
            {post.description.title || 'Untitled Inscription'}
          </h2>
          <div className="flex items-center gap-2 text-gray-300 mb-4">
            <MapPin className="w-5 h-5" />
            <span>{post.description.geolocation && post.description.geolocation.city}, {post.description.geolocation && post.description.geolocation.state || ''}</span>
          </div>
        </div>

        {/* Rating and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {post.rating && <StarRating rating={post.rating} />}
            <span className="text-gray-300">({post.userrating?.length})</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Rate
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isBookmarked ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-bold mb-4">User Descriptions</h3>
          
          {/* Main Description */}
          <div className="bg-secondary-background rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-yellow-400 font-semibold text-lg mb-2">{post.user_name}</h4>
                <p className="text-gray-300 text-base leading-relaxed mb-4">
                  {post.description.description || 'No description provided.'}
                </p>
                
                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Languages className="w-4 h-4" />
                    <span>Script: {post.description.scriptLanguage && post.description.scriptLanguage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>Language: {post.description.language && post.description.language.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Type: {post.type && post.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>Topic: {post.topic && post.type}</span>
                  </div>
                </div>

                {/* Translation */}
                {/* {post.description.englishTranslation && ( */}
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                    <h5 className="text-orange-400 font-medium mb-2">English Translation:</h5>
                    <p className="text-gray-300 italic">"{post.description.englishTranslation || "this is a transation"}"</p>
                  </div>
                {/* )} */}
              </div>
              <div className="ml-4 flex items-center gap-1 text-blue-400">
                <ThumbsUp className="w-4 h-4 fill-current" />
                <span className="font-medium">{post.description.upvote || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-bold mb-6">Top Comments</h3>
          <div className="space-y-6">
            {comments.map((comment: Comment) => (
              <CommentCard comments={comment} />
            ))}
          </div>
        </div>
        


        {/* Add Description Button */}
        <div className="text-center">
          <button
            onClick={handleOpen}
            className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Your Description
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        currentRating={userRating}
        onSubmitRating={handleRating}
        postId={postId as string}
      />
    </div>
  );
};

// Demo wrapper component to show how to use it
export default InscriptionDetailsPage;