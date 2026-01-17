import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../services/api";

const FeedContext = createContext(null);

const FEED_PAGE_SIZE = 20;

// Feed API functions
const fetchFeedPage = async ({ pageParam = 1, activeTab }) => {
  const endpoint = activeTab === "nearby" ? "/shops/products/nearby/" : "/shops/feed/";

  const response = await api.get(endpoint, {
    params: {
      page: pageParam,
      page_size: FEED_PAGE_SIZE,
    },
  });

  // Backend returns either:
  // 1. { feed: [...], total_items: N } - from HomeView
  // 2. { results: [...], count: N, next, previous } - paginated
  // 3. [...] - direct array

  if (response.data.feed) {
    return {
      items: response.data.feed,
      nextPage: pageParam + 1,
      hasMore: response.data.feed.length === FEED_PAGE_SIZE,
    };
  }

  if (response.data.results) {
    return {
      items: response.data.results,
      nextPage: response.data.next ? pageParam + 1 : null,
      hasMore: !!response.data.next,
    };
  }

  // Direct array
  return {
    items: response.data,
    nextPage: pageParam + 1,
    hasMore: response.data.length === FEED_PAGE_SIZE,
  };
};

export const FeedProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState("forYou");
  const scrollPositionRef = useRef(0);
  const lastViewedPostRef = useRef(null);

  // Infinite scroll feed query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["feed", activeTab],
    queryFn: ({ pageParam }) => fetchFeedPage({ pageParam, activeTab }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Flatten paginated posts
  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Load more when reaching bottom
  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Save current post for restoration after refresh
  const saveCurrentPost = useCallback((postId) => {
    lastViewedPostRef.current = postId;
  }, []);

  // Get index to scroll to after refresh
  const getRestoreIndex = useCallback(() => {
    if (!lastViewedPostRef.current) return 0;
    const index = posts.findIndex((p) => p.id === lastViewedPostRef.current);
    return index >= 0 ? index : 0;
  }, [posts]);

  const value = useMemo(
    () => ({
      // Data
      posts,
      isLoading,
      isError,
      error: error?.message,

      // Pagination
      loadMore,
      hasNextPage,
      isFetchingNextPage,

      // Actions
      refreshFeed,
      toggleMute,
      saveCurrentPost,
      getRestoreIndex,

      // State
      isMuted,
      activeTab,
      setActiveTab,
      scrollPositionRef,
    }),
    [
      posts,
      isLoading,
      isError,
      error,
      loadMore,
      hasNextPage,
      isFetchingNextPage,
      refreshFeed,
      toggleMute,
      saveCurrentPost,
      getRestoreIndex,
      isMuted,
      activeTab,
    ]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return context;
};