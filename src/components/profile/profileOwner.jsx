import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { api } from "../../services/api";
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
import ProfileFeedViewer from "./profileFeedViewer";

const API_BASE_URL = "https://lily-shop-backend.onrender.com";

const ProfileOwner = () => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);
  const { data, loading, error } = useSelector((state) => state.profile);
  const { user = {} } = data || {};

  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);

  const [feedOverlay, setFeedOverlay] = useState({
    isOpen: false,
    items: [],
    initialIndex: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!auth?.isAuthenticated || !token) {
      navigate("/login", { replace: true });
    }
  }, [auth?.isAuthenticated, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (auth?.isAuthenticated && token && !data) {
      dispatch(fetchProfile());
    }
  }, [auth?.isAuthenticated, data, dispatch]);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (activeTab === 0) {
        setPostsLoading(true);
        let allPosts = [];

        try {
          const productsRes = await api.get("/shops/products/me/");
          const products = Array.isArray(productsRes.data)
            ? productsRes.data
            : productsRes.data?.results || [];

          allPosts = [
            ...allPosts,
            ...products.map((p) => ({
              ...p,
              itemType: "product",
              type: "product",
              username:
                p.shop?.shop_name ||
                p.user?.username ||
                p.username ||
                user.username ||
                "Unknown",
              userpic:
                p.shop?.logo ||
                p.user?.profile_pic ||
                p.userpic ||
                user.profile_pic ||
                "/profile-icon.svg",
              user_id: p.shop?.vendor_id || p.user?.id || p.user_id || user.id,
              like_count: p.likes_count ?? p.like_count ?? p.likes ?? 0,
              view_count: p.views ?? p.view_count ?? p.visit_count ?? 0,
            })),
          ];
        } catch (err) {
          console.error("Failed to load user products:", err);
        }

        try {
          const contentsRes = await api.get("/shops/contents/me/");
          const contents = Array.isArray(contentsRes.data)
            ? contentsRes.data
            : contentsRes.data?.results || [];

          allPosts = [
            ...allPosts,
            ...contents.map((c) => ({
              ...c,
              itemType: "content",
              type: "content",
              username:
                c.shop?.shop_name ||
                c.user?.username ||
                c.username ||
                user.username ||
                "Unknown",
              userpic:
                c.shop?.logo ||
                c.user?.profile_pic ||
                c.userpic ||
                user.profile_pic ||
                "/profile-icon.svg",
              user_id: c.shop?.vendor_id || c.user?.id || c.user_id || user.id,
              like_count: c.likes_count ?? c.like_count ?? c.likes ?? 0,
              view_count: c.views ?? c.view_count ?? c.visit_count ?? 0,
            })),
          ];
        } catch (err) {
          console.error("Failed to load user contents:", err);
        }

        allPosts.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setUserPosts(allPosts);
        setPostsLoading(false);
      }
    };

    if (auth?.isAuthenticated) {
      loadUserPosts();
    }
  }, [
    activeTab,
    auth?.isAuthenticated,
    user.username,
    user.profile_pic,
    user.id,
  ]);

  useEffect(() => {
    const loadLikedPosts = async () => {
      if (activeTab === 2) {
        setLikedLoading(true);
        let allLiked = [];

        try {
          const productsRes = await api.get("/shops/my-liked-products/");
          const likedProducts = Array.isArray(productsRes.data)
            ? productsRes.data
            : productsRes.data?.results || [];

          allLiked = [
            ...allLiked,
            ...likedProducts.map((p) => ({
              ...p,
              itemType: "product",
              type: "product",
              username:
                p.shop?.shop_name ||
                p.user?.username ||
                p.username ||
                "Unknown",
              userpic:
                p.shop?.logo ||
                p.user?.profile_pic ||
                p.userpic ||
                "/profile-icon.svg",
              user_id: p.shop?.vendor_id || p.user?.id || p.user_id,
              like_count: p.likes_count ?? p.like_count ?? p.likes ?? 0,
              view_count: p.views ?? p.view_count ?? p.visit_count ?? 0,
            })),
          ];
        } catch (err) {
          console.error("Failed to load liked products:", err);
        }

        try {
          const contentsRes = await api.get("/shops/my-liked-contents/");
          const likedContents = Array.isArray(contentsRes.data)
            ? contentsRes.data
            : contentsRes.data?.results || [];

          allLiked = [
            ...allLiked,
            ...likedContents.map((c) => ({
              ...c,
              itemType: "content",
              type: "content",
              username:
                c.shop?.shop_name ||
                c.user?.username ||
                c.username ||
                "Unknown",
              userpic:
                c.shop?.logo ||
                c.user?.profile_pic ||
                c.userpic ||
                "/profile-icon.svg",
              user_id: c.shop?.vendor_id || c.user?.id || c.user_id,
              like_count: c.likes_count ?? c.like_count ?? c.likes ?? 0,
              view_count: c.views ?? c.view_count ?? c.visit_count ?? 0,
            })),
          ];
        } catch (err) {
          console.error("Failed to load liked contents:", err);
        }

        allLiked.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setLikedPosts(allLiked);
        setLikedLoading(false);
      }
    };

    if (auth?.isAuthenticated) {
      loadLikedPosts();
    }
  }, [activeTab, auth?.isAuthenticated]);

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
            post.image_url || post.media || post.image || "/placeholder.png";
          const isVideo =
            post.is_video ||
            (typeof mediaSrc === "string" && mediaSrc.endsWith(".mp4"));

          return (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => {
                if (post.itemType === "product") {
                  navigate(`/product-details/${post.id}`);
                } else {
                  const contentItems = items.filter(
                    (item) => item.itemType === "content",
                  );
                  const clickedIndex = contentItems.findIndex(
                    (item) => item.id === post.id,
                  );
                  setFeedOverlay({
                    isOpen: true,
                    items: contentItems,
                    initialIndex: clickedIndex !== -1 ? clickedIndex : 0,
                  });
                }
              }}
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
              <div className="absolute bottom-1 left-1 flex items-center text-white text-xs bg-black/40 px-1 rounded">
                <Eye size={15} className="mr-1" /> {post.view_count || 0}
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
    dispatch(handleLogout());
    navigate("/login");
  };

  const displayPostCount =
    userPosts.length > 0 ? userPosts.length : data.product_count || 0;

  return (
    <div className="max-w-md mx-auto min-h-screen pb-10">
      {/* Dynamic Profile Feed Viewer */}
      {feedOverlay.isOpen && (
        <ProfileFeedViewer
          posts={feedOverlay.items}
          initialIndex={feedOverlay.initialIndex}
          onClose={() => setFeedOverlay({ ...feedOverlay, isOpen: false })}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 mt-1">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={25} />
        </button>

        <div className="flex gap-4">
          <Link to="/settings">
            <Settings size={25} className="cursor-pointer" />
          </Link>
          <div className="flex justify-end">
            <button onClick={handleLogoutClick}>
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
            <h3 className="font-semibold text-center">
              {user.username || user.email?.split("@")[0] || "Unnamed User"}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-500 text-sm">
                @{user.username || "unknown"}
              </p>
              <IconLink size={15} className="cursor-pointer text-gray-500" />
            </div>
          </div>
        </div>

        <p className="mt-2 text-sm text-center">
          {user && user.bio
            ? user.bio
            : "Add a bio to let people know more about you and your products!"}
        </p>

        {/* Stats */}
        <div className="flex flex-col justify-center items-center mt-4">
          <div className="flex gap-8 items-center mb-4 justify-center">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl">{displayPostCount}</span>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <Link to="/followers">
              <div className="flex flex-col items-center">
                <p className="font-bold text-2xl">
                  {user.followers_count || 0}
                </p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
            </Link>
            <Link to="/following">
              <div className="flex flex-col items-center">
                <span className="font-bold text-2xl">
                  {user.following_count || 0}
                </span>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center md:flex-row gap-3 w-full max-w-[250px] mx-auto">
            {user?.vendor_id && (
              <Link to="/vendor-dashboard" className="w-full">
                <button className="w-full px-4 py-2 border-2 border-orange-400 text-orange-400 rounded-3xl font-bold md:text-[16px]">
                  Food Subscription
                </button>
              </Link>
            )}
            <Link to="/editProfile" className="w-full">
              <button className="w-full px-4 py-2 border-2 border-lily text-lily rounded-3xl font-bold md:text-[16px]">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex my-3 w-full justify-evenly">
        <button
          className={`w-[25%] flex justify-center border-b-[2px] py-2 transition-colors ${
            activeTab === 0
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(0)}
        >
          <Grid size={26} />
        </button>
        <button
          className={`w-[25%] flex justify-center border-b-[2px] py-2 transition-colors ${
            activeTab === 1
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(1)}
        >
          <Megaphone size={26} />
        </button>
        <button
          className={`w-[25%] flex justify-center border-b-[2px] py-2 transition-colors ${
            activeTab === 2
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(2)}
        >
          <Heart size={26} />
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 0 && renderGrid(userPosts, postsLoading, "No posts yet")}
        {activeTab === 1 && <AnnouncementsGrid />}
        {activeTab === 2 &&
          renderGrid(likedPosts, likedLoading, "No favorites yet")}
      </div>
    </div>
  );
};

export default ProfileOwner;
