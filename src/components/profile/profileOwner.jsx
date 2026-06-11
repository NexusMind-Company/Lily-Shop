import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { api } from "../../services/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LoaderSd from "../loaders/loaderSd";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Grid,
  Grid3X3,
  Megaphone,
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
} from "lucide-react";
import { handleLogout } from "../../redux/authSlice";
import PostDetailOverlay from "./PostDetailOverlay";

const API_BASE_URL = "//api.lilyshops.com";

const ProfileOwner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseInt(searchParams.get("tab") || "0", 10);
  const likedFilter = searchParams.get("filter") || "products";

  const setActiveTab = (tab) => {
    setSearchParams(
      (prev) => {
        prev.set("tab", tab);
        return prev;
      },
      { replace: true },
    );
  };

  const setLikedFilter = (filter) => {
    setSearchParams(
      (prev) => {
        prev.set("filter", filter);
        return prev;
      },
      { replace: true },
    );
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const auth = useSelector((state) => state.auth);
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useSelector((state) => state.profile);
  const user = profileData?.user || profileData || {};

  const [feedOverlay, setFeedOverlay] = useState({
    isOpen: false,
    items: [],
    initialIndex: 0,
  });

  // 1. Authenticated Profile Sync
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!auth?.isAuthenticated || !token) {
      navigate("/login", { replace: true });
    } else if (!profileData && !profileLoading) {
      dispatch(fetchProfile());
    }
  }, [auth?.isAuthenticated, navigate, profileData, profileLoading, dispatch]);

  // 2. Following Count Query
  const { data: followingCount = 0 } = useQuery({
    queryKey: ["user-following-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      if (user.following_count > 0) return user.following_count;

      try {
        const res = await api.get(`/auth/following/${user.id}/`);
        const followingData = Array.isArray(res.data)
          ? res.data
          : res.data?.following || res.data?.results || [];
        return followingData.length;
      } catch (err) {
        return 0;
      }
    },
    enabled: !!user?.id && auth?.isAuthenticated,
  });

  // 3. User Posts/Products Query
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["user-own-posts", user?.id],
    queryFn: async () => {
      let allPosts = [];

      // Fetch Products
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
                user.username ||
                "Unknown",
              userpic:
                item.shop?.logo ||
                item.user?.profile_pic ||
                user.profile_pic ||
                "/profile-icon.svg",
              user_id: item.shop?.vendor_id || item.user?.id || user.id,
              like_count: item.likes_count ?? item.like_count ?? item.likes,
              view_count: item.views ?? item.view_count ?? item.visit_count,
              comment_count:
                item.comments_count ?? item.comment_count ?? item.comments,
              is_liked: item.is_liked ?? item.has_liked,
            };
          }),
        ];
      } catch (err) {
        console.error("Failed to load products", err);
      }

      // Fetch Contents
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
              username: item.user?.username || user.username || "Unknown",
              userpic:
                item.user?.profile_pic ||
                user.profile_pic ||
                "/profile-icon.svg",
              user_id: item.user?.id || user.id,
              like_count: item.likes_count ?? item.like_count ?? item.likes,
              view_count: item.views ?? item.view_count ?? item.visit_count,
              comment_count:
                item.comments_count ?? item.comment_count ?? item.comments,
              is_liked: item.is_liked ?? item.has_liked,
            };
          }),
        ];
      } catch (err) {
        console.error("Failed to load contents", err);
      }

      return allPosts.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    },
    enabled: !!user?.id && auth?.isAuthenticated && activeTab === 0,
  });

  // 4. Liked Posts Query
  const { data: likedPosts = [], isLoading: likedLoading } = useQuery({
    queryKey: ["user-liked-posts", user?.id],
    queryFn: async () => {
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
                item.shop?.shop_name || item.user?.username || "Unknown",
              userpic:
                item.shop?.logo ||
                item.user?.profile_pic ||
                "/profile-icon.svg",
              user_id: item.shop?.vendor_id || item.user?.id,
              like_count: item.likes_count ?? item.like_count ?? item.likes,
              view_count: item.views ?? item.view_count ?? item.visit_count,
              comment_count:
                item.comments_count ?? item.comment_count ?? item.comments,
              is_liked: true,
            };
          }),
        ];
      } catch (err) {
        console.error("Failed to load liked products", err);
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
                item.shop?.shop_name || item.user?.username || "Unknown",
              userpic:
                item.shop?.logo ||
                item.user?.profile_pic ||
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
        console.error("Failed to load liked contents", err);
      }

      return allLiked.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    },
    enabled: !!user?.id && auth?.isAuthenticated && activeTab === 2,
  });

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

  const handleLogoutClick = () => {
    dispatch(handleLogout());
    navigate("/login");
  };

  if (!auth?.isAuthenticated) return null;

  if (profileLoading && !profileData)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <LoaderSd />
      </div>
    );

  if (profileError)
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load profile. Please try again.
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
          <Grid size={64} className="mb-4 opacity-20" />
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

              {/* Mobile View Count Overlay */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded md:hidden">
                <Eye size={12} />
                <span>{post.view_count || 0}</span>
              </div>

              {isVideo && (
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

  const displayPostCount =
    userPosts.length > 0 ? userPosts.length : user.product_count || 0;

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-10 px-4 md:px-12">
      {feedOverlay.isOpen && (
        <PostDetailOverlay
          posts={feedOverlay.items}
          initialIndex={feedOverlay.initialIndex}
          onClose={() => setFeedOverlay({ ...feedOverlay, isOpen: false })}
          onDeleteSuccess={(_postId) => {
            queryClient.invalidateQueries({
              queryKey: ["user-own-posts", user.id],
            });
          }}
        />
      )}
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between py-3">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={28} />
        </button>
        <div className="flex gap-4">
          <Link to="/settings">
            <Settings size={28} />
          </Link>
          <button onClick={handleLogoutClick}>
            <LogOut size={28} />
          </button>
        </div>
      </div>
      {/* Profile Header Section */}
      <header className="flex flex-col md:flex-row md:items-start md:gap-20 py-6 md:py-12 border-b-0 md:border-b border-gray-200">
        {/* Avatar */}
        <div className="flex justify-center md:w-1/3 mb-4 md:mb-0">
          <div className="relative group">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border border-gray-200 p-1"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/profile-icon.svg";
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="md:w-2/3 flex flex-col items-center text-center md:items-start md:text-left gap-1 md:gap-5">
          {/* Username and Settings - Desktop only username here */}
          <div className="hidden md:flex items-center gap-4">
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
          <div>
            <h3 className="font-bold text-lg md:text-xl">
              {user.name || user.full_name || user.username || "Unnamed User"}
            </h3>
            <div
              className="flex items-center justify-center md:justify-start gap-1 text-gray-400 text-sm mb-1 cursor-pointer hover:text-lily transition-colors w-fit mx-auto md:mx-0"
              onClick={() => {
                const profileUrl = `${window.location.origin}/profile/${user.id}`;
                navigator.clipboard.writeText(profileUrl);
                toast.success("Profile link copied!");
              }}
            >
              {" "}
              <span className="font-medium text-gray-400">
                @{user.username || "unknown"}
              </span>
              <IconLink size={14} />
            </div>
            <p className="text-sm whitespace-pre-wrap leading-tight text-gray-800 font-medium">
              {user && user.bio
                ? user.bio
                : "Add a bio to let people know more about you and your products!"}
            </p>
          </div>

          {/* Location/Birthday */}
          {(user.location || user.birthdate || user.birthday) && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-gray-400">
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
                    {new Date(
                      user.birthdate || user.birthday,
                    ).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Stats - Mobile Only */}
      <div className="md:hidden flex justify-center gap-12 py-4 text-center">
        <div className="flex flex-col">
          <span className="font-bold text-2xl">{displayPostCount}</span>
          <span className="text-gray-400 text-sm">Posts</span>
        </div>
        <Link to={`/followers/${user.id || ""}`} className="flex flex-col">
          <span className="font-bold text-2xl">
            {user.followers_count || 0}
          </span>
          <span className="text-gray-400 text-sm">Followers</span>
        </Link>
        <Link to={`/following/${user.id || ""}`} className="flex flex-col">
          <span className="font-bold text-2xl">{followingCount}</span>
          <span className="text-gray-400 text-sm">Following</span>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row gap-4 w-full py-4">
        <Link to="/editProfile" className="flex-1 order-1">
          <button className="w-full h-full py-2 md:py-3 border-2 md:border-[3px] border-[#4CAF50] md:border-lily text-[#4CAF50] md:text-lily rounded-2xl text-[17px] md:text-xl font-bold md:font-black leading-tight flex items-center justify-center text-center transition-all hover:bg-lily/5">
            Edit
            <span className="md:hidden">
              <br />
            </span>{" "}
            Profile
          </button>
        </Link>

        {user?.vendor_id ? (
          <Link to="/vendor-dashboard" className="flex-1 order-2">
            <button className="w-full h-full py-2 md:py-3 border-2 md:border-[3px] border-[#FF9800] md:border-lily text-[#FF9800] md:text-lily rounded-2xl text-[17px] md:text-xl font-bold md:font-black leading-tight flex items-center justify-center text-center transition-all hover:bg-lily/5">
              Vendor Dashboard
            </button>
          </Link>
        ) : (
          <Link to="/create-vendor" className="flex-1 order-2">
            <button className="w-full h-full py-2 md:py-3 border-2 md:border-[3px] border-lily md:border-lily text-lily md:text-lily rounded-2xl text-[17px] md:text-xl font-bold md:font-black leading-tight flex items-center justify-center text-center transition-all hover:bg-lily/5">
              Become a Vendor
            </button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex md:justify-center border-t border-gray-100 mt-2">
        <button
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-4 md:py-4 border-b-2 md:border-b-0 md:border-t-2 md:mx-6 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === 0
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(0)}
        >
          <Grid3X3 size={24} />
        </button>
        <button
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-4 md:py-4 border-b-2 md:border-b-0 md:border-t-2 md:mx-6 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === 1
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(1)}
        >
          <Megaphone size={24} />
        </button>
        <button
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-4 md:py-4 border-b-2 md:border-b-0 md:border-t-2 md:mx-6 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === 2
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
          onClick={() => setActiveTab(2)}
        >
          <Heart size={24} />
        </button>
      </div>
      {/* Grid Content */}
      <div className="w-full pt-1">
        {activeTab === 0 && renderGrid(userPosts, postsLoading, "No posts yet")}
        {activeTab === 1 && (
          <div className="w-full flex flex-col items-center py-20 text-gray-400">
            <Megaphone size={64} className="mb-4 opacity-20" />
            <p className="text-xl font-bold">No promotions</p>
            <p className="text-sm">
              Your active ads and promotions will appear here.
            </p>
          </div>
        )}
        {activeTab === 2 && (
          <div className="w-full">
            <div className="flex justify-center gap-4 py-4">
              <button
                onClick={() => setLikedFilter("products")}
                className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  likedFilter === "products"
                    ? "bg-lily text-white shadow-md shadow-lily/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setLikedFilter("contents")}
                className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  likedFilter === "contents"
                    ? "bg-lily text-white shadow-md shadow-lily/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Posts
              </button>
            </div>
            {renderGrid(
              likedPosts.filter((item) =>
                likedFilter === "products"
                  ? item.itemType === "product"
                  : item.itemType === "content",
              ),
              likedLoading,
              likedFilter === "products"
                ? "No liked products"
                : "No liked posts",
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOwner;
