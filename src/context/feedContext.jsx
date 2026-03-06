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

const fetchFeedPage = async ({ pageParam = 1, activeTab }) => {
  const endpoint =
    activeTab === "nearby" ? "/shops/products/nearby/" : "/shops/feed/";

  const response = await api.get(endpoint, {
    params: {
      page: pageParam,
      page_size: FEED_PAGE_SIZE,
    },
  });

  const data = response.data;

  if (data && data.results) {
    return {
      items: data.results,
      nextPage: data.next ? pageParam + 1 : null,
      hasMore: !!data.next,
    };
  }

  if (data && data.feed) {
    return {
      items: data.feed,
      nextPage: data.feed.length > 0 ? pageParam + 1 : null,
      hasMore: data.feed.length === FEED_PAGE_SIZE,
    };
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      nextPage: data.length > 0 ? pageParam + 1 : null,
      hasMore: data.length === FEED_PAGE_SIZE,
    };
  }

  return { items: [], nextPage: null, hasMore: false };
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
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
  });

  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
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
      posts,
      isLoading,
      isError,
      isFetching,
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
      setActiveTab,
      scrollPositionRef,
    ],
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
