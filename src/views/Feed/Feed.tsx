import { useState, useEffect } from 'react';
// import { Search } from 'lucide-react';
// import FilterBar from './FilterBar';
import DiscoveryCard from './DiscoveryCard';
// import dummyPosts from "@/Db/feeds";
// import { getTokenFromCookie } from '@/utils/cookieUtils';
const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

export interface Post {
  _id: string;
  description: {
    title: string;
    subject: string;
    geolocation: {
      city: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  script: string[];
  [key: string]: any;
}

// Main Discovery Feed Component
const Feed = () => {
  const [layout, setLayout] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  type Post = {
    _id: string;
    description: {
      title: string;
      subject: string;
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

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = getCookie('token');
        const response = await fetch(`${backendApiUrl}post/getAllPost`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            "X-XSRF-TOKEN": getCookie('XSRF-TOKEN') || ''
          },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        setPosts(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    fetchPosts();
  }, []);

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    // post?.description?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // post?.description?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // post?.description?.geolocation?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Array.isArray(post?.script) && post.script.some(script => script?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        {/* <FilterBar 
          layout={layout} 
          setLayout={setLayout}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        /> */}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm">
            {/* {filteredPosts.length} sites found {searchTerm && `for "${searchTerm}"`} */}
          </p>
        </div>

        {/* Posts Grid/List */}
        <div className={
          layout === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 "
            : "space-y-4"
        }>
          {posts.map((post) => (
            <DiscoveryCard
              key={post._id}
              post={post}
              layout={layout}
            />
          ))

          }
          {/* {dummyPosts.map((post) => ( */}
          {/* <DiscoveryCard */}
          {/* // key={dummyPosts[0]._id}  */}
          {/* post={dummyPosts.data[0]} */}
          {/* layout={layout} */}
          {/* /> */}
          {/* <DiscoveryCard */}
          {/* // key={dummyPosts[0]._id} 
            post={dummyPosts.data[1]}
            layout={layout}
          />
          <DiscoveryCard
            // key={dummyPosts[0]._id} 
            post={dummyPosts.data[2]}
            layout={layout}
          />
          <DiscoveryCard
            // key={dummyPosts[0]._id} 
            post={dummyPosts.data[3]}
            layout={layout}
          /> */}
          {/* )) */}

          {/* } */}
        </div>

        {/* Empty State */}
        {/* {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No sites found</p>
              <p className="text-sm">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )} */}

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