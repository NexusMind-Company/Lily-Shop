import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  fetchPersonalizedFeed,
  fetchTrendingFeed,
  fetchNearbyFeedV2,
} from "../services/api";
import { FeedContext } from "./FeedContext";

const LARGE_PAGE_SIZE = 100;

const mergeFeedItems = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  const content = Array.isArray(data.content) ? data.content : [];
  const products = Array.isArray(data.products) ? data.products : [];
  return [...content, ...products];
};

const fetchFeedPage = async ({ pageParam = 1, activeTab, isAuthenticated, location, isLocating }) => {
  const params = { page: pageParam, page_size: LARGE_PAGE_SIZE };

  let data;

  if (activeTab === "nearby") {
    if (location) {
      data = await fetchNearbyFeedV2({ lat: location.lat, lon: location.lon, params });
    } else if (isLocating) {
      return { items: [], nextPage: null, hasMore: false };
    } else {
      data = await fetchTrendingFeed(params);
    }
  } else {
    data = isAuthenticated
      ? await fetchPersonalizedFeed(params)
      : await fetchTrendingFeed(params);
  }

  const items = mergeFeedItems(data);
  const hasMore = data?.next != null && data?.next !== undefined && data?.next !== "";

  return { items, nextPage: hasMore ? pageParam + 1 : null, hasMore };
};

export const FeedProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState("forYou");
  const [location, setLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const scrollPositionRef = useRef(0);
  const lastViewedPostRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocating(false);
      setLocationPermissionDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setLocationPermissionDenied(true);
        setIsLocating(false);
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
    queryKey: ["feed", activeTab, isAuthenticated, !!location, isLocating],
    queryFn: ({ pageParam }) =>
      fetchFeedPage({ pageParam, activeTab, isAuthenticated, location, isLocating }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasMore) return undefined;
      return lastPage.nextPage;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const posts = useMemo(() => {
    if (!data?.pages) return [];
    const seen = new Set();
    return data.pages.flatMap((page) =>
      (page?.items ?? []).filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }),
    );
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
      isLocating,
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
      isLocating,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};
