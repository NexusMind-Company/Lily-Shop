import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useFeed } from "../../hooks/useFeed";
import TopNav from "./topNav";
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
  } = useFeed();

  const [searchParams] = useSearchParams();
  const sharedPostId = searchParams.get("postId");

  const scrollContainerRef = useRef(null);
  const mediaRefs = useRef(new Set());
  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [hasScrolledToShared, setHasScrolledToShared] = useState(false);

  // ========================================
  // SCROLL TO SHARED POST
  // ========================================
  useEffect(() => {
    if (
      sharedPostId &&
      !hasScrolledToShared &&
      posts.length > 0 &&
      scrollContainerRef.current
    ) {
      const targetIndex = posts.findIndex(
        (p) => String(p.id) === String(sharedPostId),
      );

      if (targetIndex !== -1) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const viewportHeight = scrollContainerRef.current.clientHeight;
            scrollContainerRef.current.scrollTo({
              top: targetIndex * viewportHeight,
              behavior: "smooth",
            });
            setCurrentPostIndex(targetIndex);
            setHasScrolledToShared(true);
          }
        }, 100);
      }
    }
  }, [posts, sharedPostId, hasScrolledToShared]);

  // ========================================
  // VIDEO INTERSECTION OBSERVER
  // ========================================
  useEffect(() => {
    // The individual FeedItem components now handle their own play/pause
    // logic using the `isActive` prop. This observer is no longer
    // responsible for triggering playback to avoid race conditions.
    const observer = new IntersectionObserver(
      () => {
        // No-op: Playback is now driven by `isActive` prop in FeedItem
      },
      { threshold: 0.8 },
    );

    observerRef.current = observer;

    const currentMediaRefs = mediaRefs.current;
    return () => {
      observer.disconnect();
      currentMediaRefs.clear();
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
      if (isRefreshing) return; // Prevent scroll calculation conflicts during pull-to-refresh

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
  }, [
    posts,
    scrollPositionRef,
    saveCurrentPost,
    currentPostIndex,
    isRefreshing,
  ]);

  // ========================================
  // PULL TO REFRESH
  // ========================================
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop <= 0) {
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

    if (isError || (error && posts.length === 0)) {
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
              className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-white/10 shadow-xl"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lily opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lily"></span>
              </div>
              <span className="text-[11px] text-white font-medium tracking-wide">
                Updating feed...
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
    <main className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative h-full w-full md:max-w-105 lg:max-w-120">
        <div className="h-full relative">
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderContent()}
        </div>
      </div>
    </main>
  );
};

export default FeedContainer;
