import React, { useEffect, useRef, useState } from "react";
import { useFeed } from "../../context/feedContext";
import TopNav from "./topNav";
import BottomNav from "./bottomNav";
import FeedItem from "./feedItem";

const FeedContainer = () => {
  const { posts, isLoading, error, scrollPositionRef } = useFeed();
  const scrollContainerRef = useRef(null);
  const mediaRefs = useRef(new Set());
  const [activeTab, setActiveTab] = useState("forYou");
  const [activePage, setActivePage] = useState("home");

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

  if (isLoading) return <p>Loading feed...</p>;
  if (error) return <p>Error loading feed.</p>;

  return (
    <main className="relative w-full h-screen bg-white flex justify-center overflow-hidden">
      <div className="relative h-full w-full md:max-w-md lg:max-w-[470px] md:shadow-xl">
        {/* --- MODIFICATION 1: Make TopNav an overlay --- */}
        <div className="absolute top-0 left-0 right-0">
          <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* This scroll container is now correct. It will be h-full (screen height) */}
        {/* and sit *behind* the navs. */}
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="h-full w-full snap-start flex-shrink-0"
            >
              <FeedItem post={post} onVideoInit={handleVideoInit} />
            </div>
          ))}
        </div>

        {/* --- MODIFICATION 2: Make BottomNav an overlay --- */}
        <div className="absolute bottom-0 left-0 right-0">
          <BottomNav activePage={activePage} setActivePage={setActivePage} />
        </div>
      </div>
    </main>
  );
};

export default FeedContainer;
