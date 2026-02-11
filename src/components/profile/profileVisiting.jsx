// src/components/profile/profileVisiting.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchPublicProfile, followUser } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3x3, Heart, Eye, EllipsisVertical, ChevronLeft,
  MessageCircle, Flag, Ban, Play, Package, CheckCircle2,
  UserPlus, UserCheck, Share2
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

const ProfileVisiting = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const navigate = useNavigate();
  const { username } = useParams();
  const { user_data } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user_data) {
      if (String(user_data.id) === String(username) || user_data.username === username) {
        navigate("/profile");
        return;
      }
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchPublicProfile(username);
        
        const normalizedData = {
          user: {
            ...result,
            ...result.user,
            full_name: result.full_name || result.user?.full_name || result.username || "User",
            username: result.username || result.user?.username,
            profile_pic: result.profile_pic || result.user?.profile_pic,
            bio: result.bio || result.user?.bio,
            followers_count: result.follower_count || result.followers_count || 0,
            following_count: result.following_count || 0,
            verified: result.verified || false,
          },
          products: result.products || result.posts || result.user?.products || [],
        };

        setData(normalizedData);
        setIsFollowing(result.is_following || false);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    if (username) loadData();
  }, [username, user_data, navigate]);

  const handleFollow = async () => {
    if (!data?.user?.username || followLoading) return;
    
    setFollowLoading(true);
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      await followUser(data.user.username);
    } catch (err) {
      console.error("Follow failed", err);
      setIsFollowing(previousState);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lily"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-lily font-semibold"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  const { user = {}, products = [] } = data;

  const renderGrid = (items, emptyMessage) => {
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
        className="grid grid-cols-3 gap-1"
      >
        {items.map((post, i) => {
          const mediaSrc = post.image || post.images?.[0]?.image || "/placeholder.png";
          const isVideo = post.is_video || post.video;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/product-details/${post.id}`)}
              className="relative aspect-square overflow-hidden cursor-pointer group"
            >
              <img
                src={mediaSrc}
                alt="Post"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

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
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              <EllipsisVertical size={24} />
            </button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 bg-white border rounded-xl shadow-lg z-50 w-48 overflow-hidden"
                >
                  <button className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-50">
                    <Flag size={18} className="mr-3" /> Report
                  </button>
                  <button className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                    <Ban size={18} className="mr-3" /> Block User
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
                src={user.profile_pic || "/user.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
              {user.verified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl">
                  {user.full_name || user.username || "User"}
                </h3>
                {user.verified && (
                  <CheckCircle2 size={18} className="text-blue-500" />
                )}
              </div>
              <p className="text-gray-500 text-sm">
                @{user.username || "username"}
              </p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {user.bio || "No bio yet."}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-around py-4 border-t border-b border-gray-200">
            <div className="text-center">
              <p className="font-bold text-2xl">{products.length}</p>
              <p className="text-gray-600 text-sm">Posts</p>
            </div>
            <Link to={`/followers/${user.username}`} className="text-center">
              <p className="font-bold text-2xl">{user.followers_count || 0}</p>
              <p className="text-gray-600 text-sm">Followers</p>
            </Link>
            <Link to={`/following/${user.username}`} className="text-center">
              <p className="font-bold text-2xl">{user.following_count || 0}</p>
              <p className="text-gray-600 text-sm">Following</p>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                isFollowing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-lily text-white hover:bg-darklily"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={18} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Follow
                </>
              )}
            </motion.button>

            <Link to={`/messages/new?user=${user.id}`} className="flex-1">
              <button className="w-full py-2.5 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <MessageCircle size={18} />
                Message
              </button>
            </Link>

            <button className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              <Share2 size={18} />
            </button>
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
              {renderGrid(products, "No posts yet")}
            </motion.div>
          )}
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderGrid(products, "No products yet")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileVisiting;