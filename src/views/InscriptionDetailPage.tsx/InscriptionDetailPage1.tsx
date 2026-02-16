import React, { useState, useEffect } from 'react';
import { ThumbsUp, MapPin, Calendar, Languages, BookOpen, Plus, MessageSquareWarning, Star } from 'lucide-react';
import CommentCard from './CommentCard';
// import RatingModal from './RatingModal';
import { useParams } from 'react-router-dom';
// import Model from './Model';
import Modal from './Modal';
// import ImageCarousel from './ImageCarousel';
// import { FaSpinner } from 'react-icons/fa';
// import placeholderImage1 from '@/assets/placeholder.svg';
// import placeholderImage2 from '@/assets/parallaxImages/banner2.jpg';
// import placeholderImage3 from '@/assets/parallaxImages/banner3.jpg';
// import placeholderImage4 from '@/assets/parallaxImages/banner4.png';
import ImageCarousel1 from './ImageCarousel1';
import { Snackbar, Alert, Slide, Tooltip } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RatingModal1 from './RatingModal1';
import cdacRoundLogo from '@/assets/cdacroundlogo.png';
import type { User } from '@/types';
import ShareModal from '@/components/ShareModal/ShareModal';
import { coreBackendClient } from '@/utils/http/clients/coreBackend.client';
import { dummyPost, dummyComments } from './dummyData';

const USE_FALLBACK = false;

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

// const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

// Main Inscription Details Component
const InscriptionDetailsPage: React.FC = () => {
    // Mock data based on your structure


    const [post, setPost] = useState(null as Post | null);
    const [comments, setComments] = useState([] as Comment[]);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    // const [isBookmarked, setIsBookmarked] = useState(false);
    const [display, setDisplay] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [userDetails, setUserDetails] = useState(undefined as User | undefined);
    const [description, setDescription] = useState<string>(""); // populate from fetch/original data

    const handleOpen = () => setDisplay(true);
    const handleClose = () => setDisplay(false);


    // inside your component
    const { id: postId } = useParams<{ id: string }>();

    useEffect(() => {
        setLoading(true);
        if (USE_FALLBACK) {
            // 🔹 hard stop: no backend calls
            setUserDetails({
                _id: "dummy-user",
                name: "John Doe",
            } as User);

            setPost(dummyPost);
            setComments(dummyComments);
            setLoading(false);
            return;
        }

        // ===== REAL API LOGIC BELOW =====

        const fetchUserDetails = async () => {
            try {
                const response = await coreBackendClient.post("post/userProfile");
                const { data } = response.data;
                console.log("Fetched user details:", data);
                setUserDetails(data);
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        };

        const fetchPostDetails = async () => {
            if (!postId) {
                console.error("No postId found in route params");
                setPost(null);
                setLoading(false);
                return;
            }

            try {
                const response = await coreBackendClient.post(`post/getAllPost`);

                const { data } = response.data;
                const allPosts = Array.isArray(data) ? data : [];
                const matchedPost =
                    allPosts.find((p: Post) => String(p._id) === String(postId)) || null;

                console.log(matchedPost);
                setPost(matchedPost);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
            }
        };

        const fetchComments = async () => {
            if (!postId) {
                console.error("No postId found in route params");
                setComments([]);
                return;
            }
            try {
                
                const urlencoded = new URLSearchParams();
                urlencoded.append("postId", postId);

                const response = await coreBackendClient.post(`post/getPostDiscription`, urlencoded);

                const { data } = response.data;
                const fetchedComments = Array.isArray(data) ? data : [];
                setComments(fetchedComments);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetails();
        fetchComments();
        fetchPostDetails();
    }, [postId]);

    const submitRatingToAPI = async (postId: string, rating: number): Promise<string> => {

        const urlencoded = new URLSearchParams();
        urlencoded.append("postId", postId);
        urlencoded.append("rating", rating.toString());
        const response = await coreBackendClient.post(`post/addRating`, urlencoded);
        const { data } = response.data;
        if (!data.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const result = await data.message; // or response.json() if backend returns JSON
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

    const handleClick = (lat: number, lon: number) => {
        const url = `https://www.google.com/maps?q=${lat},${lon}`;
        window.open(url, '_blank');
    };



    // Ensure dummy data is rendered when loading is false
    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-background flex items-center justify-center">
                <div className='flex flex-col items-center'>
                    {/* <FaSpinner className="animate-spin text-4xl text-[#66B0FF]" /> */}
                    <img src={cdacRoundLogo} className="mr-3 mb-4 size-20 cdacSpinner" />
                    <div className="text-[#000000] text-lg">Loading inscription details...</div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-secondary-background flex items-center justify-center">
                <div className="text-white text-lg">Inscription not found</div>
            </div>
        );
    }

    const handleDescriptionAdded = (newDesc: string) => {
        // replace or append depending on desired UX:
        // setDescription(prev => prev ? `${prev}\n${newDesc}` : newDesc);
        setDescription(newDesc);
    };


    // Render dummy data if post and comments are unavailable
    // const postToRender = post || dummyPost;
    // const commentsToRender = comments.length > 0 ? comments : dummyComments;

    // Log commentsToRender to verify its contents
    // console.log('commentsToRender:', commentsToRender);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handlePostSuccess = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    const handlePostError = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    };

    // Add snackbar callbacks to handle rating submission success and failure
    const handleRatingSuccess = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    const handleRatingError = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    };
    const postToRender = post ?? dummyPost;
    // const commentsToRender = comments.length > 0 ? comments : dummyComments;

    return (
        <div className="min-h-screen bg-primary-background">
            <Modal
                postId={postId as string}
                display={display}
                onClose={handleClose}
                onPostSuccess={handlePostSuccess}
                onPostError={handlePostError}
                onDescriptionAdded={handleDescriptionAdded}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                TransitionComponent={Slide}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <div className="max-w-7xl mx-auto p-1 flex justify-between gap-30 sm:p-4 flex-col md:flex-row sm:justify-center sm:gap-10">
                {/* 
                <ImageCarousel
                    images={[placeholderImage1, placeholderImage2, placeholderImage3, placeholderImage4]}
                /> */}
                <div className="w-full md:w-3/5 lg:w-3/5 ">

                    {/* <ImageCarousel1
                        images={Array.isArray(post.images.image) ? post.images.image : [placeholderImage1]}
                    /> */}
                    <ImageCarousel1
                        images={Array.isArray(postToRender.images.image)
                            ? postToRender.images.image
                            : []}
                    />
                    <div className='card-styling py-4 px-5'>

                        <div className='flex justify-between items-start post-rating-like-share'>

                            <div className="">
                                <span className="text-[#000] text-2xl md:text-3xl font-bold">
                                    {postToRender.description.title || 'Untitled Inscription'}
                                    {/* {post.description.title || 'Untitled Inscription'} */}
                                </span>
                                <div className="flex items-center gap-2 text-[#000000] ">
                                    <MapPin className="w-5 h-5 text-[#000000]" />
                                    <span>{postToRender.description.geolocation && postToRender.description.geolocation.city}, {postToRender.description.geolocation && postToRender.description.geolocation.state || 'Location unavailable'}</span>
                                    {/* <span>{post.description.geolocation && post.description.geolocation.city}, {post.description.geolocation && post.description.geolocation.state || 'Location unavailable'}</span> */}
                                </div>
                            </div>

                            {/* Rating and Actions */}
                            <div className="flex sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Tooltip title="Average rating by users" className='cursor-pointer'>
                                        <span className="inline-flex items-center gap-x-1.5 px-3 py-2 rounded-lg font-medium bg-teal-500 hover:bg-teal-300 border-1 border-teal-600 text-white">
                                            <Star />{postToRender.rating ? Number(postToRender.rating).toFixed(1) : 0}
                                        </span>
                                    </Tooltip>

                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRatingModal(true)}
                                        className="md:px-6 md:py-2 px-3 py-1 cursor-pointer bg-orange-500 border-1 border-orange-800 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                    >
                                        Rate
                                    </button>
                                    {/* <button
                                        onClick={() => setIsBookmarked(!isBookmarked)}
                                        className={`px-4 py-2 rounded-lg cursor-pointer border-1 border-solid border-gray-600 transition-colors ${isBookmarked ? 'bg-red-500 text-white border-pink-600 border-solid border-1' : 'bg-white text-black-100 hover:bg-red-400 hover:text-white '
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                                    </button> */}
                                    {postToRender.description.geolocation?.lat !== undefined &&
                                        postToRender.description.geolocation?.lon !== undefined && (
                                            <Tooltip title="Locate on Google Maps">
                                                <button
                                                    onClick={() => handleClick(
                                                        postToRender.description.geolocation!.lat!,
                                                        postToRender.description.geolocation!.lon
                                                    )}
                                                    className="md:px-6 md:py-2 px-3 py-1 bg-white border-1 border-gray-400 text-white rounded-lg hover:bg-gray-200 cursor-pointer transition-colors font-medium"
                                                >
                                                    <LocationOnIcon className='w-5 h-5 text-red-500' />
                                                </button>
                                            </Tooltip>

                                        )}
                                    {/* {post.description.geolocation?.lat !== undefined &&
                                        post.description.geolocation?.lon !== undefined && (
                                            <button
                                                onClick={() => handleClick(
                                                    post.description.geolocation!.lat!,
                                                    post.description.geolocation!.lon
                                                )}
                                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                            >
                                                <MapPin className='w-5 h-5' />
                                            </button>
                                        )} */}
                                    <ShareModal />

                                    {/* <button className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button> */}
                                </div>
                            </div>
                        </div>
                        {/* Description Section */}
                        <div className="mb-8">
                            <h3 className="text-[#000] text-xl font-bold mb-4">User Descriptions</h3>

                            {/* Main Description */}
                            <div className="bg-secondary-background rounded-lg mb-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className='flex justify-between items-start'>

                                            <div className="flex mb-2 items-center">
                                                <h4 className=" font-semibold text-lg">{postToRender.user_name}</h4>
                                                {/* <h4 className=" font-semibold text-lg">{post.user_name}</h4> */}
                                                <span className="text-[#000000] ms-2">User rating: ({postToRender.userrating?.length})</span>
                                                {/* <span className="text-[#000000] ms-2">User rating: ({post.userrating?.length})</span> */}
                                            </div>
                                            <div className="ml-4 flex items-center gap-1 text-blue-400">
                                                <ThumbsUp className="w-4 h-4 fill-current" />
                                                <span className="font-medium">{postToRender.description.upvote || 0}</span>
                                                {/* <span className="font-medium">{post.description.upvote || 0}</span> */}
                                            </div>
                                        </div>


                                        <p className=" text-base leading-relaxed mb-4">
                                            {postToRender.description.description || 'No description provided.'}
                                            {/* {post.description.description || 'No description provided.'} */}
                                        </p>

                                        {/* Metadata */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                <Languages className="w-4 h-4" />
                                                {postToRender.description.scriptLanguage && Array.isArray(postToRender.description.scriptLanguage) ? (
                                                    (() => {
                                                        const joined = postToRender.description.scriptLanguage.join(', ');
                                                        return joined.length < 20 ? (
                                                            <span>Script: {joined.charAt(0).toUpperCase() + joined.slice(1)}</span>
                                                        ) : (
                                                            <Tooltip title={joined.charAt(0).toUpperCase() + joined.slice(1)} placement="top">
                                                                <span>Script: {joined.charAt(0).toUpperCase() + joined.slice(1, 17) + '...'}</span>
                                                            </Tooltip>
                                                        );
                                                    })()
                                                ) : (
                                                    <span>Script: N/A</span>
                                                )}
                                                {/* <span>Script: {post.description.scriptLanguage && post.description.scriptLanguage}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                <BookOpen className="w-4 h-4" />
                                                {postToRender.description.language && Array.isArray(postToRender.description.language) ? (
                                                    (() => {
                                                        const joined = postToRender.description.language.join(', ');
                                                        return joined.length < 20 ? (
                                                            <span>Language: {joined.charAt(0).toUpperCase() + joined.slice(1)}</span>
                                                        ) : (
                                                            <Tooltip title={joined.charAt(0).toUpperCase() + joined.slice(1)} placement="top">
                                                                <span>Language: {joined.charAt(0).toUpperCase() + joined.slice(1, 17) + '...'}</span>
                                                            </Tooltip>
                                                        );
                                                    })()
                                                ) : (
                                                    <span>Language: N/A</span>
                                                )}
                                                {/* <span>Language: {post.description.language && post.description.language.join(', ')}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                {/* <span>Type: {postToRender.type ? postToRender.type.length < 20 ? postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1) : postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1, 17) + "..." : "N/A"}</span> */}
                                                {/* <span>Type: {post.type && post.type}</span> */}
                                                <div className="flex items-center gap-2 cursor-pointer">
                                                    <Calendar className="w-4 h-4" />
                                                    {postToRender.type ? (
                                                        postToRender.type.length < 20 ? (
                                                            <span>
                                                                Type: {postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1)}
                                                            </span>
                                                        ) : (
                                                            <Tooltip title={postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1)} placement="bottom">
                                                                <span>
                                                                    Type: {postToRender.type.charAt(0).toUpperCase() + postToRender.type.slice(1, 17) + "..."}
                                                                </span>
                                                            </Tooltip>
                                                        )
                                                    ) : (
                                                        <span>Type: N/A</span>
                                                    )}
                                                    {/* <span>Topic: {post.topic && post.topic}</span> */}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                <MessageSquareWarning className="w-4 h-4" />
                                                {postToRender.topic ? (
                                                    postToRender.topic.length < 20 ? (
                                                        <span>
                                                            Topic: {postToRender.topic.charAt(0).toUpperCase() + postToRender.topic.slice(1)}
                                                        </span>
                                                    ) : (
                                                        <Tooltip title={postToRender.topic.charAt(0).toUpperCase() + postToRender.topic.slice(1)} placement="bottom">
                                                            <span>
                                                                Topic: {postToRender.topic.charAt(0).toUpperCase() + postToRender.topic.slice(1, 17) + "..."}
                                                            </span>
                                                        </Tooltip>
                                                    )
                                                ) : (
                                                    <span>Topic: N/A</span>
                                                )}
                                                {/* <span>Topic: {post.topic && post.topic}</span> */}
                                            </div>
                                        </div>

                                        {/* Translation */}
                                        {/* {post.description.englishTranslation && ( */}
                                        <div className="mt-4 p-3 bg-white border-1 border-solid border-yellow-400 rounded-lg">
                                            <h5 className="text-orange-400 font-medium mb-2">English Translation:</h5>
                                            <p className="text-black italic">"{postToRender.description.englishTranslation || "this is a transation"}"</p>
                                            {/* <p className="text-black italic">"{post.description.englishTranslation || "this is a transation"}"</p> */}
                                        </div>
                                        {/* )} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Title and Location */}
                </div>
                {/* <ImageCarousel
                    images={Array.isArray(post.images.image) ? post.images.image : placeholderImageArray}
                /> */}
                {/* <img src={placeholderImage} /> */}


                {/* Comments Section */}
                <div className='card-styling p-4'>

                    <div className="w-full flex justify-between gap-4">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-6 pt-2">Top Comments</h3>
                        </div>
                        {/* Add Description Button */}
                        <div className="">
                            <button
                                onClick={handleOpen}
                                className="w-full text-sm px-2 sm:w-auto py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span className='pe-2'>
                                    Add Your Description
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="w-auto overflow-y-auto max-h-[380px] md:max-h-[960px] pr-2">
                        {/* {comments.map((comment: Comment) => (
                            <CommentCard key={comment.id ?? comment._id} comments={comment} currentUser={userDetails} />
                        ))} */}
                        {comments.map((comment: Comment) => (
                            <CommentCard
                                key={comment.id ?? comment._id}
                                comments={comment}
                                currentUser={userDetails}
                            />
                        ))}

                        <div className="text-sm text-center text-gray-500">No more comments</div>
                    </div>

                </div>
            </div>

            {/* Rating Modal */}
            {/* <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                currentRating={userRating}
                onSubmitRating={handleRating}
                postId={postId as string}
            /> */}
            <RatingModal1
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                currentRating={userRating}
                onSubmitRating={handleRating}
                onRatingSubmitted={(success, message) => {
                    if (success) {
                        handleRatingSuccess("Rating submitted successfully!");
                    } else {
                        handleRatingError(message || "Failed to submit rating.");
                    }
                }}
                postId={postId as string}
            />
        </div>
    );
};

// Demo wrapper component to show how to use it
export default InscriptionDetailsPage;
