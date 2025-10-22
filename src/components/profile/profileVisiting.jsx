// src/pages/Profile.jsx
import { useState } from "react";
import {
  Grid,
  Megaphone,
  Eye,
  Heart,
  EllipsisVertical,
  ChevronLeft,
  MessageSquareText,
  FlagTriangleRight,
  LinkIcon,
  Ban,
  Play,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Example data
const posts = [
  { views: "2.1k", img: "/dress.png", isVideo: false },
  { views: "4.8k", img: "/video-thumbnail.png", isVideo: true },
  { views: "1.2k", img: "/dress2.png", isVideo: false },
  { views: "3.6k", img: "/video2.png", isVideo: true },
  { views: "5.4k", img: "/dress3.png", isVideo: false },
  { views: "2.7k", img: "/video3.png", isVideo: true },
  { views: "1.1k", img: "/dress4.png", isVideo: false },
  { views: "2.9k", img: "/dress5.png", isVideo: false },
  { views: "7.2k", img: "/video4.png", isVideo: true },
];

const announcements = Array(9).fill({
  views: "2.1k",
  title: "New Collection!",
  img: "/announcement.png",
});

const favorites = Array(9).fill({
  views: "2.1k",
  name: "Favorite Dress",
  img: "/favorite.png",
});

// 🟢 Posts Tab Component (with Play Button Overlay)
function PostsGrid() {
  return posts.length === 0 ? (
    <div className="text-center text-gray-400 my-8">No posts</div>
  ) : (
    <div className="grid grid-cols-3 gap-3 my-2 px-4">
      {posts.map((post, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden">
          <img
            src={post.img}
            alt="Post"
            className="w-full aspect-square object-cover bg-black"
          />

          {/* Play Button Overlay */}
          {post.isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className=" rounded-full p-2 shadow-md">
                <Play size={30} className="text-white" />
              </div>
            </div>
          )}

          {/* Views Label */}
          <div className="absolute bottom-1 left-1 flex items-center text-white text-xs drop-shadow-md">
            <Eye size={15} className="mr-1" /> {post.views}
          </div>
        </div>
      ))}
    </div>
  );
}

// 🟣 Announcements Tab Component
function AnnouncementsGrid() {
  return announcements.length === 0 ? (
    <div className="text-center text-gray-400 my-8">No announcements</div>
  ) : (
    <div className="grid grid-cols-3 gap-3 my-2 px-4">
      {announcements.map((item, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden">
          <img
            src={item.img}
            alt="Announcement"
            className="w-full aspect-square object-cover bg-black"
          />
          <div className="absolute bottom-1 left-1 flex items-center text-white text-xs drop-shadow-md">
            <Eye size={15} className="mr-1" /> {item.views}
          </div>
        </div>
      ))}
    </div>
  );
}

// 💖 Favorites Tab Component
function FavoritesGrid() {
  return favorites.length === 0 ? (
    <div className="text-center text-gray-400 my-8">No favorites</div>
  ) : (
    <div className="grid grid-cols-3 gap-3 my-2 px-4">
      {favorites.map((item, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden">
          <img
            src={item.img}
            alt="Favorite"
            className="w-full aspect-square object-cover bg-black"
          />
          <div className="absolute bottom-1 left-1 flex items-center text-white text-xs drop-shadow-md">
            <Eye size={15} className="mr-1" /> {item.views}
          </div>
        </div>
      ))}
    </div>
  );
}

const ProfileVisiting = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDropDown, setIsDropDown] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={25} />
        </button>
        <h2 className="font-semibold text-lg">Profile</h2>
        <div className="flex gap-3 relative">
          <Link to="/settings">
            <LinkIcon size={25} />
          </Link>
          <EllipsisVertical
            size={25}
            onClick={() => setIsDropDown(!isDropDown)}
            className="cursor-pointer"
          />
          {isDropDown && (
            <ul
              className="absolute bg-white p-1 top-full right-0 rounded-lg shadow-md z-10"
              onClick={() => setIsDropDown(false)}
            >
              <li className="flex items-center gap-1 px-5 py-2 hover:bg-gray-100 cursor-pointer">
                <FlagTriangleRight size={15} /> Report
              </li>
              <li className="flex items-center gap-1 px-5 py-2 hover:bg-gray-100 cursor-pointer">
                <Ban size={15} /> Block
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-6 px-4">
        <div className="flex gap-2 items-center">
          <img
            src="/avatar.png"
            alt="Profile"
            className="w-20 h-20 rounded-full mb-2"
          />
          <div>
            <h3 className="font-semibold">Faith Owolewa</h3>
            <p className="text-gray-500 text-sm">@Faithzy</p>
          </div>
        </div>

        <p className="mt-1 text-sm">
          Bloom Threads offers expertly crafted clothing for every occasion. We
          focus on quality and unique designs that allow your personal style to
          bloom.
        </p>

        {/* Stats */}
        <div className="flex mt-4 space-x-5 text-sm items-center">
          <div className="flex flex-col items-center">
            <span className="font-bold text-xl">0</span>
            <p>Posts</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold text-xl">120</p>
            <p>Followers</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-xl">36</span>
            <p>Following</p>
          </div>
          <button className="bg-lily text-white px-8 font-bold py-2 rounded-full">
            Follow
          </button>
          <Link to="/messages">
            <MessageSquareText size={30} className="text-red-500" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex my-5 w-full justify-evenly">
        <button
          className={`w-[20%] flex justify-center border-b-[2px] py-1.5 ${
            activeTab === 0 ? "border-lily text-lily" : "border-transparent"
          }`}
          onClick={() => setActiveTab(0)}
        >
          <Grid size={30} />
        </button>
        <button
          className={`w-[20%] flex justify-center border-b-[2px] py-1.5 ${
            activeTab === 1 ? "border-lily text-lily" : "border-transparent"
          }`}
          onClick={() => setActiveTab(1)}
        >
          <Megaphone size={30} />
        </button>
        <button
          className={`w-[20%] flex justify-center border-b-[2px] py-1.5 ${
            activeTab === 2 ? "border-lily text-lily" : "border-transparent"
          }`}
          onClick={() => setActiveTab(2)}
        >
          <Heart size={30} />
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 0 && <PostsGrid />}
        {activeTab === 1 && <AnnouncementsGrid />}
        {activeTab === 2 && <FavoritesGrid />}
      </div>
    </div>
  );
};

export default ProfileVisiting;
