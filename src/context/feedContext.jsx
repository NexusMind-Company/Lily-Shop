import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useQuery } from "@tanstack/react-query";

// You can move your mock data import here or keep it where it is
import { mockPosts } from "../components/feed/mockData";

const USE_MOCK = true;

const fetchFeed = async () => {
  const res = await fetch("https://lily-shop-backend.onrender.com/shops/products/{id}/");//https://lily-shop-backend.onrender.com/shops/products/{id}/
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
};

const FeedContext = createContext(null);

export const FeedProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const scrollPositionRef = useRef(0);

  // Data fetching is now managed by the context provider
  const {
    data: postsFromApi = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
    enabled: !USE_MOCK,
  });

  const posts = USE_MOCK ? mockPosts : postsFromApi;

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
