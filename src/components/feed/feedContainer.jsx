import React, { useEffect, useRef, useState, useCallback } from "react";
import { useFeed } from "../../context/feedContext";
import TopNav from "./topNav";
import BottomNav from "./bottomNav";
import FeedItem from "./feedItem";
import { PostCardSkeleton } from "../common/skeletons";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { motion } from "framer-motion";

const FeedContainer = () => {
  const {
    posts,
    isLoading,
    isFetching,
    isError,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    refreshFeed,
    scrollPositionRef,
    activeTab,
    setActiveTab,
    saveCurrentPost,
    getRestoreIndex,
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
  // VIDEO INTERSECTION OBSERVER
  // ========================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const mediaElement = Array.from(mediaRefs.current).find(
            (item) =>
              (item.getDOMNode ? item.getDOMNode() : item) === entry.target,
          );

          if (!mediaElement) return;

          // ✅ FIX: Get the actual DOM node before calling play/pause
          const domEl = mediaElement.getDOMNode
            ? mediaElement.getDOMNode()
            : mediaElement;

          const isPlayable = domEl && typeof domEl.play === "function";
          if (!isPlayable) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            // Pause all other videos
            mediaRefs.current.forEach((item) => {
              const el = item.getDOMNode ? item.getDOMNode() : item;
              if (el && el !== domEl && typeof el.pause === "function") {
                el.pause();
              }
            });

            // ✅ FIX: play() may return undefined — guard before .catch()
            const playPromise = domEl.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Autoplay was prevented — silently ignore
              });
            }
          } else {
            if (typeof domEl.pause === "function") {
              domEl.pause();
            }
          }
        });
      },
      { threshold: 0.75 },
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
      const domNode = mediaObject.getDOMNode
        ? mediaObject.getDOMNode()
        : mediaObject;
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
      { threshold: 0.1 },
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

      setCurrentPostIndex(index);

      if (posts[index]) {
        saveCurrentPost(posts[index].id);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [posts, scrollPositionRef, saveCurrentPost]);

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
        <div className="h-full w-full overflow-hidden bg-black">
          {[1, 2, 3].map((i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error && posts.length === 0) {
      return (
        <div className="h-full flex items-center justify-center p-4 text-center bg-black">
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
        <div className="h-full flex bg-black flex-col items-center justify-center p-4 text-center text-white">
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
                className={`w-6 h-6 text-lily ${isRefreshing ? "animate-spin" : ""}`}
              />
            </div>
          </div>
        )}

        {/* Background Refresh Indicator */}
        {isFetching && !isLoading && !isFetchingNextPage && !isRefreshing && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-[#050505]/80 backdrop-blur-xl rounded-full px-5 py-2 flex items-center gap-3 border border-lily/30 shadow-[0_0_15px_rgba(78,183,94,0.2)]"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lily opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lily"></span>
              </div>
              <span className="text-[11px] text-white font-medium tracking-wide uppercase">
                Fresh finds coming in...
              </span>
            </motion.div>
          </div>
        )}

        {/* Feed Items */}
        {posts.map((post, index) => (
          <div key={post.id} className="h-full w-full snap-start shrink-0">
            <FeedItem
              post={post}
              onVideoInit={handleVideoInit}
              isActive={index === currentPostIndex}
            />
          </div>
        ))}

        {/* Loading More Indicator */}
        {isFetchingNextPage && <PostCardSkeleton />}

        {/* Infinite Scroll Trigger */}
        {hasNextPage && !isFetchingNextPage && (
          <div
            ref={loadMoreTriggerRef}
            className="h-4 w-full"
            style={{ scrollSnapAlign: "none" }}
          />
        )}
      </div>
    );
  };

  return (
    <main className="relative w-full h-screen bg-white md:bg-gray-100 dark:md:bg-black flex justify-center overflow-hidden">
      <div className="relative h-full w-full md:max-w-md lg:max-w-117.5 md:shadow-xl">
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-40">
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {renderContent()}

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <BottomNav activePage={activePage} setActivePage={setActivePage} />
        </div>

        {/* Post Counter */}
        {posts.length > 0 && (
          <div className="absolute top-20 right-4 z-30 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
            {currentPostIndex + 1} / {posts.length}
          </div>
        )}
      </div>
    </main>
  );
};

export default FeedContainer;