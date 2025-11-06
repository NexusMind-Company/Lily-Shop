import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeed } from "../services/api";
import { mockPosts } from "../components/feed/mockData";

// Set this to true to see your mock data
const USE_MOCK = false;

const FeedContext = createContext(null);

export const FeedProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const scrollPositionRef = useRef(0);

  const {
    data: apiResponse,
    isLoading: apiIsLoading,
    error: apiError,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
    enabled: !USE_MOCK,
  });

  const apiPosts = apiResponse?.results || [];
  const posts = USE_MOCK ? mockPosts : apiPosts;
  const isLoading = USE_MOCK ? false : apiIsLoading;
  const error = USE_MOCK ? null : apiError;

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
    }),
    [posts, isLoading, error, isMuted, toggleMute]
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
