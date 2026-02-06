import React, { useEffect, useState } from 'react';
// import { mockUser, mockPosts } from '@/Db/userProfile';
import ProfileHeader from './ProfileHeader';
import StatsGrid from './StatsGrid';
import StatsGrid1 from './StatsGrid1';
import ImageGallery from './ImageGallery';
import ContributionsList from './ContributionsList';
import cdacRoundLogo from "@assets/cdacroundlogo.png";
import { coreBackendClient } from '@/utils/http/clients/coreBackend.client';
import { authClient } from '@/utils/http/clients/authClient.client';
import { authStore } from '@/store/authStore';
import AuthContext from '@/context/AuthContextType';

/**
 * Profile component with robust fallbacks when backend/token are unavailable.
 * - Uses real backend when token available and fetches succeed.
 * - Falls back to mockUser / mockPosts on any failure or missing token.
 */
// const USE_FALLBACK = false; // toggle when backend unavailable

declare global {
  interface Window {
    _env_?: { VITE_BACKEND_API_URL?: string };
  }
}

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL ?? import.meta.env.VITE_BACKEND_API_URL;

const Profile: React.FC = () => {
  const [UserDetails, SetUserDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [Comments, setComments] = useState<any[] | null>(null);
  const authCtx = React.useContext(AuthContext);

  // Read cookie helper (string return or null)
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // const buildMockComments = () =>
  //   mockPosts.map((p) => ({
  //     _id: `c-${p._id}`,
  //     postId: p._id,
  //     userId: mockUser._id,
  //     username: mockUser.name,
  //     userImageUrl: mockUser.avatarUrl,
  //     postImageUrl: p.images?.image?.[0],
  //     createdAt: p.createdAt,
  //     updatedAt: p.createdAt,
  //     description: p.description?.description || "Mock comment",
  //     title: p.description?.title || "Mock title",
  //     upvote: Math.floor(Math.random() * 20),
  //     userVote: [],
  //   }));


  // useEffect(() => {
  //   let didFallback = false;

  //   const useFallbacks = () => {
  //     // Use the mock data you provided
  //     SetUserDetails(mockUser);
  //     setPosts(mockPosts);
  //     // Create a simple comments fallback built from mockPosts (adjust as needed)
  //     setComments(buildMockComments());
  //     // mark loading false
  //     setIsLoading(false);
  //     setIsLoadingPosts(false);
  //     setIsLoadingComments(false);
  //     didFallback = true;
  //     console.warn('Profile: using mock data fallback (backend/token unavailable or fetch failed).');
  //   };

  //   const fetchWithTimeout = async (input: RequestInfo, init?: RequestInit, timeout = 5000) => {
  //     const controller = new AbortController();
  //     const id = setTimeout(() => controller.abort(), timeout);
  //     try {
  //       const res = await fetch(input, { ...init, signal: controller.signal });
  //       clearTimeout(id);
  //       return res;
  //     } catch (err) {
  //       clearTimeout(id);
  //       throw err;
  //     }
  //   };
  //   if (USE_FALLBACK) {
  //     SetUserDetails(mockUser);
  //     setPosts(mockPosts);
  //     setComments(buildMockComments());
  //     setIsLoading(false);
  //     setIsLoadingPosts(false);
  //     setIsLoadingComments(false);
  //     return;
  //   }

  //   // const fetchAll = async () => {
  //   //   const token = getCookie('token');

  //   //   if (!token) {
  //   //     console.warn('Profile: no token found in cookies — using mock fallback for UI work.');
  //   //     useFallbacks();
  //   //     return;
  //   //   }

  //   //   // If token exists, attempt to call backend endpoints; fallback to mocks on any failure
  //   //   try {
  //   //     // fetch user profile
  //   //     const userResp = await fetchWithTimeout(`${backendApiUrl}post/userProfile`, {
  //   //       method: 'POST',
  //   //       headers: {
  //   //         'Content-Type': 'application/json',
  //   //         Authorization: `Bearer ${token}`,
  //   //       },
  //   //       body: JSON.stringify({}),
  //   //     }, 7000);
  //   //     // const userResp = await fetchWithTimeout('http://localhost:8080/post/userProfile', {
  //   //     //   method: 'POST',
  //   //     //   headers: {
  //   //     //     'Content-Type': 'application/json',
  //   //     //     Authorization: `Bearer ${token}`,
  //   //     //   },
  //   //     //   body: JSON.stringify({}),
  //   //     // }, 7000);

  //   //     if (!userResp.ok) throw new Error(`userProfile fetch failed: ${userResp.status}`);
  //   //     const userJson = await userResp.json();
  //   //     SetUserDetails(userJson?.data ?? mockUser);
  //   //   } catch (err) {
  //   //     console.error('Failed to fetch user profile — falling back to mockUser.', err);
  //   //     SetUserDetails(mockUser);
  //   //   } finally {
  //   //     setIsLoading(false);
  //   //   }

  //   //   try {
  //   //     // fetch all posts
  //   //     const postsResp = await fetchWithTimeout(`${backendApiUrl}post/getAllUserPost`, {
  //   //       method: 'POST',
  //   //       headers: {
  //   //         'Content-Type': 'application/json',
  //   //         Authorization: `Bearer ${token}`,
  //   //       },
  //   //       body: JSON.stringify({}),
  //   //     }, 7000);
  //   //     // const postsResp = await fetchWithTimeout('http://localhost:8080/post/getAllUserPost', {
  //   //     //   method: 'POST',
  //   //     //   headers: {
  //   //     //     'Content-Type': 'application/json',
  //   //     //     Authorization: `Bearer ${token}`,
  //   //     //   },
  //   //     //   body: JSON.stringify({}),
  //   //     // }, 7000);

  //   //     if (!postsResp.ok) throw new Error(`getAllUserPost fetch failed: ${postsResp.status}`);
  //   //     const postsJson = await postsResp.json();
  //   //     setPosts(Array.isArray(postsJson?.data) ? postsJson.data : mockPosts);
  //   //   } catch (err) {
  //   //     console.error('Failed to fetch posts — falling back to mockPosts.', err);
  //   //     setPosts(mockPosts);
  //   //   } finally {
  //   //     setIsLoadingPosts(false);
  //   //   }

  //   //   try {
  //   //     // fetch comments
  //   //     const commentsResp = await fetchWithTimeout(`${backendApiUrl}post/getCommentByUser`, {
  //   //       method: 'POST',
  //   //       headers: {
  //   //         'Content-Type': 'application/json',
  //   //         Authorization: `Bearer ${token}`,
  //   //       },
  //   //       body: JSON.stringify({}),
  //   //     }, 7000);
  //   //     // const commentsResp = await fetchWithTimeout('http://localhost:8080/post/getCommentByUser', {
  //   //     //   method: 'POST',
  //   //     //   headers: {
  //   //     //     'Content-Type': 'application/json',
  //   //     //     Authorization: `Bearer ${token}`,
  //   //     //   },
  //   //     //   body: JSON.stringify({}),
  //   //     // }, 7000);

  //   //     if (!commentsResp.ok) throw new Error(`getCommentByUser fetch failed: ${commentsResp.status}`);
  //   //     const commentsJson = await commentsResp.json();
  //   //     setComments(Array.isArray(commentsJson?.data) ? commentsJson.data : mockPosts.map(p => ({
  //   //       commentId: `c-${p._id}`,
  //   //       postId: p._id,
  //   //       text: p.description?.description || `${p.description?.title} — mock comment`,
  //   //       createdAt: p.createdAt,
  //   //     })));
  //   //   } catch (err) {
  //   //     console.error('Failed to fetch comments — using generated mock comments.', err);
  //   //     setComments(buildMockComments());
  //   //   } finally {
  //   //     setIsLoadingComments(false);
  //   //   }
  //   // };

  //   // Start fetch attempts
  //   // fetchAll().catch((e) => {
  //   //   // if something unexpected breaks, ensure we fall back
  //   //   if (!didFallback) {
  //   //     console.error('Unexpected error in profile fetching — using mock fallback.', e);
  //   //     SetUserDetails(mockUser);
  //   //     setPosts(mockPosts);
  //   //     setComments(buildMockComments());
  //   //     setIsLoading(false);
  //   //     setIsLoadingPosts(false);
  //   //     setIsLoadingComments(false);
  //   //   }
  //   // });

  //   // no cleanup needed
  // }, []);

  useEffect(() => {
    // Get token at the beginning
    const token = getCookie('token');

    if (!token) {
      console.error('No token found');
      // Redirect to login or handle no token case
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await coreBackendClient.post(`${backendApiUrl}post/userProfile`);
        const data = response.data;
        // const data = await response.json();

        SetUserDetails(data.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAllPosts = async () => {
      try {
        const response = await coreBackendClient.post(`${backendApiUrl}post/getAllUserPost`);
        const data = response.data;
        // const data = await response.json();

        setPosts(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    const fetchAllComments = async () => {
      try {
        const response = await coreBackendClient.post(`${backendApiUrl}post/getCommentByUser`);
        const { data } = response;
        // console.log(await data.data);
        setComments(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchAllComments();
    fetchAllPosts();
    fetchPosts();
  }, []);

  // Keep the simple loading state UI so styling can be iterated on
  if (isLoading || isLoadingPosts || isLoadingComments) {
    return (
      <div className="min-h-screen bg-secondary-background flex items-center justify-center">
        <div className='flex flex-col items-center'>
          {/* <FaSpinner className="animate-spin text-4xl text-[#66B0FF]" /> */}
          <img src={cdacRoundLogo} className="mr-3 mb-4 size-20 cdacSpinner" />
          <div className="text-[#000000] text-lg">Loading user profile...</div>
        </div>
      </div>
    );
  }


  // Apply the context here
  useEffect(() => {
  const bootstrapAuth = async () => {
    try {
      const res = await authClient.post("/auth/refresh");
      const token = res.data.auth_token;
      authCtx.setToken(token);          // Context
      authStore.setToken(token); // Axios
    } catch (error) {
      authCtx.setToken(null);
      authStore.clear();
    } finally {
      setIsLoading(false);
    }
  };

  bootstrapAuth();
}, []);

  return (
    <div className="min-h-screen bg-primary-background p-4" >
      <div className="max-w-6xl mx-auto">
        {/* render header/stats only if we have user data */}
        {UserDetails && <ProfileHeader user={UserDetails} />}
        {/* {UserDetails && <StatsGrid stats={UserDetails} />} */}
        {UserDetails &&
          <>
            <div className='profile-stats-pc'><StatsGrid1 stats={UserDetails} /></div>
            <div className='profile-stats-mob'><StatsGrid stats={UserDetails} /></div>
          </>
        }

        {/* render gallery and contributions with fallback posts/comments */}
        <h2 className="text-xl font-bold text-black">My Contributions</h2>

        {posts && posts.length > 0 ? (
          <ImageGallery posts={posts} />
        ) : (
          <div className="py-8 text-center">No posts available.</div>
        )}

        {Comments && Comments.length > 0 ? (
          <ContributionsList comments={Comments} />
        ) : (
          <div className="py-8 text-center">No contributions yet.</div>
        )}
      </div>
    </div>
  );
};

export default Profile;
