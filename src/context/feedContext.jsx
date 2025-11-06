import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeed, fetchNearbyFeed } from "../services/api";
import { mockPosts } from "../components/feed/mockData";

const USE_MOCK = false;

const FeedContext = createContext(null);

export const FeedProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const scrollPositionRef = useRef(0);
  const [activeTab, setActiveTab] = useState("forYou");

  const queryResult = useQuery({
    queryKey: ["feed", activeTab],
    queryFn: () => {
      if (activeTab === "nearby") {
        return fetchNearbyFeed();
      }
      return fetchFeed();
    },
    select: (data) => data?.results || [],
    enabled: !USE_MOCK,
  });

  const posts = useMemo(
    () => (USE_MOCK ? mockPosts : queryResult.data || []),
    [queryResult.data]
  );

  const isLoading = useMemo(
    () => (USE_MOCK ? false : queryResult.isLoading),
    [queryResult.isLoading]
  );

  const error = useMemo(
    () => (USE_MOCK ? null : queryResult.error),
    [queryResult.error]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      posts,
      isLoading,
      error,
      isMuted,
      toggleMute,
      scrollPositionRef,
      activeTab,
      setActiveTab,
    }),
    [posts, isLoading, error, isMuted, toggleMute, activeTab]
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
