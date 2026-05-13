import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api, fetchPublicProfile, followUser } from "../../services/api";
import { fetchProfile } from "../../redux/profileSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3x3,
  Heart,
  Eye,
  EllipsisVertical,
  ChevronLeft,
  MessageCircle,
  Flag,
  Ban,
  Play,
  Package,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Share2,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ProfileFeedViewer from "./profileFeedViewer";

const ProfileVisiting = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [feedOverlay, setFeedOverlay] = useState({
    isOpen: false,
    items: [],
    initialIndex: 0,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userId, username } = useParams();
  const profileIdentifier = userId || username;

  const { user_data } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!profileIdentifier) return;

    if (user_data) {
      if (
        String(user_data.id) === String(profileIdentifier) ||
        user_data.username === profileIdentifier
      ) {
        navigate("/profile");
        return;
      }
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchPublicProfile(profileIdentifier);
        const targetId = result.id || result.user?.id || profileIdentifier;

        let actualFollowingCount =
          result.following_count || result.user?.following_count || 0;

        if (actualFollowingCount === 0) {
          try {
            const followingRes = await api.get(`/auth/following/${targetId}/`);
            const followingData = Array.isArray(followingRes.data)
              ? followingRes.data
              : followingRes.data?.following ||
                followingRes.data?.results ||
                [];
            actualFollowingCount = followingData.length;
          } catch (err) {
            console.warn("Could not fetch following count fallback", err);
          }
        }

        let fetchedPosts = [];
        let fetchedProducts = [];

        try {
          const [postsRes, productsRes] = await Promise.all([
            api.get(`/shops/contents/${targetId}`),
            api.get(`/shops/products/${targetId}/`),
          ]);

          const rawPosts = postsRes.data?.results || postsRes.data || [];
          fetchedPosts = rawPosts.map((p) => {
            const item = p.content || p;
            return {
              ...item,
              itemType: "content",
              type: "content",
              username: item.user?.username || result.username || "Unknown",
              userpic:
                item.user?.profile_pic ||
                result.profile_pic ||
                "/profile-icon.svg",
              like_count: item.likes_count ?? item.like_count ?? item.likes,
              view_count: item.views ?? item.view_count ?? item.visit_count,
              comment_count:item.comment_count,
              is_liked: item.is_liked ?? item.has_liked,
            };
          });

          const rawProducts =
            productsRes.data?.results || productsRes.data || [];
          fetchedProducts = rawProducts.map((p) => {
            const item = p.product || p;
            return {
              ...item,
              itemType: "product",
              type: "product",
              username:
                item.shop?.shop_name ||
                item.user?.username ||
                result.username ||
                "Unknown",
              userpic:
                item.shop?.logo ||
                item.user?.profile_pic ||
                result.profile_pic ||
                "/profile-icon.svg",
              like_count: item.likes_count ?? item.like_count ?? item.likes,
              view_count: item.views,
              comment_count:
                item.comments_count ?? item.comment_count ?? item.comments,
              is_liked: item.is_liked ?? item.has_liked,
            };
          });
        } catch (err) {
          console.warn(
            "Could not fetch user contents/products, falling back to profile data",
            err,
          );
          fetchedPosts =
            result.posted_contents ||
            result.contents ||
            result.user?.posted_contents ||
            [];
          fetchedProducts =
            result.posted_products ||
            result.products ||
            result.user?.posted_products ||
            [];
        }

        const normalizedData = {
          user: {
            ...result,
            ...result.user,
            id: targetId,
            full_name:
              result.full_name ||
              result.user?.full_name ||
              result.username ||
              "User",
            username: result.username || result.user?.username,
            profile_pic: result.profile_pic || result.user?.profile_pic,
            bio: result.bio || result.user?.bio,
            followers_count:
              result.follower_count || result.followers_count || 0,
            following_count: actualFollowingCount,
            verified: result.verified || false,
          },
          posts: fetchedPosts,
          products: fetchedProducts,
        };

        // Robust parsing to catch strings, booleans, and nested payload variations
        const checkIsFollowing =
          result.is_following === true ||
          String(result.is_following).toLowerCase() === "true" ||
          result.user?.is_following === true ||
          String(result.user?.is_following).toLowerCase() === "true" ||
          result.is_followed === true ||
          String(result.is_followed).toLowerCase() === "true";

        setData(normalizedData);
        setIsFollowing(checkIsFollowing);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    loadData();
  }, [profileIdentifier, user_data, navigate]);

  const handleFollow = async () => {
    const targetId =
      data?.user?.id || data?.user?.username || profileIdentifier;
    if (!targetId || followLoading) return;

    setFollowLoading(true);
    const previousState = isFollowing;
    const newState = !isFollowing;

    // Optimistic Update
    setIsFollowing(newState);
    setData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        followers_count: Math.max(
          0,
          (prev.user.followers_count || 0) + (newState ? 1 : -1),
        ),
      },
    }));

    try {
      const response = await followUser(targetId);

      const responseMsg = response?.message?.toLowerCase() || "";

      // Hard-sync: If backend successfully unfollowed but our optimistic UI is true
      if (responseMsg.includes("unfollow") && newState === true) {
        setIsFollowing(false);
        setData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            followers_count: Math.max(0, (prev.user.followers_count || 0) - 2),
          },
        }));
      }
      // Hard-sync: If backend successfully followed but our optimistic UI is false
      else if (
        responseMsg.includes("follow") &&
        !responseMsg.includes("unfollow") &&
        newState === false
      ) {
        setIsFollowing(true);
        setData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            followers_count: (prev.user.followers_count || 0) + 2,
          },
        }));
      }
      // Fallback to explicit flag if message check fails
      else if (response && typeof response.is_following !== "undefined") {
        setIsFollowing(
          response.is_following === true ||
            String(response.is_following).toLowerCase() === "true",
        );
      }

      dispatch(fetchProfile());
    } catch (err) {
      console.error("Follow failed", err);
      // Revert Optimistic Update on error
      setIsFollowing(previousState);
      setData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          followers_count: Math.max(
            0,
            (prev.user.followers_count || 0) + (previousState ? 1 : -1),
          ),
        },
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lily"></div>
      </div>
    );

  if (error)
    return (
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

  const { user = {}, posts = [], products = [] } = data;

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
        className="grid grid-cols-3 gap-3 my-2 px-4"
      >
        {items.map((item, i) => {
          const mediaSrc =
            item.image_url ||
            item.media_url ||
            item.media ||
            item.image ||
            item.images?.[0]?.image ||
            "/placeholder.png";

          const isVideo =
            item.is_video ||
            item.video ||
            item.post_type === "VIDEO" ||
            (typeof mediaSrc === "string" && mediaSrc.endsWith(".mp4"));

          return (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (activeTab === "products") {
                  navigate(`/product-details/${item.id}`);
                } else {
                  const clickedIndex = items.findIndex((p) => p.id === item.id);
                  setFeedOverlay({
                    isOpen: true,
                    items: items,
                    initialIndex: clickedIndex !== -1 ? clickedIndex : 0,
                  });
                }
              }}
              className="relative rounded-lg overflow-hidden cursor-pointer bg-black"
            >
              {isVideo ? (
                <video
                  src={mediaSrc}
                  className="w-full aspect-square object-cover"
                  muted
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt="Post"
                  className="w-full aspect-square object-cover"
                />
              )}

              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={24} className="text-white" />
                </div>
              )}

              <div className="absolute bottom-1 left-1 flex items-center text-white text-xs bg-black/40 px-1 rounded">
                <Eye size={15} className="mr-1" />
                {item.views || item.view_count || item.visit_count || 0}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {feedOverlay.isOpen && (
        <ProfileFeedViewer
          posts={feedOverlay.items}
          initialIndex={feedOverlay.initialIndex}
          onClose={() => setFeedOverlay({ ...feedOverlay, isOpen: false })}
        />
      )}
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

      <div className="bg-white pb-4">
        <div className="px-4 pt-6">
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

          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {user.bio || "No bio yet."}
          </p>

          <div className="flex items-center justify-around py-4 border-t border-b border-gray-200">
            <div className="text-center">
              <p className="font-bold text-2xl">{posts.length}</p>
              <p className="text-gray-600 text-sm">Posts</p>
            </div>
            <Link to={`/followers/${user.id || ""}`} className="text-center">
              <p className="font-bold text-2xl">{user.followers_count || 0}</p>
              <p className="text-gray-600 text-sm">Followers</p>
            </Link>
            <Link to={`/following/${user.id || ""}`} className="text-center">
              <p className="font-bold text-2xl">{user.following_count || 0}</p>
              <p className="text-gray-600 text-sm">Following</p>
            </Link>
          </div>

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

      <div className="bg-white">
        <AnimatePresence mode="wait">
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderGrid(posts, "No posts yet")}
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
