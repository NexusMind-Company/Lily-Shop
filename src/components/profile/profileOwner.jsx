import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import LoaderSd from "../loaders/loaderSd";
import toast from "react-hot-toast";
import {
  Grid3x3,
  Heart,
  ChevronLeft,
  Play,
  Eye,
  Settings,
  LogOut,
  Link as IconLink,
  MapPin,
  Calendar,
  Bookmark,
  UserSquare,
  PlusSquare,
  AlignJustify,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../../redux/authSlice";
import ProfileFeedViewer from "./profileFeedViewer";
import PostDetailOverlay from "./PostDetailOverlay";

const API_BASE_URL = "//api.lilyshops.com";

const ProfileOwner = () => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);
  const { data, loading, error } = useSelector((state) => state.profile);
  const user = data?.user || data || {};

  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [feedOverlay, setFeedOverlay] = useState({
    isOpen: false,
    items: [],
    initialIndex: 0,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (error) {
      navigate("/login");
    }
  }, [error, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!auth?.isAuthenticated || !token) {
      navigate("/login", { replace: true });
    }
  }, [auth?.isAuthenticated, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (auth?.isAuthenticated && token) {
      dispatch(fetchProfile());
    }
  }, [auth?.isAuthenticated, dispatch]);

  useEffect(() => {
    const fetchFollowingCount = async () => {
      if (!user?.id) return;

      const currentCount = user.following_count || 0;

      if (currentCount > 0) {
        setFollowingCount(currentCount);
        return;
      }

      try {
        const res = await api.get(`/auth/following/${user.id}/`);
        const followingData = Array.isArray(res.data)
          ? res.data
          : res.data?.following || res.data?.results || [];
        setFollowingCount(followingData.length);
      } catch (err) {
        console.error("Failed to fetch following count fallback", err);
        setFollowingCount(0);
      }
    };

    if (auth?.isAuthenticated) {
      fetchFollowingCount();
    }
  }, [user?.id, user?.following_count, auth?.isAuthenticated]);

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
            ...products.map((p) => {
              const item = p.product || p;
              return {
                ...item,
                itemType: "product",
                type: "product",
                username:
                  item.shop?.shop_name ||
                  item.user?.username ||
                  item.username ||
                  user.username ||
                  "Unknown",
                userpic:
                  item.shop?.logo ||
                  item.user?.profile_pic ||
                  item.userpic ||
                  user.profile_pic ||
                  "/profile-icon.svg",
                user_id:
                  item.shop?.vendor_id ||
                  item.user?.id ||
                  item.user_id ||
                  user.id,
                like_count: item.likes_count ?? item.like_count ?? item.likes,
                view_count: item.views ?? item.view_count ?? item.visit_count,
                comment_count:
                  item.comments_count ?? item.comment_count ?? item.comments,
                is_liked: item.is_liked ?? item.has_liked,
              };
            }),
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
            ...contents.map((c) => {
              const item = c.content || c;
              return {
                ...item,
                itemType: "content",
                type: "content",
                username:
                  item.shop?.shop_name ||
                  item.user?.username ||
                  item.username ||
                  user.username ||
                  "Unknown",
                userpic:
                  item.shop?.logo ||
                  item.user?.profile_pic ||
                  item.userpic ||
                  user.profile_pic ||
                  "/profile-icon.svg",
                user_id:
                  item.shop?.vendor_id ||
                  item.user?.id ||
                  item.user_id ||
                  user.id,
                like_count: item.likes_count ?? item.like_count ?? item.likes,
                view_count: item.views ?? item.view_count ?? item.visit_count,
                comment_count:
                  item.comments_count ?? item.comment_count ?? item.comments,
                is_liked: item.is_liked ?? item.has_liked,
              };
            }),
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
      if (activeTab === 1) {
        setLikedLoading(true);
        let allLiked = [];

        try {
          const productsRes = await api.get("/shops/my-liked-products/");
          const likedProducts = Array.isArray(productsRes.data)
            ? productsRes.data
            : productsRes.data?.results || [];

          allLiked = [
            ...allLiked,
            ...likedProducts.map((p) => {
              const item = p.product || p;
              return {
                ...item,
                itemType: "product",
                type: "product",
                username:
                  item.shop?.shop_name ||
                  item.user?.username ||
                  item.username ||
                  "Unknown",
                userpic:
                  item.shop?.logo ||
                  item.user?.profile_pic ||
                  item.userpic ||
                  "/profile-icon.svg",
                user_id: item.shop?.vendor_id || item.user?.id || item.user_id,
                like_count: item.likes_count ?? item.like_count ?? item.likes,
                view_count: item.views ?? item.view_count ?? item.visit_count,
                comment_count:
                  item.comments_count ?? item.comment_count ?? item.comments,
                is_liked: true,
              };
            }),
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
            ...likedContents.map((c) => {
              const item = c.content || c;
              return {
                ...item,
                itemType: "content",
                type: "content",
                username:
                  item.shop?.shop_name ||
                  item.user?.username ||
                  item.username ||
                  "Unknown",
                userpic:
                  item.shop?.logo ||
                  item.user?.profile_pic ||
                  item.userpic ||
                  "/profile-icon.svg",
                user_id: item.shop?.vendor_id || item.user?.id || item.user_id,
                like_count: item.likes_count ?? item.like_count ?? item.likes,
                view_count: item.views ?? item.view_count ?? item.visit_count,
                comment_count:
                  item.comments_count ?? item.comment_count ?? item.comments,
                is_liked: true,
              };
            }),
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

  if (loading && !data)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <LoaderSd />
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
        <div className="w-full flex flex-col items-center my-20 text-gray-400">
          <Grid3x3 size={64} className="mb-4 opacity-20" />
          <p className="text-xl font-bold">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-1 md:gap-0 my-2">
        {items.map((post, i) => {
          const mediaSrc =
            post.image_url || post.media || post.image || "/placeholder.png";
          const isVideo =
            post.is_video ||
            (typeof mediaSrc === "string" && mediaSrc.endsWith(".mp4"));

          return (
            <div
              key={post.id || i}
              className="relative aspect-square overflow-hidden cursor-pointer group"
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
                  className="w-full h-full object-cover bg-gray-100"
                  muted
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt="Post"
                  className="w-full h-full object-cover bg-gray-100"
                />
              )}

              {/* Overlay on hover (Desktop) */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-6 text-white font-bold hidden md:flex">
                <div className="flex items-center gap-2">
                  <Heart fill="white" size={20} /> {post.like_count || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={20} /> {post.view_count || 0}
                </div>
              </div>

              {isVideo && !isVideo && (
                <div className="absolute top-2 right-2 text-white">
                  <Play size={20} fill="white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleLogoutClick = () => {
    dispatch(handleLogout());
    navigate("/login");
  };

  const displayPostCount =
    userPosts.length > 0 ? userPosts.length : data?.product_count || 0;

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-10 px-4 md:px-12">
      {feedOverlay.isOpen && (
        <PostDetailOverlay
          posts={feedOverlay.items}
          initialIndex={feedOverlay.initialIndex}
          onClose={() => setFeedOverlay({ ...feedOverlay, isOpen: false })}
          onDeleteSuccess={(postId) => {
            setUserPosts((prev) => prev.filter((p) => p.id !== postId));
            setLikedPosts((prev) => prev.filter((p) => p.id !== postId));
          }}
        />
      )}
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between py-3">
        <div className="flex items-center gap-1">
          <h1 className="font-bold text-xl">@{user.username || "profile"}</h1>
          <ChevronLeft size={16} className="-rotate-90 mt-1" />
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/create-content">
            <PlusSquare size={24} />
          </Link>
          <button onClick={() => navigate("/settings")}>
            <AlignJustify size={24} />
          </button>
        </div>
      </div>
      {/* Profile Header Section */}
      <header className="flex flex-col md:flex-row md:items-start md:gap-20 py-4 md:py-12 border-b-0 md:border-b border-gray-200">
        {/* Avatar and Stats for Mobile */}
        <div className="flex items-center justify-between md:justify-start md:w-1/3 mb-4 md:mb-0">
          <div className="relative group">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-20 h-20 md:w-36 md:h-36 rounded-full object-cover border border-gray-200 p-1"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/profile-icon.svg";
              }}
            />
          </div>

          {/* Stats - Mobile Only (IG Style: next to avatar) */}
          <div className="md:hidden flex-1 flex justify-around text-center ml-4">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{displayPostCount}</span>
              <span className="text-xs text-gray-500 uppercase tracking-tight font-medium">
                Posts
              </span>
            </div>
            <Link to={`/followers/${user.id || ""}`} className="flex flex-col">
              <span className="font-bold text-lg">
                {user.followers_count || 0}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-tight font-medium">
                Followers
              </span>
            </Link>
            <Link to={`/following/${user.id || ""}`} className="flex flex-col">
              <span className="font-bold text-lg">{followingCount}</span>
              <span className="text-xs text-gray-500 uppercase tracking-tight font-medium">
                Following
              </span>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="md:w-2/3 flex flex-col gap-4 md:gap-5">
          {/* Username and Settings - Desktop Only */}
          <div className="hidden md:flex items-center gap-2">
            <h2 className="text-xl font-normal">
              @{user.username || "unknown"}
            </h2>
            <Link to="/settings">
              <Settings className="cursor-pointer" size={24} />
            </Link>
          </div>

          {/* Stats - Desktop Only */}
          <div className="hidden md:flex gap-10">
            <div>
              <span className="font-semibold">{displayPostCount}</span> posts
            </div>
            <Link to={`/followers/${user.id || ""}`}>
              <div>
                <span className="font-semibold">
                  {user.followers_count || 0}
                </span>{" "}
                followers
              </div>
            </Link>
            <Link to={`/following/${user.id || ""}`}>
              <div>
                <span className="font-semibold">{followingCount}</span>{" "}
                following
              </div>
            </Link>
          </div>

          {/* Name and Bio */}
          <div className="space-y-0.5">
            <h3 className="font-bold text-[15px] md:text-base">
              {user.name || user.username || "Unnamed User"}
            </h3>
            <p className="text-[14px] leading-snug whitespace-pre-wrap">
              {user && user.bio
                ? user.bio
                : "Add a bio to let people know more about you and your products!"}
            </p>
            <div
              className="flex items-center gap-1 text-gray-500 text-sm py-1 cursor-pointer hover:text-lily transition-colors w-fit"
              onClick={() => {
                const profileUrl = `${window.location.origin}/profile/${user.id}`;
                navigator.clipboard.writeText(profileUrl);
                toast.success("Profile link copied!");
              }}
            >
              <IconLink size={14} className="text-blue-900" />
              <span className="text-blue-900 font-bold truncate max-w-[200px]">
                @{user.username || "unknown"}
              </span>
            </div>
          </div>

          {/* Location/Birthday - Desktop Only or refined for mobile */}
          <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>{user.location}</span>
              </div>
            )}
            {(user.birthdate || user.birthday) && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  Born{" "}
                  {new Date(user.birthdate || user.birthday).toLocaleDateString(
                    undefined,
                    {
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Action Buttons - Repositioned for IG Mobile Look */}
      <div className="flex flex-row gap-2 w-full py-2 border-t md:border-t-0 border-gray-100">
        <Link to="/editProfile" className="flex-1">
          <button className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">
            Edit profile
          </button>
        </Link>
        <button
          className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
          onClick={() => {
            const profileUrl = `${window.location.origin}/profile/${user.id}`;
            navigator.clipboard.writeText(profileUrl);
            toast.success("Profile link copied!");
          }}
        >
          Share profile
        </button>
        <button className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">
          <UserSquare size={20} className="mx-auto" />
        </button>
      </div>

      {/* Highlights */}
      <div className="flex gap-4 py-4 overflow-x-auto no-scrollbar">
        <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0">
          <div className="w-[64px] h-[64px] rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Plus size={28} className="text-gray-900" />
          </div>
          <span className="text-[11px] font-medium">New</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex md:justify-center border-t border-gray-200">
        <button
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-3 md:py-4 border-t-2 md:mx-6 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === 0
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(0)}
        >
          <Grid3x3 size={isMobile ? 24 : 16} />
          <span className="hidden md:inline">POSTS</span>
        </button>
        <button
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-3 md:py-4 border-t-2 md:mx-6 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === 1
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(1)}
        >
          <Bookmark size={isMobile ? 24 : 16} />
          <span className="hidden md:inline">SAVED</span>
        </button>
        <button
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-3 md:py-4 border-t-2 md:mx-6 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === 2
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(2)}
        >
          <UserSquare size={isMobile ? 24 : 16} />
          <span className="hidden md:inline">TAGGED</span>
        </button>
      </div>
      {/* Grid Content */}
      <div className="w-full pt-1">
        {activeTab === 0 && renderGrid(userPosts, postsLoading, "No posts yet")}
        {activeTab === 1 &&
          renderGrid(likedPosts, likedLoading, "No saved posts")}
        {activeTab === 2 && (
          <div className="w-full flex flex-col items-center py-20 text-gray-400">
            <UserSquare size={64} className="mb-4 opacity-20" />
            <p className="text-xl font-bold">Photos of you</p>
            <p className="text-sm">
              When people tag you in photos, they'll appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOwner;
