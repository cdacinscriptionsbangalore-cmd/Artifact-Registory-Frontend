import React, { useState, useEffect } from 'react';
import { ThumbsUp, MapPin, Calendar, Languages, BookOpen, Share2, Heart, Plus, MessageSquareWarning, Star } from 'lucide-react';
import StarRating from './StarRating';
import CommentCard from './CommentCard';
// import RatingModal from './RatingModal';
import { useParams } from 'react-router-dom';
// import Model from './Model';
import Modal from './Modal';
// import ImageCarousel from './ImageCarousel';
// import { FaSpinner } from 'react-icons/fa';
import placeholderImage1 from '@/assets/placeholder.svg';
import placeholderImage2 from '@/assets/parallaxImages/banner2.jpg';
import placeholderImage3 from '@/assets/parallaxImages/banner3.jpg';
import placeholderImage4 from '@/assets/parallaxImages/banner4.png';
import ImageCarousel1 from './ImageCarousel1';
import { Snackbar, Alert, Slide, Tooltip } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RatingModal1 from './RatingModal1';
import cdacRoundLogo from '@/assets/cdacroundlogo.png';
import type { User } from '@/types';
import ShareModal from '@/components/ShareModal/ShareModal';

const USE_FALLBACK = true;

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

// Add fallback dummy data for styling purposes
const dummyPost: Post = {
    _id: "dummy-id",
    user_id: "dummy-user",
    user_name: "John Doe",
    createdAt: new Date(),
    images: {
        thumbnailImage: [placeholderImage1],
        image: [placeholderImage1],
    },
    description: {
        title: "Dummy Inscription Title",
        description: "This is a dummy description for styling purposes.",
        scriptLanguage: ["Dummy Script"],
        language: ["Dummy Language"],
        englishTranslation: "This is a dummy translation.",
        upvote: 0,
        geolocation: {
            lon: 0,
            lat: 0,
            state: "Dummy State",
            city: "Dummy City",
            region: "Dummy Region",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    userrating: [],
    topic: "Dummy Topic",
    script: ["Dummy Script"],
    type: "Dummy Type",
    rating: 3.3,
};

// Add fallback dummy comments for styling purposes
const dummyComments: Comment[] = [
    {
        _id: "dummy-comment-1",
        postId: "dummy-id",
        userId: "dummy-user-1",
        username: "Jane Doe",
        userImageUrl: placeholderImage1,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "This is a dummy comment for styling purposes.",
        upvote: 5,
        userVote: [],
    },
    {
        _id: "dummy-comment-2",
        postId: "dummy-id",
        userId: "dummy-user-2",
        username: "John Smith",
        userImageUrl: placeholderImage2,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Another dummy comment to test the layout.",
        upvote: 3,
        userVote: [],
    },
    {
        _id: "dummy-comment-3",
        postId: "dummy-id",
        userId: "dummy-user-3",
        username: "Alice Johnson",
        userImageUrl: placeholderImage3,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 2,
        userVote: [],
    }
    , {
        _id: "dummy-comment-4",
        postId: "dummy-id",
        userId: "dummy-user-4",
        username: "Bob Brown",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 1,
        userVote: [],
    }, {
        _id: "dummy-comment-5",
        postId: "dummy-id",
        userId: "dummy-user-5",
        username: "Charlie Davis",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    , {
        _id: "dummy-comment-6",
        postId: "dummy-id",
        userId: "dummy-user-6",
        username: "Eve White",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-7",
        postId: "dummy-id",
        userId: "dummy-user-7",
        username: "Frank Green",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-8",
        postId: "dummy-id",
        userId: "dummy-user-8",
        username: "Grace Hopper",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-9",
        postId: "dummy-id",
        userId: "dummy-user-9",
        username: "Manny Quinn",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-10",
        postId: "dummy-id",
        userId: "dummy-user-10",
        username: "Lee Keybumm",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-11",
        postId: "dummy-id",
        userId: "dummy-user-11",
        username: "Hugh Janice",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-12",
        postId: "dummy-id",
        userId: "dummy-user-12",
        username: "Mike Litoris",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-13",
        postId: "dummy-id",
        userId: "dummy-user-13",
        username: "Juggs McBulge",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
    , {
        _id: "dummy-comment-14",
        postId: "dummy-id",
        userId: "dummy-user-14",
        username: "Doctor Acula",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
];

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [userDetails, setUserDetails] = useState(null as User | null);
    const [description, setDescription] = useState<string>(""); // populate from fetch/original data

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

    // useEffect(() => {
    //     const fetchPostDetails = async () => {
    //         if (!postId) {
    //             console.error("No postId found in route params");
    //             setPost(null);
    //             setLoading(false);
    //             return;
    //         }

    //         try {
    //             setLoading(true);
    //             const token = getCookie('token');
    //             const response = await fetch('http://localhost:8080/post/getAllPost', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify({}),
    //             });

    //             const data = await response.json();

    //             const allPosts = Array.isArray(data.data) ? data.data : [];
    //             const matchedPost =
    //                 allPosts.find((p: Post) => String(p._id) === String(postId)) || null;

    //             // console.log("Route param postId:", postId);
    //             // console.log("Available IDs:", allPosts.map((p: Post) => p._id));
    //             // console.log("Matched Post:", matchedPost);
    //             console.log(matchedPost);
    //             setPost(matchedPost);
    //         } catch (error) {
    //             console.error('Failed to fetch posts:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     const fetchComments = async () => {
    //         if (!postId) {
    //             console.error("No postId found in route params");
    //             setComments([]);
    //             return;
    //         }
    //         try {
    //             setLoading(true);
    //             const token = getCookie('token');
    //             const myHeaders = new Headers();
    //             myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    //             myHeaders.append("Authorization", `Bearer ${token}`);

    //             const urlencoded = new URLSearchParams();
    //             urlencoded.append("postId", postId);

    //             const requestOptions: RequestInit = {
    //                 method: "POST",
    //                 headers: myHeaders,
    //                 body: urlencoded,
    //                 redirect: "follow"
    //             };

    //             const response = await fetch("http://localhost:8080/post/getPostDiscription", requestOptions)

    //             const data = await response.json();
    //             const fetchedComments = Array.isArray(data.data) ? data.data : [];
    //             setComments(fetchedComments);
    //         } catch (error) {
    //             console.error('Failed to fetch comments:', error);
    //             setComments(dummyComments);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchComments();
    //     fetchPostDetails();
    // }, [postId]); 

    // Add this function inside your component
    useEffect(() => {
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
                const token = getCookie('token');
                const response = await fetch(`${backendApiUrl}post/userProfile`, {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || ''
                    },
                    body: JSON.stringify({}),
                });
                const data = await response.json();
                setUserDetails(data.data);
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        };

        const fetchPostDetails = async () => {
            if (!postId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const token = getCookie('token');
                const response = await fetch(`${backendApiUrl}post/getAllPost`, {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || ''
                    },
                    body: JSON.stringify({}),
                });

                const data = await response.json();
                const allPosts = Array.isArray(data.data) ? data.data : [];
                setPost(allPosts.find(p => String(p._id) === String(postId)) || null);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            if (!postId) return;

            try {
                const token = getCookie('token');
                const headers = new Headers();
                headers.append("Content-Type", "application/x-www-form-urlencoded");
                headers.append("Authorization", `Bearer ${token}`);
                headers.append("X-XSRF-TOKEN", getCookie('XSRF-TOKEN') || '');

                const body = new URLSearchParams({ postId });

                const response = await fetch(
                    `${backendApiUrl}post/getPostDiscription`,
                    {
                        credentials: 'include',
                        method: "POST",
                        headers,
                        body,
                    }
                );

                const data = await response.json();
                setComments(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Failed to fetch comments:", error);
            }
        };

        fetchUserDetails();
        fetchPostDetails();
        fetchComments();
    }, [postId]);


    // #KEEEP THIS
    // useEffect(() => {


    //     // Add this function to fetch user details
    //     const fetchUserDetails = async () => {
    //         try {
    //             const token = getCookie('token');
    //             const response = await fetch(`${backendApiUrl}post/userProfile`, {
    //                 credentials: 'include',
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`,
    //                     'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '50d7115f-8f84-4e07-a8ae-1a155afe4864'
    //                 },
    //                 body: JSON.stringify({}),
    //             });
    //             const data = await response.json();
    //             setUserDetails(data.data);
    //         } catch (error) {
    //             console.error("Failed to fetch user details:", error);
    //             if (USE_FALLBACK) {
    //                 setUserDetails({
    //                     _id: "dummy-user",
    //                     name: "John Doe",
    //                 } as User);
    //             }
    //         }
    //     };
    //     const fetchPostDetails = async () => {
    //         if (!postId) {
    //             console.error("No postId found in route params");
    //             setPost(null);
    //             setLoading(false);
    //             return;
    //         }

    //         try {
    //             setLoading(true);
    //             const token = getCookie('token');
    //             const response = await fetch(`${backendApiUrl}post/getAllPost`, {
    //                 credentials: 'include',
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`,
    //                     'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '50d7115f-8f84-4e07-a8ae-1a155afe4864'
    //                 },
    //                 body: JSON.stringify({}),
    //             });

    //             const data = await response.json();

    //             const allPosts = Array.isArray(data.data) ? data.data : [];
    //             const matchedPost =
    //                 allPosts.find((p: Post) => String(p._id) === String(postId)) || null;

    //             // console.log("Route param postId:", postId);
    //             // console.log("Available IDs:", allPosts.map((p: Post) => p._id));
    //             // console.log("Matched Post:", matchedPost);
    //             console.log(matchedPost);
    //             setPost(matchedPost);
    //         } catch (error) {
    //             console.error("Failed to fetch posts:", error);
    //             if (USE_FALLBACK) {
    //                 setPost(dummyPost);
    //             }
    //         }
    //     };
    //     const fetchComments = async () => {
    //         if (!postId) {
    //             console.error("No postId found in route params");
    //             setComments([]);
    //             return;
    //         }
    //         try {
    //             setLoading(true);
    //             const token = getCookie('token');
    //             const myHeaders = new Headers();
    //             myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    //             myHeaders.append("Authorization", `Bearer ${token}`);
    //             myHeaders.append("X-XSRF-TOKEN", getCookie('XSRF-TOKEN') || '50d7115f-8f84-4e07-a8ae-1a155afe4864');

    //             const urlencoded = new URLSearchParams();
    //             urlencoded.append("postId", postId);

    //             const requestOptions: RequestInit = {
    //                 credentials: 'include' as RequestCredentials,
    //                 method: "POST",
    //                 headers: myHeaders,
    //                 body: urlencoded,
    //                 redirect: "follow"
    //             };

    //             const response = await fetch(`${backendApiUrl}post/getPostDiscription`, requestOptions)

    //             const data = await response.json();
    //             const fetchedComments = Array.isArray(data.data) ? data.data : [];
    //             setComments(fetchedComments);
    //         } catch (error) {
    //             console.error("Failed to fetch comments:", error);
    //             if (USE_FALLBACK) {
    //                 setComments(dummyComments);
    //             }
    //         }
    //     };
    //     fetchUserDetails();
    //     fetchComments();
    //     fetchPostDetails();
    // }, [postId]); // ✅ now it listens to route changes

    // const submitRatingToAPI = async (postId: string, rating: number): Promise<string> => {
    //     const myHeaders = new Headers();
    //     const token = getCookie('token');
    //     myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    //     myHeaders.append("Authorization", `Bearer ${token}`);
    //     const urlencoded = new URLSearchParams();
    //     urlencoded.append("postId", postId);
    //     urlencoded.append("rating", rating.toString());
    //     const requestOptions: RequestInit = {
    //         method: 'POST',
    //         headers: myHeaders,
    //         body: urlencoded,
    //         redirect: 'follow'
    //     };
    //     const response = await fetch("http://localhost:8080/post/addRating", requestOptions);
    //     if (!response.ok) {
    //         throw new Error(`Error: ${response.statusText}`);
    //     }
    //     const result = await response.text();
    //     return result;
    // };

    const submitRatingToAPI = async (postId: string, rating: number): Promise<string> => {
        const myHeaders = new Headers();
        const token = getCookie('token');
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Authorization", `Bearer ${token}`);
        myHeaders.append("X-XSRF-TOKEN", getCookie('XSRF-TOKEN') || '50d7115f-8f84-4e07-a8ae-1a155afe4864');

        const urlencoded = new URLSearchParams();
        urlencoded.append("postId", postId);
        urlencoded.append("rating", rating.toString());
        const requestOptions: RequestInit = {
            credentials: 'include' as RequestCredentials,
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };
        const response = await fetch(`${backendApiUrl}post/addRating`, requestOptions);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const result = await response.text();
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
    const commentsToRender = comments.length > 0 ? comments : dummyComments;

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
                            : [placeholderImage1]}
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
                                            <Star />{postToRender.rating ? postToRender.rating : 0}
                                            {/* <Star />   {post.rating && <StarRating rating={post.rating} />} */}
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
                                            <div className="flex items-center gap-2">
                                                <Languages className="w-4 h-4" />
                                                <span>Script: {postToRender.description.scriptLanguage && postToRender.description.scriptLanguage}</span>
                                                {/* <span>Script: {post.description.scriptLanguage && post.description.scriptLanguage}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                <span>Language: {postToRender.description.language && postToRender.description.language.join(', ')}</span>
                                                {/* <span>Language: {post.description.language && post.description.language.join(', ')}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2 ">
                                                <Calendar className="w-4 h-4" />
                                                <span>Type: {postToRender.type && postToRender.type}</span>
                                                {/* <span>Type: {post.type && post.type}</span> */}
                                            </div>
                                            <div className="flex items-center gap-2 ">
                                                <MessageSquareWarning className="w-4 h-4" />
                                                <span>Topic: {postToRender.topic && postToRender.topic}</span>
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
                        {commentsToRender.map((comment) => (
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
