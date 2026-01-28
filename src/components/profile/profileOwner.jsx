import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { fetchProducts, fetchLikedProducts, clearAuthTokens } from "../../services/api";
import { fetchContents } from "../../services/shopApi";
import { Link } from "react-router-dom";
import LoaderSd from "../loaders/loaderSd";
import {
  Grid,
  Megaphone,
  Heart,
  ChevronLeft,
  Play,
  Eye,
  Settings,
  LogOut,
  Link as IconLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../../redux/authSlice";

const API_BASE_URL = "https://lily-shop-backend.onrender.com";

const ProfileOwner = () => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);
  const { data, loading, error } = useSelector((state) => state.profile);

  // --- STATES FOR POSTS ---
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]); // Store liked posts
  const [postsLoading, setPostsLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);

  // stricter authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!auth?.isAuthenticated || !token) {
      navigate("/login", { replace: true });
    }
  }, [auth?.isAuthenticated, navigate]);

  // fetch profile data
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (auth?.isAuthenticated && token && !data) {
      dispatch(fetchProfile());
    }
  }, [auth?.isAuthenticated, data, dispatch]);

  // 1. Fetch User Posts (Tab 0)
  useEffect(() => {
    const loadUserPosts = async () => {
      const userId = data?.user?.id || data?.id;
      if (userId && activeTab === 0) {
        setPostsLoading(true);
        try {
          const [productsRes, contentsRes] = await Promise.all([
            fetchProducts({ user: userId }),
            fetchContents({ user: userId }),
          ]);

          const products = Array.isArray(productsRes)
            ? productsRes
            : productsRes.results || [];

          const contents = Array.isArray(contentsRes)
            ? contentsRes
            : contentsRes.results || [];

          // Merge and sort by newest first
          const allPosts = [...products, ...contents].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          setUserPosts(allPosts);
        } catch (err) {
          console.error("Failed to load user posts:", err);
        } finally {
          setPostsLoading(false);
        }
      }
    };

    if (data) {
      loadUserPosts();
    }
  }, [data, activeTab]);

  // 2. Fetch Liked Products (Tab 2 - Heart Icon)
  useEffect(() => {
    const loadLikedPosts = async () => {
      // Only fetch if we are on the Heart tab
      if (activeTab === 2) {
        setLikedLoading(true);
        try {
          const response = await fetchLikedProducts();
          const likedData = Array.isArray(response)
            ? response
            : response.results || [];
          setLikedPosts(likedData);
        } catch (err) {
          console.error("Failed to load liked posts:", err);
        } finally {
          setLikedLoading(false);
        }
      }
    };

    loadLikedPosts();
  }, [activeTab]);

  const { user = {} } = data || {};
  console.log("Profile User  Data:", user);

  const profileImageUrl = useMemo(() => {
    const defaultIcon = "/profile-icon.svg";
    const picPath = user.profile_pic;

    if (!picPath) return defaultIcon;
    if (picPath.startsWith("http")) return picPath;

    const cleanBase = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    const cleanPath = picPath.startsWith("/") ? picPath.slice(1) : picPath;

    return `${cleanBase}/${cleanPath}`;
  }, [user.profile_pic]);

  if (!auth?.isAuthenticated) return null;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <LoaderSd />
      </div>
    );

  if (error) {
    navigate("/login");
  }

  if (auth?.isAuthenticated && !data)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>No profile data found.</p>
      </div>
    );

  // --- REUSABLE GRID RENDERER ---
  // This ensures the Liked Grid looks IDENTICAL to the Posts Grid
  const renderGrid = (items, isLoading, emptyMessage) => {
    if (isLoading) {
      return (
        <div className="w-full flex justify-center my-8">
          <LoaderSd />
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="w-full flex flex-col items-center my-8 text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-3 my-2 px-4">
        {items.map((post, i) => {
          const mediaSrc =
            post.image || post.media || post.media_url || "/placeholder.png";
          const isVideo =
            post.is_video ||
            (typeof mediaSrc === "string" && mediaSrc.endsWith(".mp4"));

          return (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden"
              onClick={() => navigate(`/product-details/${post.id}`)}
            >
              {isVideo ? (
                <video
                  src={mediaSrc}
                  className="w-full aspect-square object-cover bg-black"
                  muted
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt="Post"
                  className="w-full aspect-square object-cover bg-black"
                />
              )}

              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={28} className="text-white" />
                </div>
              )}
              <div className="absolute bottom-1 left-1 flex items-center text-white text-xs">
                <Eye size={15} className="mr-1" /> {post.views || 0}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const AnnouncementsGrid = () => (
    <div className="text-center text-gray-400 my-8">No Promotions yet</div>
  );

  const handleLogoutClick = () => {
    dispatch(handleLogout()); // clear tokens, user data, profile, etc.
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 mt-2">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={25} />
        </button>


        <div className="flex gap-4">
          <Link to="/settings">
            <Settings size={25} className="cursor-pointer" />
          </Link>
          <div className="flex justify-end">
            <button
              onClick={handleLogoutClick}
            >
              <LogOut className="mr-2 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-3 border-b border-gray-300">
        <div className="flex flex-col gap-2 items-center justify-center">
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full mb-2 object-cover bg-gray-200"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/profile-icon.svg";
            }}
          />
          <div>
            <h3 className="font-semibold">
              {user.username || user.email?.split("@")[0] || "Unnamed User"}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">
                @{user.username || "unknown"}
              </p>
              <IconLink size={15} className="cursor-pointer" />
            </div>
          </div>
        </div>

        <p className="mt-1 text-sm">
          {user.bio ||
            "Add a bio to let people know more about you and your products!"}
        </p>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center">
          <div className="flex gap-5 items-center mb-3 sm:mb-0 justify-center">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl">
                {user.post_count || data.post_count || data.product_count || userPosts.length || 0}
              </span>
              <p>Posts</p>
            </div>
            <Link to="/followers">
              <div className="flex flex-col items-center">
                <p className="font-bold text-2xl">{user.follower_count || 0}</p>
                <p>Followers</p>
              </div>
            </Link>
            <Link to="/following">
              <div className="flex flex-col items-center">
                <span className="font-bold text-2xl">
                  {user.following_count || 0}
                </span>
                <p>Following</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center justify-center"> <Link to="/vendor-dashboard">
            <button className="px-4 sm:px-2 py-2 mr-4 border-2 border-orange-400 text-orange-400 rounded-4xl font-bold lg:text-[16px] sm:text-[12px]">
              Food Subscription
            </button>
          </Link>

            <Link to="/editProfile">
              <button className="px-4 sm:px-2 py-2 border-2 border-lily text-lily rounded-4xl font-bold lg:text-[16px] sm:text-[12px]">
                Edit Profile
              </button>
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
        {activeTab === 0 && renderGrid(userPosts, postsLoading, "No posts yet")}
        {activeTab === 1 && <AnnouncementsGrid />}
        {activeTab === 2 &&
          renderGrid(likedPosts, likedLoading, "No favorites yet")}
      </div>
    </div>
  );
};

export default ProfileOwner;