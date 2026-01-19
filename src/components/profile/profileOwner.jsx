// src/components/profile/profileOwner.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../redux/profileSlice";
import { fetchProducts, fetchLikedProducts } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoaderSd from "../loaders/loaderSd";
import {
  Grid3x3, LayoutGrid, Heart, Play, Eye, Settings,
  Link as IconLink, ChevronLeft, Store, Package,
  TrendingUp, BookmarkPlus, Share2
} from "lucide-react";

const API_BASE_URL = "https://lily-shop-backend.onrender.com";

const ProfileOwner = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);
  const { data, loading, error } = useSelector((state) => state.profile);

  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);

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
      const userId = data?.user?.id || data?.id;
      if (userId && activeTab === "posts") {
        setPostsLoading(true);
        try {
          const response = await fetchProducts({ user: userId });
          const postsData = Array.isArray(response) ? response : response.results || [];
          setUserPosts(postsData);
        } catch (err) {
          console.error("Failed to load user posts:", err);
        } finally {
          setPostsLoading(false);
        }
      }
    };

    if (data) loadUserPosts();
  }, [data, activeTab]);

  useEffect(() => {
    const loadLikedPosts = async () => {
      if (activeTab === "liked") {
        setLikedLoading(true);
        try {
          const response = await fetchLikedProducts();
          const likedData = Array.isArray(response) ? response : response.results || [];
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

  const profileImageUrl = user.profile_pic?.startsWith("http")
    ? user.profile_pic
    : user.profile_pic
    ? `${API_BASE_URL}/${user.profile_pic}`
    : "/profile-icon.svg";

  if (!auth?.isAuthenticated) return null;
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <LoaderSd />
    </div>
  );

  if (error) navigate("/login");
  if (!data) return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      <p>No profile data found.</p>
    </div>
  );

  const renderGrid = (items, isLoading, emptyMessage) => {
    if (isLoading) {
      return (
        <div className="flex justify-center my-12">
          <LoaderSd />
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center my-16 text-gray-400">
          <Package size={64} className="mb-4 opacity-30" />
          <p className="text-lg">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-3 gap-1 mt-1"
      >
        {items.map((post, i) => {
          const mediaSrc = post.image || post.media || post.media_url || "/placeholder.png";
          const isVideo = post.is_video || mediaSrc.endsWith(".mp4");

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/product-details/${post.id}`)}
              className="relative aspect-square overflow-hidden cursor-pointer group"
            >
              {isVideo ? (
                <video
                  src={mediaSrc}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt="Post"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart size={20} className="fill-white" />
                    <span className="font-semibold">{post.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={20} />
                    <span className="font-semibold">{post.views || 0}</span>
                  </div>
                </div>
              </div>

              {isVideo && (
                <div className="absolute top-2 right-2">
                  <Play size={20} className="text-white drop-shadow-lg" />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-semibold text-lg">
            {user.username || "Profile"}
          </h2>
          <div className="flex gap-3">
            <Link to="/settings">
              <Settings size={24} className="cursor-pointer" />
            </Link>
            <IconLink size={24} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white pb-4">
        <div className="px-4 pt-6">
          {/* Profile Pic & Basic Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-lily"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/profile-icon.svg";
                }}
              />
              <Link 
                to="/editProfile"
                className="absolute bottom-0 right-0 bg-lily text-white p-1.5 rounded-full shadow-lg"
              >
                <Settings size={14} />
              </Link>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-xl">
                {user.name || user.username || "User"}
              </h3>
              <p className="text-gray-500 text-sm">
                @{user.username || "username"}
              </p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {user.bio || "Add a bio to let people know more about you! ✨"}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-around py-4 border-t border-gray-200">
            <div className="text-center">
              <p className="font-bold text-2xl">{userPosts.length}</p>
              <p className="text-gray-600 text-sm">Posts</p>
            </div>
            <Link to="/followers" className="text-center">
              <p className="font-bold text-2xl">{user.follower_count || 0}</p>
              <p className="text-gray-600 text-sm">Followers</p>
            </Link>
            <Link to="/following" className="text-center">
              <p className="font-bold text-2xl">{user.following_count || 0}</p>
              <p className="text-gray-600 text-sm">Following</p>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Link to="/editProfile" className="flex-1">
              <button className="w-full py-2.5 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition">
                Edit Profile
              </button>
            </Link>
            <button className="w-full py-2.5 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition">
              Share Profile
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-3 gap-3 px-4 mt-4">
          <div className="bg-lily/10 rounded-xl p-3 text-center">
            <Store className="w-6 h-6 text-lily mx-auto mb-1" />
            <p className="text-xs text-gray-600">Shops</p>
            <p className="font-bold text-lily">{user.shop_count || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Sales</p>
            <p className="font-bold text-blue-600">0</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <BookmarkPlus className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Saved</p>
            <p className="font-bold text-purple-600">{likedPosts.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-30 bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "posts"
                ? "border-lily text-lily"
                : "border-transparent text-gray-500"
            }`}
          >
            <Grid3x3 size={20} />
            <span className="text-sm font-semibold">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "products"
                ? "border-lily text-lily"
                : "border-transparent text-gray-500"
            }`}
          >
            <Package size={20} />
            <span className="text-sm font-semibold">Products</span>
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "liked"
                ? "border-lily text-lily"
                : "border-transparent text-gray-500"
            }`}
          >
            <Heart size={20} />
            <span className="text-sm font-semibold">Saved</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white">
        <AnimatePresence mode="wait">
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderGrid(userPosts, postsLoading, "No posts yet")}
            </motion.div>
          )}
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderGrid(userPosts, postsLoading, "No products yet")}
            </motion.div>
          )}
          {activeTab === "liked" && (
            <motion.div
              key="liked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderGrid(likedPosts, likedLoading, "No saved items yet")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileOwner;
