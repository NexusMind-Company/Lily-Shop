import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../services/api";

const FeedContext = createContext(null);

const FEED_PAGE_SIZE = 20;

// const fetchFeedPage = async ({ pageParam, activeTab }) => {
//   // ✅ FIX: default here instead of in the destructure signature
//   const page = pageParam ?? 1;
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const fetchFeedPage = async ({ pageParam = 1, activeTab }) => {
  const endpoint =
    activeTab === "nearby" ? "/shops/products/nearby/" : "/shops/feed/";

  const response = await api.get(endpoint, {
    params: { page: pageParam, page_size: FEED_PAGE_SIZE },
  });

  const data = response.data;
  let items = [];
  let hasMore = false;

  if (data && Array.isArray(data.results) && data.results.length > 0) {
    items = shuffleArray(data.results);
    hasMore = !!data.next;
  } else if (data && Array.isArray(data.feed) && data.feed.length > 0) {
    items = shuffleArray(data.feed);
    hasMore = !!data.next;
  } else if (Array.isArray(data) && data.length > 0) {
    items = shuffleArray(data);
    hasMore = data.length === FEED_PAGE_SIZE;
  }

return {
    items,
    nextPage: hasMore ? pageParam + 1 : null,
    hasMore,
  };
};

export const FeedProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState("forYou");
  const scrollPositionRef = useRef(0);
  const lastViewedPostRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["feed", activeTab],
    queryFn: ({ pageParam }) => fetchFeedPage({ pageParam, activeTab }),
    // ✅ FIX: removed initialPageParam (v4 doesn't support it).
    // pageParam defaults to undefined → fetchFeedPage handles it with ?? 1
    getNextPageParam: (lastPage) => {
      // ✅ FIX: guard against undefined lastPage (crash source)
      if (!lastPage) return undefined;
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    // ✅ If on v4, gcTime is called cacheTime instead:
    // cacheTime: 1000 * 60 * 10,
  });

  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page?.items ?? []);
  }, [data]);

  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const refreshFeed = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const saveCurrentPost = useCallback((postId) => {
    lastViewedPostRef.current = postId;
  }, []);

  const getRestoreIndex = useCallback(() => {
    if (!lastViewedPostRef.current) return 0;
    const index = posts.findIndex((p) => p.id === lastViewedPostRef.current);
    return index >= 0 ? index : 0;
  }, [posts]);

  const value = useMemo(
    () => ({
      posts,
      isLoading,
      isError,
      isFetching,
      error: error?.message,
      loadMore,
      hasNextPage,
      isFetchingNextPage,
      refreshFeed,
      toggleMute,
      saveCurrentPost,
      getRestoreIndex,
      isMuted,
      activeTab,
      setActiveTab,
      scrollPositionRef,
    }),
    [
      posts, isLoading, isError, isFetching, error, loadMore,
      hasNextPage, isFetchingNextPage, refreshFeed, toggleMute,
      saveCurrentPost, getRestoreIndex, isMuted, activeTab,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) throw new Error("useFeed must be used within a FeedProvider");
  return context;
};