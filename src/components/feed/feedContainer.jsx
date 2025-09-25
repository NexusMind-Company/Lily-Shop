import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNav from "./topNav";
import { mockPosts } from "./mockData";
import BottomNav from "./bottomNav";
import FeedItem from "./feedItem";

const USE_MOCK = true;

const fetchFeed = async () => {
  const res = await fetch("/api/feed");
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
};

const FeedContainer = () => {
  const [activeTab, setActiveTab] = useState("forYou");
  const [activePage, setActivePage] = useState("home");

  const {
    data: postsFromApi = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feed", activeTab, activePage],
    queryFn: fetchFeed,
    enabled: !USE_MOCK,
  });

  const posts = USE_MOCK ? mockPosts : postsFromApi;

  return (
    <div className="relative w-full h-screen text-white overflow-hidden md:w-4xl md:mx-auto">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/*vertical swipe using scroll-snap */}
      <div
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="h-screen w-full snap-start flex-shrink-0"
          >
            <FeedItem post={post} />
          </div>
        ))}
      </div>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default FeedContainer;
