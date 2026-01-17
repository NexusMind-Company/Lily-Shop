import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useFeed } from "../../context/feedContext";
import TopNav from "./topNav";
import BottomNav from "./bottomNav";
import FeedItem from "./feedItem";
import { PostCardSkeleton } from "../common/skeletons";
import { FiRefreshCw, FiWifi, FiWifiOff } from "react-icons/fi";

const FeedContainer = () => {
  const {
    posts,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    refreshFeed,
    scrollPositionRef,
    activeTab,
    setActiveTab,
    saveCurrentPost,
  } = useFeed();

  const scrollContainerRef = useRef(null);
  const mediaRefs = useRef(new Set());
  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  const [activePage, setActivePage] = useState("home");
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // ========================================
  // EXTRACT BACKGROUND MEDIA (IMAGE OR VIDEO)
  // ========================================
  const backgroundMedia = useMemo(() => {
    if (!posts || posts.length === 0 || !posts[currentPostIndex]) return null;

    const post = posts[currentPostIndex];
    const rawMedia = post.media || post.media_url || post.image_url;

    // Normalize to array
    const mediaArray = Array.isArray(rawMedia)
      ? rawMedia
      : rawMedia
        ? [{ src: rawMedia, type: typeof rawMedia === "string" && rawMedia.match(/\.(mp4|mov|webm)$/i) ? "video" : "image" }]
        : [];

    // Get the first item (the one visible on the card)
    const primaryItem = mediaArray[0];

    if (primaryItem) {
      // Determine type if not explicitly set
      const isVideo = primaryItem.type === "video" ||
        (typeof primaryItem.src === "string" && primaryItem.src.match(/\.(mp4|mov|webm)$/i));

      return {
        src: primaryItem.src || primaryItem,
        type: isVideo ? "video" : "image"
      };
    }

    // Fallback if no media exists
    return { src: "/placeholder-image.png", type: "image" };
  }, [posts, currentPostIndex]);

  // ========================================
  // VIDEO INTERSECTION OBSERVER
  // ========================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const mediaElement = Array.from(mediaRefs.current).find(
            (item) => (item.getDOMNode ? item.getDOMNode() : item) === entry.target
          );

          if (!mediaElement) return;

          const isPlayable = typeof mediaElement.play === "function";
          if (!isPlayable) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            // Pause all other videos
            mediaRefs.current.forEach((item) => {
              if (item !== mediaElement && typeof item.pause === "function") {
                item.pause();
              }
            });
            // Play current video
            mediaElement.play().catch(() => { });
          } else {
            mediaElement.pause();
          }
        });
      },
      { threshold: 0.75 }
    );

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      mediaRefs.current.clear();
    };
  }, []);

  // ========================================
  // VIDEO REGISTRATION
  // ========================================
  const handleVideoInit = useCallback((mediaObject) => {
    if (mediaObject) {
      mediaRefs.current.add(mediaObject);
      const domNode = mediaObject.getDOMNode ? mediaObject.getDOMNode() : mediaObject;
      if (domNode && observerRef.current) {
        observerRef.current.observe(domNode);
      }
    }
  }, []);

  // ========================================
  // INFINITE SCROLL TRIGGER
  // ========================================
  useEffect(() => {
    if (!loadMoreTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, loadMore]);

  // ========================================
  // TRACK CURRENT POST
  // ========================================
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || posts.length === 0) return;

    const handleScroll = () => {
      scrollPositionRef.current = container.scrollTop;

      const scrolled = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const index = Math.round(scrolled / viewportHeight);

      if (index !== currentPostIndex) {
        setCurrentPostIndex(index);
        if (posts[index]) {
          saveCurrentPost(posts[index].id);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [posts, scrollPositionRef, saveCurrentPost, currentPostIndex]);

  // ========================================
  // PULL TO REFRESH
  // ========================================
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0 && distance < 150) {
      setPullDistance(distance);
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;

    if (pullDistance > 80) {
      setIsRefreshing(true);
      await refreshFeed();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }

    isPulling.current = false;
  }, [pullDistance, refreshFeed]);

  // ========================================
  // RENDER CONTENT
  // ========================================
  const renderContent = () => {
    if (isLoading && posts.length === 0) {
      return (
        <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          {[...Array(3)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex items-center justify-center p-4 text-center">
          <div className="text-white">
            <FiWifiOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-sm opacity-70 mb-4">
              Could not load feed. Please check your connection.
            </p>
            <button
              onClick={refreshFeed}
              className="px-6 py-2 bg-lily text-white rounded-full hover:bg-darklily transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center text-white">
          <svg
            className="w-16 h-16 mb-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4z"
            />
          </svg>
          <h2 className="text-xl font-bold mb-2">
            {activeTab === "nearby" ? "No Posts Nearby" : "Feed is Empty"}
          </h2>
          <p className="text-sm opacity-70">
            {activeTab === "nearby"
              ? "Try expanding your area or check back later."
              : "Be the first to post or follow other users to see their posts."}
          </p>
        </div>
      );
    }

    return (
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to Refresh Indicator */}
        {pullDistance > 0 && (
          <div
            className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30"
            style={{ opacity: Math.min(pullDistance / 80, 1) }}
          >
            <div className="bg-white rounded-full p-3 shadow-lg">
              <FiRefreshCw
                className={`w-6 h-6 text-lily ${isRefreshing ? "animate-spin" : ""
                  }`}
              />
            </div>
          </div>
        )}

        {/* Feed Items */}
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="h-full w-full snap-start flex-shrink-0"
          >
            <FeedItem
              post={post}
              onVideoInit={handleVideoInit}
              isActive={index === currentPostIndex}
            />
          </div>
        ))}

        {/* Loading More Indicator */}
        {isFetchingNextPage && (
          <div className="h-full w-full snap-start flex items-center justify-center">
            <div className="text-white flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-sm">Loading more posts...</p>
            </div>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasNextPage && !isFetchingNextPage && (
          <div
            ref={loadMoreTriggerRef}
            className="h-4 w-full"
            style={{ scrollSnapAlign: "none" }}
          />
        )}

        {/* End of Feed */}
        {!hasNextPage && posts.length > 0 && (
          <div className="h-full w-full snap-start flex items-center justify-center">
            <div className="text-white text-center p-8">
              <FiWifi className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-70">You're all caught up!</p>
              <button
                onClick={refreshFeed}
                className="mt-4 px-6 py-2 bg-lily text-white rounded-full text-sm hover:bg-darklily transition-colors"
              >
                Refresh Feed
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="relative w-full h-[100dvh] bg-transparent flex justify-center overflow-hidden">

      {/* BACKGROUND BLUR EFFECT (IMAGE OR VIDEO) */}
      {backgroundMedia && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-black/60 z-10" />

          {backgroundMedia.type === "video" ? (
            <video
              key={backgroundMedia.src}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover blur-3xl opacity-50 scale-110 transition-all duration-700 ease-in-out"
            >
              <source src={backgroundMedia.src} />
            </video>
          ) : (
            <img
              key={backgroundMedia.src}
              src={backgroundMedia.src}
              alt="Blur Background"
              className="w-full h-full object-cover blur-3xl opacity-50 scale-110 transition-all duration-700 ease-in-out"
              onError={(e) => {
                if (!e.target.src.includes("/feed-image.png")) {
                  e.target.src = "/feed-image.png";
                }
              }}
            />
          )}
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative h-full w-full md:max-w-md lg:max-w-[470px] bg-transparent md:shadow-xl z-10">
        <div className="absolute top-0 left-0 right-0 z-40">
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {renderContent()}

        <div className="absolute bottom-0 left-0 right-0 z-40">
          <BottomNav activePage={activePage} setActivePage={setActivePage} />
        </div>
      </div>
    </main>
  );
};
export default FeedContainer;