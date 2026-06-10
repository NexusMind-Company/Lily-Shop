import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api, fetchPublicProfile, followUser } from "../../services/api";
import { fetchProfile } from "../../redux/profileSlice";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import PostDetailOverlay from "./PostDetailOverlay";
import { ProfileHeaderSkeleton } from "../common/skeletons";

const ProfileVisiting = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [feedOverlay, setFeedOverlay] = useState({
    isOpen: false,
    items: [],
    initialIndex: 0,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { userId, username } = useParams();
  const profileIdentifier = userId || username;

  const { user_data } = useSelector((state) => state.auth);

  // Redirect if visiting own profile
  useEffect(() => {
    if (user_data && profileIdentifier) {
      if (
        String(user_data.id) === String(profileIdentifier) ||
        user_data.username === profileIdentifier
      ) {
        navigate("/profile");
      }
    }
  }, [user_data, profileIdentifier, navigate]);

  // Query 1: Fetch the basic public profile
  const {
    data: profileResult,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["public-profile", profileIdentifier],
    queryFn: () => fetchPublicProfile(profileIdentifier),
    enabled: !!profileIdentifier,
    staleTime: 60 * 1000,
  });

  const targetId = useMemo(() => {
    return profileResult?.id || profileResult?.user?.id || profileIdentifier;
  }, [profileResult, profileIdentifier]);

  // Query 2: Fetch contents and products using IDs from the profile
  const { data: secondaryData, isLoading: secondaryLoading } = useQuery({
    queryKey: ["public-profile-secondary", targetId],
    queryFn: async () => {
      let fetchedPosts = [];
      let fetchedProducts = [];
      let actualFollowingCount =
        profileResult?.following_count ||
        profileResult?.user?.following_count ||
        0;

      // Fallback for following count if 0
      if (actualFollowingCount === 0 && targetId) {
        try {
          const followingRes = await api.get(`/auth/following/${targetId}/`);
          const followingData = Array.isArray(followingRes.data)
            ? followingRes.data
            : followingRes.data?.following || followingRes.data?.results || [];
          actualFollowingCount = followingData.length;
        } catch (err) {
          console.warn("Could not fetch following count fallback", err);
        }
      }

      // Extract raw items from profile
      const rawFallbackPosts =
        profileResult?.posted_contents ||
        profileResult?.contents ||
        profileResult?.user?.posted_contents ||
        [];
      const rawFallbackProducts =
        profileResult?.posted_products ||
        profileResult?.products ||
        profileResult?.user?.posted_products ||
        [];

      // Extract IDs
      const contentIds = rawFallbackPosts
        .map((p) => p.id || p.content?.id || (typeof p === "string" ? p : null))
        .filter(Boolean);
      const productIds = rawFallbackProducts
        .map((p) => p.id || p.product?.id || (typeof p === "string" ? p : null))
        .filter(Boolean);

      // Fetch Detailed Contents
      if (contentIds.length > 0) {
        try {
          const contentPromises = contentIds.map((id) =>
            api.get(`/shops/contents/${id}/`).catch(() => null),
          );
          const contentResponses = await Promise.all(contentPromises);

          fetchedPosts = contentResponses
            .filter((res) => res?.data)
            .map((res) => {
              const p = res.data;
              const item = p.content || p;
              return {
                ...item,
                itemType: "content",
                type: "content",
                username:
                  item.user?.username || profileResult?.username || "Unknown",
                userpic:
                  item.user?.profile_pic ||
                  profileResult?.profile_pic ||
                  "/profile-icon.svg",
                like_count: item.likes_count ?? item.like_count ?? item.likes,
                view_count: item.views ?? item.view_count ?? item.visit_count,
                comment_count: item.comment_count,
                is_liked: item.is_liked ?? item.has_liked,
              };
            });
        } catch (err) {
          console.warn("Failed fetching detailed contents", err);
        }
      }

      // Fallback if detailed fetch failed or returned nothing
      if (fetchedPosts.length === 0 && rawFallbackPosts.length > 0) {
        fetchedPosts = rawFallbackPosts.map((p) => {
          const item = p.content || p;
          return {
            ...item,
            itemType: "content",
            type: "content",
            username:
              item.user?.username || profileResult?.username || "Unknown",
            userpic:
              item.user?.profile_pic ||
              profileResult?.profile_pic ||
              "/profile-icon.svg",
            like_count: item.likes_count ?? item.like_count ?? item.likes,
            view_count: item.views ?? item.view_count ?? item.visit_count,
            comment_count: item.comment_count,
            is_liked: item.is_liked ?? item.has_liked,
          };
        });
      }

      // Fetch Detailed Products
      if (productIds.length > 0) {
        try {
          const productPromises = productIds.map((id) =>
            api.get(`/shops/products/${id}/`).catch(() => null),
          );
          const productResponses = await Promise.all(productPromises);

          fetchedProducts = productResponses
            .filter((res) => res?.data)
            .map((res) => {
              const p = res.data;
              const item = p.product || p;
              return {
                ...item,
                itemType: "product",
                type: "product",
                username:
                  item.shop?.shop_name ||
                  item.user?.username ||
                  profileResult?.username ||
                  "Unknown",
                userpic:
                  item.shop?.logo ||
                  item.user?.profile_pic ||
                  profileResult?.profile_pic ||
                  "/profile-icon.svg",
                like_count: item.likes_count ?? item.like_count ?? item.likes,
                view_count: item.views ?? item.view_count ?? item.visit_count,
                comment_count:
                  item.comments_count ?? item.comment_count ?? item.comments,
                is_liked: item.is_liked ?? item.has_liked,
              };
            });
        } catch (err) {
          console.warn("Failed fetching detailed products", err);
        }
      }

      // Fallback if detailed fetch failed or returned nothing
      if (fetchedProducts.length === 0 && rawFallbackProducts.length > 0) {
        fetchedProducts = rawFallbackProducts.map((p) => {
          const item = p.product || p;
          return {
            ...item,
            itemType: "product",
            type: "product",
            username:
              item.shop?.shop_name ||
              item.user?.username ||
              profileResult?.username ||
              "Unknown",
            userpic:
              item.shop?.logo ||
              item.user?.profile_pic ||
              profileResult?.profile_pic ||
              "/profile-icon.svg",
            like_count: item.likes_count ?? item.like_count ?? item.likes,
            view_count: item.views ?? item.view_count ?? item.visit_count,
            comment_count:
              item.comments_count ?? item.comment_count ?? item.comments,
            is_liked: item.is_liked ?? item.has_liked,
          };
        });
      }

      return {
        posts: fetchedPosts,
        products: fetchedProducts,
        following_count: actualFollowingCount,
      };
    },
    enabled: !!profileResult && !!targetId,
    staleTime: 60 * 1000,
  });

  // Consolidate final data
  const data = useMemo(() => {
    if (!profileResult) return null;
    return {
      user: {
        ...profileResult,
        ...profileResult.user,
        id: targetId,
        full_name:
          profileResult.full_name ||
          profileResult.user?.full_name ||
          profileResult.username ||
          "User",
        username: profileResult.username || profileResult.user?.username,
        profile_pic:
          profileResult.profile_pic || profileResult.user?.profile_pic,
        bio: profileResult.bio || profileResult.user?.bio,
        followers_count:
          profileResult.follower_count || profileResult.followers_count || 0,
        following_count:
          secondaryData?.following_count || profileResult.following_count || 0,
        verified: profileResult.verified || false,
      },
      posts: secondaryData?.posts || [],
      products: secondaryData?.products || [],
    };
  }, [profileResult, targetId, secondaryData]);

  // Sync isFollowing state
  useEffect(() => {
    if (profileResult) {
      const checkIsFollowing =
        profileResult.is_following === true ||
        String(profileResult.is_following).toLowerCase() === "true" ||
        profileResult.user?.is_following === true ||
        String(profileResult.user?.is_following).toLowerCase() === "true";
      setIsFollowing(checkIsFollowing);
    }
  }, [profileResult]);

  const handleFollow = async () => {
    const followId = data?.user?.id || profileIdentifier;
    if (!followId || followLoading) return;

    setFollowLoading(true);
    const newState = !isFollowing;

    // Optimistic update
    setIsFollowing(newState);

    try {
      const response = await followUser(followId);
      const responseMsg = response?.message?.toLowerCase() || "";

      if (responseMsg.includes("unfollow") && newState === true) {
        setIsFollowing(false);
      } else if (
        responseMsg.includes("follow") &&
        !responseMsg.includes("unfollow") &&
        newState === false
      ) {
        setIsFollowing(true);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["public-profile", profileIdentifier],
      });
      // Also refresh authenticated profile to sync following counts
      dispatch(fetchProfile());
    } catch (err) {
      setIsFollowing(!newState);
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const loading = profileLoading || (!!profileResult && secondaryLoading);

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
                  setFeedOverlay({
                    isOpen: true,
                    items: items,
                    initialIndex: i,
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
                  <Eye size={20} /> {item.view_count || 0}
                </div>
              </div>

              {/* Mobile View Count Overlay */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded md:hidden">
                <Eye size={12} />
                <span>{item.view_count || 0}</span>
              </div>

              {isVideo && (
                <div className="absolute top-2 right-2 text-white">
                  <Play size={18} fill="white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <ProfileHeaderSkeleton />;

  if (profileError)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center px-4">
          <p className="text-red-500 mb-4 font-semibold">
            Failed to load profile
          </p>
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

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-10 px-4 md:px-12 bg-white">
      {feedOverlay.isOpen && (
        <PostDetailOverlay
          posts={feedOverlay.items}
          initialIndex={feedOverlay.initialIndex}
          onClose={() => setFeedOverlay({ ...feedOverlay, isOpen: false })}
        />
      )}
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between py-3 border-b border-gray-100 mb-2">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={28} />
        </button>
        <h1 className="font-bold text-lg">@{user.username || "profile"}</h1>
        <div className="flex gap-4">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            <EllipsisVertical size={24} />
          </button>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-start md:gap-20 py-6 md:py-12">
        {/* Avatar */}
        <div className="flex justify-start md:justify-center md:w-1/3 mb-4 md:mb-0">
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
        </div>

        {/* Info */}
        <div className="md:w-2/3 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-normal">
                @{user.username || "unknown"}
              </h2>
              <MoreHorizontal
                className="cursor-pointer hidden md:block"
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
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              {user.full_name || user.username || "User"}
            </h3>
            <div
              className="flex items-center gap-1 text-gray-500 text-sm mb-1 cursor-pointer hover:text-lily transition-colors w-fit"
              onClick={() => {
                const profileUrl = `${window.location.origin}/profile/${user.id}`;
                navigator.clipboard.writeText(profileUrl);
                toast.success("Profile link copied!");
              }}
            >
              <IconLink size={14} />
              <span>@{user.username || "unknown"}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-tight">
              {user.bio || "No bio yet."}
            </p>
          </div>
        </div>
      </header>

      {/* Stats - Mobile Only */}
      <div className="md:hidden flex justify-around py-4 border-t border-b border-gray-100 text-center mb-4">
        <div className="flex flex-col">
          <span className="font-bold">{posts.length}</span>
          <span className="text-gray-400 text-xs">posts</span>
        </div>
        <Link to={`/followers/${user.id || ""}`} className="flex flex-col">
          <span className="font-bold">{user.followers_count || 0}</span>
          <span className="text-gray-400 text-xs">followers</span>
        </Link>
        <Link to={`/following/${user.id || ""}`} className="flex flex-col">
          <span className="font-bold">{user.following_count || 0}</span>
          <span className="text-gray-400 text-xs">following</span>
        </Link>
      </div>

      {/* Action Buttons - Repositioned */}
      <div className="flex flex-row gap-2.5 w-full py-4 border-t md:border-t-0 border-gray-100 mb-4">
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`flex-1 py-3 border-2 rounded-lg text-base font-extrabold transition-colors ${
            isFollowing
              ? "bg-gray-100 border-gray-100 text-gray-700 hover:bg-gray-200"
              : "border-lily text-lily hover:bg-lily/5"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>

        <Link to={`/messages/new?user=${user.id}`} className="flex-1">
          <button className="w-full py-3 border-2 border-lily text-lily hover:bg-lily/5 rounded-lg text-base font-extrabold transition-colors">
            Message
          </button>
        </Link>

        <button className="px-4 py-3 border-2 border-lily text-lily hover:bg-lily/5 rounded-lg text-base font-extrabold transition-colors">
          <Share2 size={18} className="mx-auto" />
        </button>
      </div>
      {/* Tabs */}
      <div className="flex md:justify-center border-t border-gray-200">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-4 md:mx-10 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all border-t-2 ${
            activeTab === "posts"
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
        >
          <Grid3x3 size={16} /> <span className="hidden md:inline">POSTS</span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-4 md:mx-10 uppercase text-[10px] md:text-xs tracking-widest font-semibold transition-all border-t-2 ${
            activeTab === "products"
              ? "border-lily text-lily"
              : "border-transparent text-gray-400"
          }`}
        >
          <Package size={16} />{" "}
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
