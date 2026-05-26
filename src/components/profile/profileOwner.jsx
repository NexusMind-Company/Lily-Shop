import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
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
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../../redux/authSlice";
import PostDetailOverlay from "./PostDetailOverlay";

const ProfileOwner = () => {
  const [activeTab, setActiveTab] = useState(0);
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

      return allLiked;
    },
    enabled: !!user?.id && auth?.isAuthenticated && activeTab === 1,
  });

  const handleLogoutClick = () => {
    dispatch(handleLogout());
    navigate("/login");
  };

  if (profileLoading) return <LoaderSd />;
  if (profileError)
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load profile. Please try again.
      </div>
    );

  const renderGrid = (items, loading, emptyMessage) => {
    if (loading)
      return <div className="py-10 text-center text-gray-500">Loading...</div>;
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Grid size={24} className="opacity-20" />
          </div>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-1">
        {items.map((post, index) => {
          const mediaSrc =
            post.image_url || post.media || post.image || "/placeholder.png";
          const isVideo =
            post.is_video ||
            (typeof mediaSrc === "string" && mediaSrc.endsWith(".mp4"));

          return (
            <div
              key={post.id || index}
              onClick={() =>
                setFeedOverlay({ isOpen: true, items, initialIndex: index })
              }
              className="relative aspect-square overflow-hidden cursor-pointer group bg-gray-100"
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

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-6 text-white font-bold hidden md:flex">
                <div className="flex items-center gap-2">
                  <Heart fill="white" size={20} /> {post.like_count || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={20} /> {post.view_count || 0}
                </div>
              </div>

              {/* Mobile Overlay */}
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

  return (
    <div className="w-full max-w-4xl mx-auto min-h-screen pb-20 px-4 md:px-0">
      {feedOverlay.isOpen && (
        <PostDetailOverlay
          posts={feedOverlay.items}
          initialIndex={feedOverlay.initialIndex}
          onClose={() => setFeedOverlay({ ...feedOverlay, isOpen: false })}
          onDeleteSuccess={(deletedId) => {
            // Refetch posts query
            queryClient.invalidateQueries({
              queryKey: ["user-own-posts", user.id],
            });
          }}
        />
      )}

      {/* Header - Desktop */}
      <header className="hidden md:flex items-center justify-between py-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings size={24} />
          </Link>
          <button
            onClick={handleLogoutClick}
            className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Profile Info Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 py-6 md:py-10">
        <div className="relative group">
          <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={user.profile_pic || "/user.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <Link
            to="/editProfile"
            className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-2 bg-lily text-white rounded-full shadow-md hover:bg-lily/90 transition-colors"
          >
            <Settings size={16} />
          </Link>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h2 className="text-2xl font-bold">
              @{user.username || "username"}
            </h2>
            <div className="flex gap-2">
              <Link to="/editProfile">
                <button className="px-6 py-1.5 border border-gray-300 rounded-md font-semibold text-sm hover:bg-gray-50">
                  Edit profile
                </button>
              </Link>
              {user.is_staff && (
                <Link to="/lilyshop/workers">
                  <button className="px-4 py-1.5 bg-black text-white rounded-md font-semibold text-sm hover:bg-black/90">
                    Staff Panel
                  </button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-8 text-sm md:text-base">
            <div>
              <span className="font-bold">{userPosts.length}</span> posts
            </div>
            <Link to="/followers" className="hover:underline">
              <div>
                <span className="font-bold">{user.followers_count || 0}</span>{" "}
                followers
              </div>
            </Link>
            <Link to="/following" className="hover:underline">
              <div>
                <span className="font-bold">{followingCount}</span> following
              </div>
            </Link>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold">{user.full_name || "Lily User"}</h3>
            <p className="text-sm text-gray-600 max-w-md">
              {user.bio || "No bio yet."}
            </p>
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-900 font-semibold flex items-center justify-center md:justify-start gap-1"
              >
                <IconLink size={14} />{" "}
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-gray-200">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-t-2 transition-colors ${
            activeTab === 0
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Grid3X3 size={16} /> Posts
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-t-2 transition-colors ${
            activeTab === 1
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Heart size={16} /> Liked
        </button>
      </div>

      {/* Grid Content */}
      <div className="pt-4">
        {activeTab === 0 &&
          renderGrid(
            userPosts,
            postsLoading,
            "No posts yet. Share something with the community!",
          )}
        {activeTab === 1 &&
          renderGrid(
            likedPosts,
            likedLoading,
            "You haven't liked any products yet.",
          )}
      </div>
    </div>
  );
};

export default ProfileOwner;
