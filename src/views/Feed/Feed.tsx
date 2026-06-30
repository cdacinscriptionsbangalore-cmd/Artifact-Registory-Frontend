import { useState, useEffect } from 'react';
// import { Search } from 'lucide-react';
// import FilterBar from './FilterBar';
import DiscoveryCard from './DiscoveryCard';
import FilterBar from './FilterBar';
import mockDiscoveryPosts from "@/Db/feeds";
import { SearchX } from 'lucide-react';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { CircularProgress } from '@mui/material';
import { coreBackendClient } from '@/utils/http/clients/coreBackend.client';
import { useSearchParams } from 'react-router-dom';
import { isMockDataEnabled } from '@/utils/feed/isMockDataEnabled';
// import { getTokenFromCookie } from '@/utils/cookieUtils';

const isOffline = isMockDataEnabled();   // true => use mock data, false => use API
const getPageFromParams = (params: URLSearchParams) => {
  const pageParam = Number(params.get('page'));
  return Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
};

const unwrapApiData = (payload: unknown): any => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
};

const toTimestamp = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const getPostCreatedTimestamp = (post: any): number => {
  return (
    toTimestamp(post?.createdAt) ||
    toTimestamp(post?.description?.createdAt) ||
    toTimestamp(post?.updatedAt) ||
    toTimestamp(post?.description?.updatedAt)
  );
};

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

// Main Discovery Feed Component
const Feed = () => {
  const PAGE_SIZE = 6;
  const [layout, setLayout] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [UserDetails, SetUserDetails] = useState<any | null>(null);
  const [hasFetchedPosts, setHasFetchedPosts] = useState(false);
  const [transcriptionCountByPostId, setTranscriptionCountByPostId] = useState<Record<string, number>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(() => getPageFromParams(searchParams));

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
  // const [visiblePosts, setVisiblePosts] = useState<Post[]>([]); // infinite-scroll slice


  // function getCookie(name: string): string | null {
  //   const value = `; ${document.cookie}`;
  //   const parts = value.split(`; ${name}=`);
  //   if (parts.length === 2) {
  //     return parts.pop()?.split(';').shift() || null;
  //   }
  //   return null;
  // }

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
        // const token = getCookie("token");
        const response = await coreBackendClient.post('post/getAllPost');

        const payload = unwrapApiData(response.data);
        allPosts = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      }

      const latestFirstPosts = [...allPosts].sort(
        (a, b) => getPostCreatedTimestamp(b) - getPostCreatedTimestamp(a)
      );
      setPosts(latestFirstPosts);
      // setVisiblePosts(allPosts.slice(0, PAGE_SIZE)); // initialize infinite scroll
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setHasFetchedPosts(true);
    }
  };

  // const loadMorePosts = () => {
  //   setTimeout(() => {
  //     const next = posts.slice(
  //       visiblePosts.length,
  //       visiblePosts.length + PAGE_SIZE
  //     );
  //     setVisiblePosts(prev => [...prev, ...next]);
  //   }, 800);
  // };

  const fetchUserDetailsOfPosts = async () => {
    try {
      // const token = getCookie('token');
      const response = await coreBackendClient.post('post/userProfile');
      const payload = unwrapApiData(response.data);
      const normalizedUser = Array.isArray(payload) ? payload[0] : payload;
      SetUserDetails(normalizedUser ?? null);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      console.log("Fetched User Posts: ", UserDetails);
    }
  };

  // Filter posts based on search term
  // const filteredPosts = visiblePosts.filter(post =>
  //   post?.description?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   post?.description?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   post?.description?.geolocation?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   (Array.isArray(post?.script) &&
  //     post.script.some(s =>
  //       s?.toLowerCase().includes(searchTerm.toLowerCase())
  //     ))
  // );
  const normalizedSearch = searchTerm?.toLowerCase().trim();

  const filteredPosts = posts.filter(post => {
    if (!normalizedSearch) return true;

    const searchableValues = [
      post?.description?.title,
      post?.description?.subject,
      post?.description?.geolocation?.city,
      ...(Array.isArray(post?.script) ? post.script : [])
    ]
      .filter((value): value is string => typeof value === 'string' && value !== '')
      .map(value => value.toLowerCase());

    if (searchableValues.length === 0) return true;

    return searchableValues.some(value =>
      value.includes(normalizedSearch)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getTranscriptionCount = async (postId: string): Promise<number> => {
    if (!postId) return 0;
    try {
      const urlencoded = new URLSearchParams();
      urlencoded.append("postId", postId);

      const response = await coreBackendClient.post("post/getPostDiscription", urlencoded);
      const payload = unwrapApiData(response.data);

      if (Array.isArray(payload)) return payload.length;
      if (Array.isArray(payload?.data)) return payload.data.length;
      if (typeof payload?.count === "number" && Number.isFinite(payload.count)) return payload.count;
      if (typeof payload?.total === "number" && Number.isFinite(payload.total)) return payload.total;

      return 0;
    } catch (error) {
      console.error(`Failed to fetch transcription count for post ${postId}:`, error);
      return 0;
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    setSearchParams(prevParams => {
      const nextParams = new URLSearchParams(prevParams);
      nextParams.set('page', String(page));
      return nextParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  useEffect(() => {
    fetchPosts();
    fetchUserDetailsOfPosts();
  }, []);

  useEffect(() => {
    const pageFromUrl = getPageFromParams(searchParams);
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams, currentPage]);

  useEffect(() => {
    if (!hasFetchedPosts || currentPage <= totalPages) return;

    setCurrentPage(totalPages);
    setSearchParams(prevParams => {
      const nextParams = new URLSearchParams(prevParams);
      nextParams.set('page', String(totalPages));
      return nextParams;
    }, { replace: true });
  }, [currentPage, hasFetchedPosts, totalPages, setSearchParams]);

  useEffect(() => {
    if (isOffline) return;

    const postIdsToFetch = paginatedPosts
      .map((post) => post?._id)
      .filter((postId): postId is string => Boolean(postId))
      .filter((postId) => transcriptionCountByPostId[postId] === undefined);

    if (postIdsToFetch.length === 0) return;

    let isCancelled = false;

    const fetchCountsForVisiblePosts = async () => {
      const results = await Promise.all(
        postIdsToFetch.map(async (postId) => {
          const count = await getTranscriptionCount(postId);
          return [postId, count] as const;
        })
      );

      if (isCancelled) return;

      setTranscriptionCountByPostId((previous) => {
        const next = { ...previous };
        results.forEach(([postId, count]) => {
          next[postId] = count;
        });
        return next;
      });
    };

    fetchCountsForVisiblePosts();

    return () => {
      isCancelled = true;
    };
  }, [paginatedPosts, transcriptionCountByPostId]);

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
        <div>
          {searchTerm.length > 0 ? <p className="text-gray-400 text-sm" style={{margin:"6px 0 14px 0"}}>
            {filteredPosts.length} sites found {searchTerm && `for "${searchTerm}"`}
          </p>
          : <div className='mb-4'>&nbsp;</div>
          }
        </div>

        {/* Posts Grid/List */}
        <div className={
          layout === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {/* {paginatedPosts.map((post) => (
            <DiscoveryCard
              key={post._id}
              post={post}
              layout={layout}
            />
          ))

          } */}
          {/* {visiblePosts.length > 0 && <InfiniteScroll
            dataLength={visiblePosts.length}
            next={loadMorePosts}
            hasMore={visiblePosts.length < posts.length}
            loader={<CircularProgress enableTrackSlot style={{ color: '#FF6B35', display: 'block', margin: '10rem auto 0 auto' }} />}
            endMessage={
              <p className="text-center text-gray-400 mt-15" >
                <b>No more posts</b>
              </p>
            }
            style={{ overflow: 'visible' }}
          >
            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
              {paginatedPosts.map(post => (
                <DiscoveryCard
                  key={post._id}
                  post={post}
                  layout={layout}
                />
              ))}
            </div>
          </InfiniteScroll>} */}
          {paginatedPosts.map(post => (
            <DiscoveryCard
              key={post._id}
              post={post}
              layout={layout}
              transcriptionCount={transcriptionCountByPostId[post._id]}
            />
          ))}
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

        {filteredPosts.length > 0 && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="cursor-pointer px-4 py-2 rounded-md border border-orange-500 text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 cursor-pointer py-2 rounded-md border ${currentPage === pageNumber
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-orange-500 text-orange-500'
                  }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="cursor-pointer px-4 py-2 rounded-md border border-orange-500 text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
