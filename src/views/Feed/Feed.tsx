import { useState, useEffect } from 'react';
// import { Search } from 'lucide-react';
// import FilterBar from './FilterBar';
import DiscoveryCard from './DiscoveryCard';
import FilterBar from './FilterBar';
import mockDiscoveryPosts from "@/Db/feeds";
import { SearchX } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@mui/material';
import { coreBackendClient } from '@/utils/http/clients/coreBackend.client';
// import { getTokenFromCookie } from '@/utils/cookieUtils';
const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

const isOffline = true;   // true → use mock data, false → use API

export interface Post {
  _id: string;
  description: {
    title: string | null;
    subject: string | null;
    geolocation: {
      city: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  script: string[];
  [key: string]: any;
}
const PAGE_SIZE = 4;

// Main Discovery Feed Component
const Feed = () => {
  const [layout, setLayout] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [UserDetails, SetUserDetails] = useState<any | null>(null);

  type Post = {
    _id: string;
    description: {
      title: string | null;
      subject: string | null;
      geolocation: {
        city: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    script: string[];
    [key: string]: any;
  };

  const [posts, setPosts] = useState<Post[]>([]);
  // const [isLoading, setIsLoading] = useState(null);
  // const [visiblePosts, setVisiblePosts] = useState(
  //   mockDiscoveryPosts.data.slice(0, PAGE_SIZE)
  // );
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]); // paginated slice


  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  const fetchPosts = async () => {
    try {
      let allPosts: Post[] = [];

      if (isOffline) {
        allPosts = mockDiscoveryPosts.data.map((post: any) => ({
          ...post,
          description: {
            ...post.description,
            geolocation:
              post.description?.geolocation && typeof post.description.geolocation === 'object'
                ? post.description.geolocation
                : { city: '', ...((typeof post.description?.geolocation === 'object') ? post.description.geolocation : {}) }
          }
        }));
      } else {
        const token = getCookie("token");
        const response = await coreBackendClient.post(`${backendApiUrl}post/getAllPost`);

        const { data } = response;
        allPosts = Array.isArray(data.data) ? data.data : [];
      }

      setPosts(allPosts);
      setVisiblePosts(allPosts.slice(0, PAGE_SIZE)); // initialize infinite scroll
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const loadMorePosts = () => {
    setTimeout(() => {
      const next = posts.slice(
        visiblePosts.length,
        visiblePosts.length + PAGE_SIZE
      );
      setVisiblePosts(prev => [...prev, ...next]);
    }, 800);
  };

  const fetchUserDetailsOfPosts = async () => {
    try {
      const token = getCookie('token');
      const response = await coreBackendClient.post(`${backendApiUrl}post/userProfile`);
      const { data } = response;
      SetUserDetails(data.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      console.log("Fetched User Posts: ", UserDetails);
    }
  };

  // Filter posts based on search term
  const filteredPosts = visiblePosts.filter(post =>
    post?.description?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post?.description?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post?.description?.geolocation?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(post?.script) &&
      post.script.some(s =>
        s?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
  );

  useEffect(() => {
    fetchPosts();
    fetchUserDetailsOfPosts();
  }, []);

  // Responsive layout adjustment
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && layout === 'grid') {
        // Keep grid but adjust to single column on very small screens
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout]);

  return (
    <div className="min-h-screen bg-primary-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-dark mb-2">Discover Archaeological Sites</h1>
          <p className="text-secondary-dark">Explore ancient inscriptions and historical sites</p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          layout={layout}
          setLayout={setLayout}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm">
            {filteredPosts.length} sites found {searchTerm && `for "${searchTerm}"`}
          </p>
        </div>

        {/* Posts Grid/List */}
        <div className={
          layout === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 "
            : "space-y-4"
        }>
          {/* {filteredPosts.map((post) => (
            <DiscoveryCard
              key={post._id}
              post={post}
              layout={layout}
            />
          ))

          } */}
          {visiblePosts.length > 0 && <InfiniteScroll
            dataLength={visiblePosts.length}
            next={loadMorePosts}
            hasMore={visiblePosts.length < posts.length}
            loader={<CircularProgress enableTrackSlot style={{ color: '#FF6B35', display: 'block', margin: '10rem auto 0 auto' }} />}
            endMessage={
              <p className="text-center text-gray-400 mt-15" >
                <b>No more posts</b>
              </p>
            }
          >
            {/* <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
              }}
            > */}
            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <DiscoveryCard
                  key={post._id}
                  post={post}
                  layout={layout}
                />
              ))}
            </div>
          </InfiniteScroll>}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {/* <Search className="w-12 h-12 mx-auto mb-4 opacity-50" /> */}
              <SearchX className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No sites found</p>
              <p className="text-sm">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredPosts.length > 20 && (
          <div className="text-center mt-8">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Load More Sites
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;