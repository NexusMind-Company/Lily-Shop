import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  fetchPersonalizedFeed,
  fetchTrendingFeed,
  fetchNearbyFeedV2,
} from "../services/api";
import { FeedContext } from "./FeedContext";

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

  if (Array.isArray(data)) return shuffleArray(data);
  if (Array.isArray(data.results)) return shuffleArray(data.results);

  const content = Array.isArray(data.content) ? data.content : [];
  const products = Array.isArray(data.products) ? data.products : [];

  const allItems = [...content, ...products];
  return allItems.length > 0 ? shuffleArray(allItems) : [];
};

const fetchFeed = async ({ activeTab, isAuthenticated, location, isLocating }) => {
  if (activeTab === "nearby") {
    if (location) {
      return await fetchNearbyFeedV2({
        lat: location.lat,
        lon: location.lon,
      });
    }
    if (isLocating) {
      return null;
    }
    return await fetchTrendingFeed();
  }

  return isAuthenticated
    ? await fetchPersonalizedFeed()
    : await fetchTrendingFeed();
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
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
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
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["feed", activeTab, isAuthenticated, !!location, isLocating],
    queryFn: () => fetchFeed({ activeTab, isAuthenticated, location, isLocating }),
    enabled: !isLocating,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const posts = useMemo(() => {
    if (!data) return [];
    return mergeFeedItems(data);
  }, [data]);

  const loadMore = useCallback(() => {}, []);

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
      hasNextPage: false,
      isFetchingNextPage: false,
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
