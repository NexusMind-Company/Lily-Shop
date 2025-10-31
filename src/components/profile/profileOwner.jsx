import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import {
  Grid,
  Megaphone,
  Heart,
  EllipsisVertical,
  ChevronLeft,
  PlusCircle,
  Play,
  Eye,
  Settings,
  Edit3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileOwner = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);
  const { data, loading, error } = useSelector((state) => state.profile);

  // Redirect to login if not auth
  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate("/login");
    }
  }, [auth?.isAuthenticated, navigate]);

  // Fetch profile if authenticated
  useEffect(() => {
    if (auth?.isAuthenticated && !data) {
      dispatch(fetchProfile());
    }
  }, [auth?.isAuthenticated, data, dispatch]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );

  // If user logged in but data failed to load (rare fallback)
  if (auth?.isAuthenticated && !data)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>No profile data found.</p>
      </div>
    );

  const { user = {}, products = [] } = data || {};
  const posts = products || [];
  const announcements = [];
  const favorites = [];

  // --- Tabs Components ---
  const PostsGrid = () => {
    if (!posts.length) {
      return (
        <div className="flex flex-col items-center my-8 text-gray-400">
          <p>No posts yet</p>
          <button
            onClick={() => navigate("/create-post")}
            className="mt-4 flex items-center gap-2 bg-lily text-white px-5 py-2 rounded-full font-semibold hover:bg-lily/90 transition-all"
          >
            <PlusCircle size={20} /> Create your first post
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-3 my-2 px-4">
        {posts.map((post, i) => (
          <div key={i} className="relative rounded-lg overflow-hidden">
            <img
              src={post.image || "/placeholder.png"}
              alt="Post"
              className="w-full aspect-square object-cover bg-black"
            />
            {post.is_video && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play size={28} className="text-white" />
              </div>
            )}
            <div className="absolute bottom-1 left-1 flex items-center text-white text-xs">
              <Eye size={15} className="mr-1" /> {post.views || 0}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const AnnouncementsGrid = () => (
    <div className="text-center text-gray-400 my-8">
      No announcements yet
    </div>
  );

  const FavoritesGrid = () => (
    <div className="text-center text-gray-400 my-8">
      No favorites saved yet
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={25} />
        </button>
        <h2 className="font-semibold text-lg">My Profile</h2>
        <div className="relative">
          <EllipsisVertical
            size={25}
            className="cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 top-full bg-white border rounded-lg shadow-md z-10 w-36">
              <button
                onClick={() => navigate("/edit-profile")}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Edit3 size={15} className="mr-2" /> Edit Profile
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Settings size={15} className="mr-2" /> Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-6 px-4">
        <div className="flex gap-2 items-center">
          <img
            src={user.avatar || "/avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full mb-2 object-cover"
          />
          <div>
            <h3 className="font-semibold">
              {user.username || user.email?.split("@")[0] || "Unnamed User"}
            </h3>
            <p className="text-gray-500 text-sm">
              @{user.username || "unknown"}
            </p>
          </div>
        </div>

        <p className="mt-1 text-sm">
          {user.bio ||
            "Add a bio to let people know more about you and your products!"}
        </p>

        {/* Stats */}
        <div className="flex mt-4 space-x-5 text-sm items-center justify-between">
          <div className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl">{posts.length}</span>
              <p>Posts</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-bold text-2xl">{user.follower_count || 0}</p>
              <p>Followers</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl">
                {user.following_count || 0}
              </span>
              <p>Following</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/create-post")}
            className="flex items-center gap-2 border-2 font-bold text-sm bg-lily text-white px-4 py-2 rounded-full"
          >
            <PlusCircle size={18} /> New Post
          </button>
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
