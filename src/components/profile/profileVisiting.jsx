import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchPublicProfile, followUser } from "../../services/api";
import {
  Grid,
  Megaphone,
  Eye,
  Heart,
  EllipsisVertical,
  ChevronLeft,
  MessageSquareText,
  FlagTriangleRight,
  Ban,
  Play,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

const ProfileVisiting = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [data, setData] = useState(null); // Replaced Redux state with local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false); // Local follow state

  const navigate = useNavigate();
  const { username } = useParams();

  // Access logged-in user to prevent self-visiting
  const { user_data } = useSelector((state) => state.auth);

  useEffect(() => {
    // 1. Redirect if visiting own profile
    if (user_data) {
      if (String(user_data.id) === String(username) || user_data.username === username) {
        navigate("/profile");
        return;
      }
    }

    // 2. Fetch public profile logic
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchPublicProfile(username);

        // Normalize data to match your design's expected structure
        // We ensure 'products' is populated so the Grid works
        const normalizedData = {
          user: {
            ...result, // Flatten user details if they are at root
            ...result.user, // Or merge if nested
            full_name: result.full_name || result.user?.full_name || result.username || "User",
            username: result.username || result.user?.username,
            profile_pic: result.profile_pic || result.user?.profile_pic,
            bio: result.bio || result.user?.bio,
            followers_count: result.follower_count || result.followers_count || 0,
            following_count: result.following_count || 0,
          },
          // Map API's posts/products to 'products' for your Grid
          products: result.products || result.posts || result.user?.products || [],
        };

        setData(normalizedData);
        // Set initial follow status if available in response
        setIsFollowing(result.is_following || false);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    if (username) {
      loadData();
    }
  }, [username, user_data, navigate]);

  const handleFollow = async () => {
    if (!data?.user?.username) return;

    // Optimistic UI update
    setIsFollowing(!isFollowing);

    try {
      await followUser(data.user.username);
    } catch (err) {
      console.error("Follow failed", err);
      setIsFollowing(!isFollowing); // Revert on error
    }
  };

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

  const { user = {}, products = [] } = data;
  const posts = products || [];
  const announcements = [];
  const favorites = [];

  // --- Tabs Components ---
  const PostsGrid = () => {
    if (!posts.length) {
      return <div className="text-center text-gray-400 my-8">No posts</div>;
    }
    return (
      <div className="grid grid-cols-3 gap-3 my-2 px-4">
        {posts.map((post, i) => (
          // Added Link wrapper to make posts clickable if needed, or keep div
          <div key={i} className="relative rounded-lg overflow-hidden aspect-square">
            <img
              src={post.image || post.images?.[0]?.image || "/placeholder.png"}
              alt="Post"
              className="w-full h-full object-cover bg-black"
            />
            {(post.is_video || post.video) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play size={28} className="text-white" />
              </div>
            )}
            <div className="absolute bottom-1 left-1 flex items-center text-white text-xs shadow-black drop-shadow-md">
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
        <div className="relative">
          <EllipsisVertical
            size={25}
            className="cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 top-full bg-white border rounded-lg shadow-md z-10 w-32">
              <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100">
                <FlagTriangleRight size={15} className="mr-2" /> Report
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100">
                <Ban size={15} className="mr-2" /> Block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-6 px-4">
        <div className="flex gap-2 items-center">
          <img
            src={user.profile_pic || "/user.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full mb-2 object-cover border border-gray-100"
          />
          <div>
            <h3 className="font-semibold">{user.full_name || "User"}</h3>
            <p className="text-gray-500 text-sm">
              @{user.username || "unknown"}
            </p>
          </div>
        </div>

        <p className="mt-1 text-sm">
          {user.bio ||
            "This user hasn’t added a bio yet. Follow them to see their latest updates and products!"}
        </p>

        {/* Stats */}
        <div className="flex mt-4 space-x-5 text-sm items-center justify-between">
          <div className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl">{posts.length}</span>
              <p>Posts</p>
            </div>
            <Link to={`/followers/${user.username || "unknown"}`}>
              <div className="flex flex-col items-center">
                <p className="font-bold text-2xl">{user.followers_count || 0}</p>
                <p>Followers</p>
              </div>
            </Link>
            <Link to={`/following/${user.username || "unknown"}`}>
              <div className="flex flex-col items-center">
                <span className="font-bold text-2xl">{user.following_count || 0}</span>
                <p>Following</p>
              </div>
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            {/* Logic integrated into your styling */}
            <button
              onClick={handleFollow}
              className={`border-2 font-bold text-lg px-6 py-2 rounded-full transition-colors ${isFollowing
                ? "bg-white text-lily border-lily"
                : "bg-lily text-white border-transparent"
                }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            <Link to="/messages">
              <MessageSquareText size={40} className="text-red-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex my-5 w-full justify-evenly">
        <button
          className={`w-[20%] flex justify-center border-b-[2px] py-1.5 ${activeTab === 0 ? "border-lily text-lily" : "border-transparent"
            }`}
          onClick={() => setActiveTab(0)}
        >
          <Grid size={30} />
        </button>
        <button
          className={`w-[20%] flex justify-center border-b-[2px] py-1.5 ${activeTab === 1 ? "border-lily text-lily" : "border-transparent"
            }`}
          onClick={() => setActiveTab(1)}
        >
          <Megaphone size={30} />
        </button>
        <button
          className={`w-[20%] flex justify-center border-b-[2px] py-1.5 ${activeTab === 2 ? "border-lily text-lily" : "border-transparent"
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