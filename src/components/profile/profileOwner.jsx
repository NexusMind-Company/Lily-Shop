import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { Grid, Megaphone, Eye, Heart, Settings, ChevronLeft, LinkIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const ProfileOwner = () => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>No profile data found.</p>
      </div>
    );

  const { user = [], products = [] } = data;
  const profileUser = user || {};

  // Example fallbacks
  const posts = products || [];
  const announcements = []; // You can fill this with backend data later
  const favorites = []; // Optional feature later

  // ---- Tab Components ----
  const PostsGrid = () => {
    if (!posts.length) {
      return <div className="text-center text-gray-400 my-8">No posts</div>;
    }
    return (
      <div className="grid grid-cols-3 gap-3 my-2 px-4">
        {posts.map((post, i) => (
          <div key={i} className="relative rounded-lg">
            <img
              src={post.image || "/placeholder.png"}
              alt="Post"
              className="w-full aspect-square object-cover bg-black"
            />
            <div className="absolute bottom-1 left-1 flex items-center text-white text-xs">
              <Eye size={15} className="mr-1" /> {post.views || 0}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const AnnouncementsGrid = () => {
    if (!announcements.length) {
      return <div className="text-center text-gray-400 my-8">No announcements</div>;
    }
    return (
      <div className="grid grid-cols-3 gap-3 my-2 px-4">
        {announcements.map((item, i) => (
          <div key={i} className="relative rounded-lg">
            <img
              src={item.img}
              alt="Announcement"
              className="w-full aspect-square object-cover bg-black"
            />
            <div className="absolute bottom-1 left-1 flex items-center text-white text-xs">
              <Eye size={15} className="mr-1" /> {item.views}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const FavoritesGrid = () => {
    if (!favorites.length) {
      return <div className="text-center text-gray-400 my-8">No favorites</div>;
    }
    return (
      <div className="grid grid-cols-3 gap-3 my-2 px-4">
        {favorites.map((item, i) => (
          <div key={i} className="relative rounded-lg">
            <img
              src={item.img}
              alt="Favorite"
              className="w-full aspect-square object-cover bg-black"
            />
            <div className="absolute bottom-1 left-1 flex items-center text-white text-xs">
              <Eye size={15} className="mr-1" /> {item.views}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={25} />
        </button>
        <h2 className="font-semibold text-lg">Profile</h2>
        <div className="flex gap-4">
          <Link to="">
            <LinkIcon size={25} />
          </Link>
          <Link to="/settings">
            <Settings size={25} />
          </Link>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-6 px-4">
        <div className="flex gap-2 items-center">
          <img
            src={profileUser.avatar || "/avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full mb-2 object-cover"
          />
          <div>
            <h3 className="font-semibold">{profileUser.full_name || "Unnamed User"}</h3>
            <p className="text-gray-500 text-sm">@{profileUser.username}</p>
          </div>
        </div>

        <p className="mt-1 text-sm">
          {profileUser.bio ||
            "Bloom Threads offers expertly crafted clothing for every occasion. We focus on quality and unique designs that allow your personal style to bloom."}
        </p>

        {/* Stats */}
        <div className="flex mt-4 space-x-5 text-sm items-center justify-between ">
          <div className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl">{posts.length}</span>
              <p>Posts</p>
            </div>
            <Link to="/followers">
              <div className="flex flex-col items-center">
                <p className="font-bold text-2xl">
                  {profileUser.followers_count || 0}
                </p>
                <p>Followers</p>
              </div>
            </Link>
            <Link to="/following">
              <div className="flex flex-col items-center">
                <span className="font-bold text-2xl">
                  {profileUser.following_count || 0}
                </span>
                <p>Following</p>
              </div>
            </Link>
          </div>
          <Link
            to="/editProfile"
            className="border-2 font-bold text-lg border-lily text-lily px-6 py-2 rounded-full"
          >
            Edit Profile
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

export default ProfileOwner;
