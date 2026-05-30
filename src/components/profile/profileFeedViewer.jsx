import React, { useEffect, useRef, useState, useCallback } from "react";
import FeedItem from "../feed/feedItem";
import { ChevronLeft } from "lucide-react";

const ProfileFeedViewer = ({ posts, initialIndex = 0, onClose }) => {
  const scrollContainerRef = useRef(null);
  const mediaRefs = useRef(new Set());
  const observerRef = useRef(null);
  const [currentPostIndex, setCurrentPostIndex] = useState(initialIndex);

  useEffect(() => {
    if (scrollContainerRef.current && initialIndex >= 0) {
      const viewportHeight = window.innerHeight;
      scrollContainerRef.current.scrollTop = initialIndex * viewportHeight;
    }
  }, [initialIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const mediaElement = Array.from(mediaRefs.current).find(
            (item) =>
              (item.getDOMNode ? item.getDOMNode() : item) === entry.target,
          );

          if (!mediaElement) return;

          const domEl = mediaElement.getDOMNode
            ? mediaElement.getDOMNode()
            : mediaElement;
          const isPlayable = domEl && typeof domEl.play === "function";
          if (!isPlayable) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            mediaRefs.current.forEach((item) => {
              const el = item.getDOMNode ? item.getDOMNode() : item;
              if (el && el !== domEl && typeof el.pause === "function") {
                el.pause();
              }
            });

            const playPromise = domEl.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
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
    const currentMediaRefs = mediaRefs.current;
    return () => {
      observer.disconnect();
      currentMediaRefs.clear();
    };
  }, []);

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || posts.length === 0) return;

    const handleScroll = () => {
      const scrolled = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const index = Math.round(scrolled / viewportHeight);

      if (index !== currentPostIndex) {
        setCurrentPostIndex(index);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [posts, currentPostIndex]);

  return (
    <div className="fixed inset-0 z-100 bg-black flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-110 p-2 bg-black/50 rounded-full hover:bg-black/70 transition text-white"
      >
        <ChevronLeft size={28} />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex-1 h-screen overflow-y-auto snap-y snap-mandatory hide-scrollbar relative"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {posts.map((post, index) => (
          <div
            key={post.id || index}
            className="h-screen w-full snap-start relative bg-black shrink-0"
          >
            <FeedItem
              post={post}
              onVideoInit={handleVideoInit}
              isActive={index === currentPostIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileFeedViewer;
