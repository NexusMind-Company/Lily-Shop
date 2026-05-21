import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api, fetchPublicProfile, followUser } from "../../services/api";
import { fetchProfile } from "../../redux/profileSlice";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
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
  MoreHorizontal,
  Link as IconLink,
  MapPin,
  Calendar,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ProfileFeedViewer from "./profileFeedViewer";
import PostDetailOverlay from "./PostDetailOverlay";

const ProfileVisiting = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [feedOverlay, setFeedOverlay] = useState({
    isOpen: false,
    items: [],
    initialIndex: 0,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
              comment_count: item.comment_count,
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

      if (responseMsg.includes("unfollow") && newState === true) {
        setIsFollowing(false);
        setData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            followers_count: Math.max(0, (prev.user.followers_count || 0) - 2),
          },
        }));
      } else if (
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
      } else if (response && typeof response.is_following !== "undefined") {
        setIsFollowing(
          response.is_following === true ||
            String(response.is_following).toLowerCase() === "true",
        );
      }

      dispatch(fetchProfile());
    } catch (err) {
      console.error("Follow failed", err);
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
        <div className="text-center px-4">
          <p className="text-red-500 mb-4 font-semibold">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-lily text-white rounded-full font-bold"
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
        <div className="flex flex-col items-center my-24 text-gray-400">
          <Package size={64} className="mb-4 opacity-20" />
          <p className="text-xl font-bold">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-1 md:gap-0 my-2 pt-1">
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
            <div
              key={item.id || i}
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
              className="relative aspect-square overflow-hidden cursor-pointer group bg-gray-100"
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
                  className="w-full h-full object-cover"
                />
              )}

              {/* Desktop Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-6 text-white font-bold hidden md:flex">
                <div className="flex items-center gap-2">
                  <Heart fill="white" size={20} /> {item.like_count || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={20} /> {item.view_count || item.visit_count || 0}
                </div>
              </div>

              {isVideo && (
                <div className="absolute top-2 right-2 text-white md:hidden">
                  <Play size={18} fill="white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-10 px-4 md:px-12 bg-white">
      {feedOverlay.isOpen && (
        <PostDetailOverlay
          posts={feedOverlay.items}
          initialIndex={feedOverlay.initialIndex}
          onClose={() => setFeedOverlay({ ...feedOverlay, isOpen: false })}
          onDeleteSuccess={(postId) => {
            // This is visiting profile, but if the visitor owns the post (e.g. tagged?),
            // we might want to refresh. For now just handle it gracefully.
            if (window.location.reload) {
              // Or just let it close.
            }
          }}
        />
      )}
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between py-3 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="mr-1">
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-bold text-xl">@{user.username || "profile"}</h1>
          <ChevronLeft size={16} className="-rotate-90 mt-1" />
        </div>
        <div className="flex gap-4">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            <EllipsisVertical size={24} />
          </button>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-start md:gap-20 py-4 md:py-12">
        {/* Avatar and Stats for Mobile */}
        <div className="flex items-center justify-between md:justify-start md:w-1/3 mb-4 md:mb-0">
          <div className="relative">
            <img
              src={user.profile_pic || "/user.png"}
              alt="Profile"
              className="w-20 h-20 md:w-36 md:h-36 rounded-full object-cover border border-gray-200 p-1"
            />
            {user.verified && (
              <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white">
                <CheckCircle2 size={12} className="md:w-4 md:h-4" />
              </div>
            )}
          </div>

          {/* Stats - Mobile Only (IG Style: next to avatar) */}
          <div className="md:hidden flex-1 flex justify-around text-center ml-4">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{posts.length}</span>
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
              <span className="font-bold text-lg">
                {user.following_count || 0}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-tight font-medium">
                Following
              </span>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="md:w-2/3 flex flex-col gap-4 md:gap-5">
          <div className="hidden md:flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-normal">
                @{user.username || "unknown"}
              </h2>
              <MoreHorizontal
                className="cursor-pointer"
                size={24}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            </div>
          </div>

          {/* Stats - Desktop Only */}
          <div className="hidden md:flex gap-10">
            <div>
              <span className="font-semibold">{posts.length}</span> posts
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
                <span className="font-semibold">
                  {user.following_count || 0}
                </span>{" "}
                following
              </div>
            </Link>
          </div>

          {/* Name and Bio */}
          <div className="space-y-0.5">
            <h3 className="font-bold text-[15px] md:text-base">
              {user.full_name || user.username || "User"}
            </h3>
            <p className="text-[14px] leading-snug whitespace-pre-wrap">
              {user.bio || "No bio yet."}
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
        </div>
      </header>

      {/* Action Buttons - Repositioned for IG Mobile Look */}
      <div className="flex flex-row gap-2 w-full py-2 border-t md:border-t-0 border-gray-100 mb-4">
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            isFollowing
              ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
              : "bg-lily text-white hover:opacity-90"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>

        <Link to={`/messages/new?user=${user.id}`} className="flex-1">
          <button className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">
            Message
          </button>
        </Link>

        <button
          className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
          onClick={() => {
            const profileUrl = `${window.location.origin}/profile/${user.id}`;
            navigator.clipboard.writeText(profileUrl);
            toast.success("Profile link copied!");
          }}
        >
          <Share2 size={18} className="mx-auto" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex md:justify-center border-t border-gray-200">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-3 md:py-4 border-t-2 md:mx-10 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === "posts"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Grid3x3 size={isMobile ? 24 : 16} />{" "}
          <span className="hidden md:inline">POSTS</span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-3 md:py-4 border-t-2 md:mx-10 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all ${
            activeTab === "products"
              ? "border-black text-black"
              : "border-transparent text-gray-400"
          }`}
        >
          <Package size={isMobile ? 24 : 16} />{" "}
          <span className="hidden md:inline">PRODUCTS</span>
        </button>
      </div>

      <div className="w-full">
        {activeTab === "posts" && renderGrid(posts, "No posts yet")}
        {activeTab === "products" && renderGrid(products, "No products yet")}
      </div>

      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {dropdownOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setDropdownOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl overflow-hidden w-full max-w-sm z-10"
            >
              <button className="w-full py-4 text-red-600 font-bold border-b border-gray-100 hover:bg-gray-50">
                Block
              </button>
              <button className="w-full py-4 text-red-600 font-bold border-b border-gray-100 hover:bg-gray-50">
                Report
              </button>
              <button
                className="w-full py-4 border-b border-gray-100 hover:bg-gray-50"
                onClick={() => setDropdownOpen(false)}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileVisiting;
