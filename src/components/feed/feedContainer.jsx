import React, { useEffect, useRef, useState } from "react";
import { useFeed } from "../../context/feedContext";
import TopNav from "./topNav";
import BottomNav from "./bottomNav";
import FeedItem from "./feedItem";
import { PostCardSkeleton } from "../common/skeletons";

const FeedContainer = () => {
  const {
    posts,
    isLoading,
    error,
    scrollPositionRef,
    activeTab,
    setActiveTab,
  } = useFeed();

  const scrollContainerRef = useRef(null);
  const mediaRefs = useRef(new Set());

  const [activePage, setActivePage] = useState("home"); // This one is still local

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const mediaObject = Array.from(mediaRefs.current).find(
            (item) =>
              (item.getDOMNode ? item.getDOMNode() : item) === entry.target
          );
          if (!mediaObject) return;

          const isPlayable = typeof mediaObject.play === "function";
          if (!isPlayable) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            mediaRefs.current.forEach((item) => {
              if (item !== mediaObject && typeof item.pause === "function") {
                item.pause();
              }
            });
            mediaObject.play();
          } else {
            mediaObject.pause();
          }
        });
      },
      { threshold: 0.75 }
    )
  );

  const handleVideoInit = (mediaObject) => {
    if (mediaObject) {
      mediaRefs.current.add(mediaObject);
      const domNode = mediaObject.getDOMNode
        ? mediaObject.getDOMNode()
        : mediaObject;
      if (domNode) {
        observer.current.observe(domNode);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = scrollPositionRef.current;
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const handleScroll = () => {
      if (container) {
        scrollPositionRef.current = container.scrollTop;
      }
    };
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [scrollPositionRef]);

  useEffect(() => {
    const obs = observer.current;
    return () => {
      mediaRefs.current.clear();
      obs.disconnect();
    };
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex items-center justify-center p-4 text-center">
          <p className="text-red-500">
            Could not load feed. Please try again later.
          </p>
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
      >
        {posts.map((post) => (
          <div key={post.id} className="h-full w-full snap-start flex-shrink-0">
            <FeedItem post={post} onVideoInit={handleVideoInit} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="relative w-full h-screen bg-white md:bg-gray-100 dark:md:bg-black flex justify-center overflow-hidden">
      <div className="relative h-full w-full md:max-w-md lg:max-w-[470px] md:shadow-xl">
        <div className="absolute top-0 left-0 right-0 z-10">
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {renderContent()}

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <BottomNav activePage={activePage} setActivePage={setActivePage} />
        </div>
      </div>
    </main>
  );
};

export default FeedContainer;
