import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  fetchPersonalizedFeed,
  fetchTrendingFeed,
  fetchNearbyFeedV2,
} from "../services/api";
import { FeedContext } from "./FeedContext";

const FEED_PAGE_SIZE = 20;

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const mergeFeedItems = (data) => {
  if (!data) return [];

  const content = Array.isArray(data.content) ? data.content : [];
  const products = Array.isArray(data.products) ? data.products : [];

  const allItems = [...content, ...products];
  return allItems.length > 0 ? shuffleArray(allItems) : [];
};

const fetchFeedPage = async ({ pageParam = 1, activeTab, isAuthenticated, location }) => {
  const params = { page: pageParam, page_size: FEED_PAGE_SIZE };

  let data;

  if (activeTab === "nearby") {
    if (location) {
      data = await fetchNearbyFeedV2({
        lat: location.lat,
        lon: location.lon,
        params,
      });
    } else {
      data = await fetchTrendingFeed(params);
    }
  } else {
    data = isAuthenticated
      ? await fetchPersonalizedFeed(params)
      : await fetchTrendingFeed(params);
  }

  const items = mergeFeedItems(data);

  const hasMore = items.length === FEED_PAGE_SIZE;

  return {
    items,
    nextPage: hasMore ? pageParam + 1 : null,
    hasMore,
  };
};

export const FeedProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState("forYou");
  const [location, setLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const scrollPositionRef = useRef(0);
  const lastViewedPostRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setLocationPermissionDenied(true);
      },
    );
  }, []);

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
    queryKey: ["feed", activeTab, isAuthenticated, !!location],
    queryFn: ({ pageParam }) =>
      fetchFeedPage({ pageParam, activeTab, isAuthenticated, location }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
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
      location,
      locationPermissionDenied,
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
      location,
      locationPermissionDenied,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};
