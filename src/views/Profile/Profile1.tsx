import AuthContext from "@/context/AuthContext";
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import { useContext, useEffect, useMemo, useState } from "react";
import ProfileLoader from "./ProfileLoader";
import ProfileUI from "./ProfileUI";
import { mockUser, mockComments } from "@/Db/userProfile";
import mockDiscoveryPosts from "@/Db/feeds";
import insc1 from "@assets/user/ins/inscription1.png";
import insc2 from "@assets/user/ins/inscription2.png";
import insc3 from "@assets/user/ins/inscription3.png";

const USE_FALLBACK = false;
const LOCAL_MOCK_IMAGES = [insc1, insc2, insc3];

const normalizeProfilePostImages = (post: any, index: number) => {
  const fallbackImage = LOCAL_MOCK_IMAGES[index % LOCAL_MOCK_IMAGES.length];
  const existingImages = Array.isArray(post?.images?.image)
    ? post.images.image.filter((image: unknown) => typeof image === "string" && image.trim().length > 0)
    : [];
  const firstImage = existingImages[0];
  const mustUseFallback =
    !firstImage ||
    (typeof firstImage === "string" && firstImage.includes("/api/post/public/images"));
  const leadImage = mustUseFallback ? fallbackImage : firstImage;

  return {
    ...(post?.images ?? {}),
    thumbnailImage: leadImage,
    image: [leadImage, ...existingImages.filter((image) => image !== leadImage)],
  };
};

const buildProfileFallbackPosts = (currentUserId: string) => {
  const sourcePosts = Array.isArray(mockDiscoveryPosts?.data) ? mockDiscoveryPosts.data : [];

  const randomizedPosts = sourcePosts.map((post: any, index: number) => {
    const isMine = Math.random() > 0.45;

    return {
      ...post,
      user_id: isMine ? currentUserId : post?.user_id,
      images: normalizeProfilePostImages(post, index),
    };
  });

  const authoredPosts = randomizedPosts.filter((post: any) => String(post?.user_id) === String(currentUserId));
  return authoredPosts.length > 0 ? authoredPosts : randomizedPosts.slice(0, 6).map((post: any) => ({ ...post, user_id: currentUserId }));
};

const Profile: React.FC = () => {
  const { isLoading: authLoading } = useContext(AuthContext);

  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedUser = (USE_FALLBACK ? mockUser : userDetails) ?? mockUser;
  const fallbackPostsFromFeed = useMemo(
    () => buildProfileFallbackPosts(String(resolvedUser?._id ?? mockUser._id)),
    [resolvedUser?._id]
  );
  const normalizedApiPosts = useMemo(
    () => (Array.isArray(posts) ? posts.map((post, index) => ({ ...post, images: normalizeProfilePostImages(post, index) })) : []),
    [posts]
  );
  const resolvedPosts = USE_FALLBACK
    ? fallbackPostsFromFeed
    : (normalizedApiPosts.length > 0 ? normalizedApiPosts : fallbackPostsFromFeed);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.groupCollapsed("Profile fetch: requests");
        console.log("POST -> post/userProfile");
        console.log("POST -> post/getAllUserPost");
        console.log("POST -> post/getCommentByUser");
        console.groupEnd();

        const [profileRes, postsRes, commentsRes] = await Promise.all([
          coreBackendClient.post("post/userProfile"),
          coreBackendClient.post("post/getAllUserPost"),
          coreBackendClient.post("post/getCommentByUser"),
        ]);

        console.groupCollapsed("Profile fetch: responses");
        console.log("profileRes:", profileRes?.data);
        console.log("postsRes:", postsRes?.data);
        console.log("commentsRes:", commentsRes?.data);
        console.groupEnd();

        setUserDetails(profileRes.data?.data);
        setPosts(postsRes.data?.data ?? []);
        setComments(commentsRes.data?.data ?? []);
      } catch (err) {
        // Improved logging for axios errors
        try {
          // @ts-ignore
          const status = err?.response?.status;
          // @ts-ignore
          const respData = err?.response?.data;
          console.error("Profile fetch failed", { message: err?.message, status, respData });
        } catch (e) {
          console.error("Profile fetch failed", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return <ProfileLoader />;
  }

  return (
    <ProfileUI
      user={resolvedUser}
      posts={resolvedPosts}
      comments={USE_FALLBACK ? mockComments : comments}
    />
  );
};

export default Profile;
