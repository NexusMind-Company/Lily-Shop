import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Camera,
  SendHorizontal,
  EllipsisVertical,
  Phone,
  ChevronLeft,
  Heart,
  Eye,
  Play,
  ShoppingCart,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchConversationMessages,
  sendMessageToUser,
  clearConversation,
  fetchConversations,
} from "../../redux/messageConversationSlice";
import { fetchPublicProfile } from "../../services/api";
import { addToCart } from "../../redux/cartSlice";
import { fetchOrders, selectOrders } from "../../redux/orderSlice";

import { api } from "../../services/api";
import MessagesList from "./messagesList";

const OrderMessageCard = ({ payload, isMine }) => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

  const firstItem = payload.items?.[0] || {};
  const product = firstItem.product || {};
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  // Try to find image
  const imageUrl = product.image_url || product.media?.[0]?.file || "/placeholder.png";

  const address = payload.delivery_address || {};

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  
  const orderIdKey = payload.order_id || payload.reference;
  const [hasDispatched, setHasDispatched] = useState(() => localStorage.getItem(`dispatched_${orderIdKey}`) === 'true');
  const [hasDelivered, setHasDelivered] = useState(() => localStorage.getItem(`delivered_${orderIdKey}`) === 'true');

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const fileInputRef = useRef(null);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const handleOpenDispute = async () => {
    if (!disputeReason) {
      toast.error("Please select a reason for the dispute.");
      return;
    }
    setIsSubmittingDispute(true);
    try {
      await api.post(`/api/orders/${orderIdKey}/dispute/`, { reason: disputeReason });
      toast.success("Dispute opened successfully. An admin will review.");
      setShowDisputeModal(false);
      setDisputeReason("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to open dispute.");
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const rawStatus = orders?.find(o => o.id === orderIdKey || o.reference === orderIdKey)?.status || "pending";
  const buyerStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !orderIdKey) return;

    setIsUploadingVideo(true);
    try {
      const { data } = await api.get(`/api/orders/${orderIdKey}/unboxing-upload-url/`);
      const uploadUrl = data?.upload_url || data?.url || (typeof data === 'string' ? data : null);
      
      if (!uploadUrl) {
          throw new Error("Invalid upload URL received from server");
      }

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      await api.post(`/api/orders/${orderIdKey}/unboxing-video/confirm/`);
      toast.success("Unboxing video uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeliveredClick = () => {
    setShowStatusMenu(false);
    setShowPinModal(true);
  };

  const handleConfirmDelivery = async () => {
    if (!pin) {
      toast.error("Please enter the PIN provided by the buyer");
      return;
    }
    const idToUpdate = payload.order_id || payload.reference;
    try {
      if (idToUpdate) {
        await api.post(`/orders/orders/${idToUpdate}/confirm-delivery/`, { pin, gps_lat: 0, gps_lng: 0 });
      }
      toast.success("Delivery confirmed securely!");
      localStorage.setItem(`delivered_${idToUpdate}`, 'true');
      setHasDelivered(true);
      setShowPinModal(false);
      setPin("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm delivery");
    }
  };

  const handleDispatchUpdate = async (statusLabel) => {
    setShowStatusMenu(false);
    const idToUpdate = payload.order_id || payload.reference;
    try {
      if (idToUpdate) {
        await api.post(`/orders/orders/${idToUpdate}/dispatch/`);
      }
      toast.success(`Order marked as ${statusLabel}`);
      localStorage.setItem(`dispatched_${idToUpdate}`, 'true');
      setHasDispatched(true);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to mark as ${statusLabel}`);
    }
  };

  const handleStatusUpdate = async (status) => {
    setShowStatusMenu(false);
    toast.error(`Action '${status}' is not supported in P2P flow yet.`);
  };
  
  return (
    <div className={`flex flex-col rounded-3xl overflow-hidden w-[280px] sm:w-[300px] shadow-sm mb-2 ${isMine ? "bg-[#E8F5E9]" : "bg-[#FCE4EC]"}`}>
      <div className="w-full h-64 relative bg-gray-100 p-2">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
      </div>

      <div className="p-4 flex flex-col gap-1.5 text-sm text-gray-800">
        <p>Order no: {payload.reference}</p>
        <p className="font-bold text-base mt-1">{product.name || firstItem.product_name || "Product"}</p>
        {product.caption && <p className="text-gray-500 text-xs line-clamp-2">{product.caption}</p>}
        <p>₦{((firstItem.price_kobo || 0) / 100).toLocaleString()}</p>
        <p>Qty: {firstItem.quantity || 1}</p>
        {(firstItem.color || firstItem.variant) && <p>Color: {firstItem.color || firstItem.variant}</p>}
        <p>Delivery fee: ₦{Number(payload.delivery_fee || 0).toLocaleString()}</p>
        {payload.estimated_time && (
          <p className="text-pink-600 font-medium">ETA: {payload.estimated_time}</p>
        )}
        
        {payload.delivery_type === "pickup" ? (
           <>
             <p className="font-bold mt-2 text-[13px]">Pickup location</p>
             <p className="font-bold">{payload.pickup_location?.name || "Pickup center"}</p>
             <p>{payload.pickup_location?.address}</p>
           </>
        ) : (
          <>
            <p className="font-bold mt-2 text-[13px]">Delivery address</p>
            {typeof address === 'string' ? (
              <p>{address}</p>
            ) : (
              <>
                <p className="font-bold">{address.name || payload.buyer_name || payload.customer_name || "Customer"} {address.phone || payload.phone || ""}</p>
                <p>{address.street || address.address || "No address provided"}</p>
                
                {address.landmark && (
                  <>
                    <p className="font-bold mt-2 text-[13px]">Nearest landmark</p>
                    <p>{address.landmark}</p>
                  </>
                )}
                
                {address.description && (
                  <>
                    <p className="font-bold mt-2 text-[13px]">Location description</p>
                    <p>{address.description}</p>
                  </>
                )}
              </>
            )}
          </>
        )}

        <div className="mt-4 relative">
          {isMine ? (
             <>
               <button className="w-full py-2.5 rounded-full border-2 border-green-500 text-green-600 font-bold bg-transparent">
                 {buyerStatus}
               </button>
               {buyerStatus === "Delivered" && (
                 <div className="mt-2 space-y-2">
                   <input 
                     type="file" 
                     accept="video/*" 
                     className="hidden" 
                     ref={fileInputRef} 
                     onChange={handleVideoUpload} 
                   />
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     disabled={isUploadingVideo}
                     className="w-full py-2.5 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                   >
                     {isUploadingVideo ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                     ) : (
                        <Camera className="w-5 h-5" />
                     )}
                     {isUploadingVideo ? "Uploading..." : "Upload Unboxing Video"}
                   </button>
                   
                   <button
                     onClick={() => setShowDisputeModal(true)}
                     className="w-full py-2.5 rounded-full bg-lily text-white font-bold hover:bg-lily/90 transition-colors"
                   >
                     Report Issue
                   </button>
                 </div>
               )}
             </>
          ) : (
             <>
               <button 
                 className="w-full py-2.5 mb-2 rounded-full border-2 border-gray-400 text-gray-500 font-bold bg-transparent"
                 disabled
               >
                 Current Status: {hasDelivered ? "Delivered" : (hasDispatched ? (payload.delivery_type === "pickup" ? "Available for pickup" : "Dispatched") : "Pending")}
               </button>
               {!hasDelivered && (
                 <button 
                   onClick={() => setShowStatusMenu(!showStatusMenu)}
                   className="w-full py-2.5 rounded-full border-2 border-pink-400 text-pink-500 font-bold bg-transparent"
                 >
                   Change order status
                 </button>
               )}

               {showStatusMenu && (
                 <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                   {!hasDelivered && (
                     <button onClick={handleDeliveredClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-left border-b border-gray-50">
                       <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                       <span className="font-medium text-gray-700">Delivered</span>
                     </button>
                   )}
                   {!hasDispatched && !hasDelivered && (
                     <button onClick={() => handleDispatchUpdate('Dispatched')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-left border-b border-gray-50">
                       <ShoppingCart className="w-5 h-5 text-gray-700" />
                       <span className="font-medium text-gray-700">Available for pickup</span>
                     </button>
                   )}
                   <button onClick={() => handleStatusUpdate('cancelled')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-left border-b border-gray-50">
                     <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     <span className="font-medium text-gray-700">Canceled</span>
                   </button>
                   <button onClick={() => handleStatusUpdate('refunded')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-left">
                     <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                     <span className="font-medium text-gray-700">Refunded</span>
                   </button>
                 </div>
               )}
             </>
          )}
        </div>

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Report an Issue</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please select the reason for opening this dispute.
              </p>
              
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 mb-6 focus:border-lily focus:ring-0 outline-none font-medium text-gray-700"
              >
                <option value="" disabled>Select a reason...</option>
                <option value="item_not_received">Item not received</option>
                <option value="item_damaged">Item damaged</option>
                <option value="item_not_as_described">Item not as described</option>
                <option value="wrong_item_sent">Wrong item sent</option>
                <option value="seller_fraud">Seller fraud</option>
              </select>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenDispute}
                  disabled={isSubmittingDispute || !disputeReason}
                  className="flex-1 py-3 font-bold text-white bg-lily rounded-xl hover:bg-lily/90 disabled:opacity-50"
                >
                  {isSubmittingDispute ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Enter Delivery PIN</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Ask the buyer for their 4-digit PIN to confirm delivery.
              </p>
              
              <div className="flex justify-center mb-2">
                <ShoppingCart className="w-12 h-12 text-lily/20" />
              </div>
              
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-center text-2xl font-bold tracking-widest mb-4 focus:border-lily focus:ring-0 outline-none"
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowPinModal(false);
                    setPin("");
                  }}
                  className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelivery}
                  disabled={pin.length < 4}
                  className="flex-1 py-3 font-bold text-white bg-lily rounded-xl hover:bg-lily/90 disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SharedProductCard = ({ product, isMine }) => {
  const dispatch = useDispatch();
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product_id: product.id, quantity: 1 }));
    toast.success("Added to cart");
  };

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden max-w-[280px] shadow-lg ${isMine ? "bg-pink-50" : "bg-pink-100"}`}
    >
      <div className="relative aspect-square w-full">
        <img
          src={
            product.image_url || product.media?.[0]?.file || "/lily-logo.jpg"
          }
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-lily font-bold text-sm shadow-sm">
          ₦{Number(product.price || 0).toLocaleString()}
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-bold text-gray-900 text-sm truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            {product.like_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {product.view_count || 0}
          </span>
        </div>
        <div className="flex gap-2 pt-1">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 bg-white text-lily text-center py-2 rounded-xl text-xs font-bold border border-pink-200 hover:bg-pink-50 transition-colors"
          >
            Buy Now
          </Link>
          <button
            onClick={handleAddToCart}
            className="bg-lily text-white p-2 rounded-xl hover:bg-lily/90 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SharedContentCard = ({ content, isMine }) => {
  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden max-w-[280px] shadow-lg ${isMine ? "bg-pink-50" : "bg-pink-100"}`}
    >
      <div className="relative aspect-square w-full group">
        <img
          src={content.media || "/lily-logo.jpg"}
          alt="Shared content"
          className="w-full h-full object-cover"
        />
        {content.is_video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        {content.caption && (
          <p className="text-sm text-gray-800 line-clamp-2">
            {content.caption}
          </p>
        )}
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            {content.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {content.views || 0}
          </span>
        </div>
        <Link
          to={`/product/${content.id}`}
          className="block w-full bg-white text-lily text-center py-2 rounded-xl text-xs font-bold border border-pink-200 hover:bg-pink-50 transition-colors"
        >
          View Post
        </Link>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const menuRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const {
    messages: conversation,
    conversations,
    loading,
    sending,
    currentPage,
    nextPage,
  } = useSelector((state) => state.messages);
  const { user_data } = useSelector((state) => state.auth);
  const currentUserId = user_data?.id || user_data?.user?.id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the actual conversation from Redux to extract the other user's ID
  const targetConversation = conversations.find((c) => {
    const otherUser = c.other_user || (String(c.buyer?.id) === String(currentUserId) ? c.seller : c.buyer);
    return String(c.id) === String(conversationId) || String(otherUser?.id) === String(conversationId);
  });

  const otherUserId = targetConversation?.other_user?.id || 
                      (String(targetConversation?.buyer?.id) === String(currentUserId) 
                        ? targetConversation?.seller?.id 
                        : targetConversation?.buyer?.id) || 
                      conversationId;

  const { data: fetchedUserProfile } = useQuery({
    queryKey: ["public-profile", otherUserId],
    queryFn: () => fetchPublicProfile(otherUserId),
    enabled: !!otherUserId,
  });

  // Helper to format last seen or show online
  const formatUserStatus = (lastSeen) => {
    if (!lastSeen) return { text: "Online", isOnline: true };

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeenDate) / 60000);

    // If active within last 5 minutes, show as Online
    if (diffInMinutes < 5) {
      return { text: "Online", isOnline: true };
    }

    // Format last seen time
    if (diffInMinutes < 60) {
      return { text: `Last seen ${diffInMinutes}m ago`, isOnline: false };
    }

    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) {
      return { text: `Last seen ${hours}h ago`, isOnline: false };
    }

    return {
      text: `Last seen ${lastSeenDate.toLocaleDateString()}`,
      isOnline: false,
    };
  };

  // Find recipient data from fetched profile, conversations list, or messages
  const recipientData = useMemo(() => {
    // 1. Prioritize freshly fetched profile data
    if (fetchedUserProfile) {
      const statusInfo = formatUserStatus(fetchedUserProfile.last_seen);
      return {
        name: fetchedUserProfile.username || fetchedUserProfile.name || "User",
        role: fetchedUserProfile.vendor_id ? "Vendor" : "Customer",
        profilePic: fetchedUserProfile.profile_pic,
        statusText: statusInfo.text,
        isOnline: statusInfo.isOnline,
      };
    }

    // 2. Fallback to conversations list (from metadata)
    const convFromList = conversations.find(
      (c) =>
        String(c.other_user?.id) === String(conversationId) ||
        String(c.buyer?.id) === String(conversationId) ||
        String(c.seller?.id) === String(conversationId),
    );

    if (convFromList) {
      const otherUser =
        convFromList.other_user ||
        (String(convFromList.buyer?.id) === String(currentUserId)
          ? convFromList.seller
          : convFromList.buyer);
      const role =
        String(convFromList.buyer?.id) === String(currentUserId)
          ? "Vendor"
          : "Customer";

      return {
        name:
          otherUser?.username ||
          otherUser?.name ||
          otherUser?.full_name ||
          "Chat",
        role,
        profilePic: otherUser?.profile_pic,
        statusText: "Online", // Default fallback
        isOnline: true,
      };
    }

    // 3. Fallback to messages
    if (conversation && conversation.length > 0) {
      const otherMessage = conversation.find(
        (msg) => String(msg.sender_id) === String(conversationId),
      );
      if (otherMessage) {
        return {
          name:
            otherMessage.sender_username || otherMessage.sender_name || "Chat",
          role: null,
          statusText: "Online",
          isOnline: true,
        };
      }
    }

    return { name: "Chat", role: null, statusText: "Online", isOnline: true };
  }, [
    fetchedUserProfile,
    conversations,
    conversation,
    conversationId,
    currentUserId,
  ]);

  // Reverse messages for display (since backend returns newest first)
  const displayMessages = useMemo(() => {
    return [...conversation].reverse();
  }, [conversation]);

  // Ensure conversations list is loaded for metadata
  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(fetchConversations());
    }
  }, [conversations.length, dispatch]);

  // Fetch orders once when entering chat to satisfy any OrderMessageCard requirements
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Handle message fetching and polling
  useEffect(() => {
    dispatch(clearConversation());

    if (conversationId) {
      dispatch(
        fetchConversationMessages({ userId: conversationId, page: 1 }),
      ).catch((error) => {
        console.error("Error fetching conversation messages:", error);
      });

      // Polling for new messages every 5 seconds
      const interval = setInterval(() => {
        try {
          dispatch(
            fetchConversationMessages({ userId: conversationId, page: 1 }),
          );
        } catch (error) {
          console.error("Error fetching conversation messages:", error);
        }
      }, 25000);

      return () => clearInterval(interval);
    }
  }, [conversationId, dispatch]);

  //  Auto scroll bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  //  Load more messages on scroll top
  const handleScroll = () => {
    const top = chatBoxRef.current.scrollTop;
    if (top === 0 && nextPage && !isFetchingMore) {
      setIsFetchingMore(true);

      dispatch(
        fetchConversationMessages({
          userId: conversationId,
          page: currentPage + 1,
        }),
      ).then(() => {
        setTimeout(() => {
          chatBoxRef.current.scrollTop = 10;
          setIsFetchingMore(false);
        }, 100);
      });
    }
  };

  //  Send Message
  const handleSend = () => {
    if (!newMessage.trim()) return;

    dispatch(sendMessageToUser({ userId: conversationId, content: newMessage }))
      .then(() => {
        setNewMessage("");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  const handleFileSelect = (e) => {
    console.log("Selected files:", Array.from(e.target.files));
  };

  return (
    <div className="fixed inset-0 md:left-64 flex bg-gray-50 z-20">
      {/* Desktop Messages List Sidebar */}
      <div className="hidden md:flex w-[350px] border-r border-gray-200 bg-white h-full flex-col shrink-0">
        <MessagesList />
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-4 bg-white shadow-sm z-20 relative">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden border border-pink-200">
            {recipientData.profilePic ? (
              <img
                src={recipientData.profilePic}
                alt={recipientData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-pink-600 font-bold">
                {recipientData.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 leading-tight">
                {recipientData.name}
              </h2>
              {recipientData.role && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                  {recipientData.role}
                </span>
              )}
            </div>
            <p
              className={`text-[10px] font-semibold flex items-center gap-1 ${
                recipientData.isOnline ? "text-green-600" : "text-gray-500"
              }`}
            >
              {recipientData.isOnline && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              )}
              {recipientData.statusText}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() =>
              toast("Voice call coming soon", {
                icon: "📞",
              })
            }
          >
            <Phone className="h-7 w-7 text-gray-600" />
          </button>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)}>
              <EllipsisVertical className="h-7 w-7 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => {
                    navigate(`/profile/${conversationId}`);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    toast.success("User reported successfully");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
                >
                  Report User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && displayMessages.length === 0 ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : displayMessages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet.</p>
        ) : (
          displayMessages.map((msg) => {
            const isMine = typeof msg.is_me === "boolean" ? msg.is_me : (String(msg.sender_id) === String(currentUserId));

            // Check for order payload first
            if (
              typeof msg.content === "string" &&
              msg.content.startsWith("[ORDER_PAYLOAD]:")
            ) {
              try {
                const payload = JSON.parse(msg.content.replace("[ORDER_PAYLOAD]:", ""));
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <OrderMessageCard payload={payload} isMine={isMine} />
                  </div>
                );
              } catch (e) {
                console.error("Failed to parse order payload", e);
              }
            }

            // Check for shared product from backend
            if (msg.product) {
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <SharedProductCard product={msg.product} isMine={isMine} />
                </div>
              );
            }

            // Check for shared content object
            if (msg.shared_content) {
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <SharedContentCard content={msg.shared_content} isMine={isMine} />
                </div>
              );
            }

            // Check for shared content (custom prefix)
            if (
              typeof msg.content === "string" &&
              msg.content.startsWith("LILY_SHARE:")
            ) {
              try {
                const sharedData = JSON.parse(
                  msg.content.replace("LILY_SHARE:", ""),
                );
                if (sharedData.type === "shared_content") {
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <SharedContentCard content={sharedData} isMine={isMine} />
                    </div>
                  );
                }
              } catch (e) {
                console.error("Failed to parse shared content", e);
              }
            }

            // Code for order payload was moved above

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] w-fit p-3 rounded-2xl text-sm break-words ${
                    isMine
                      ? "bg-lily text-white rounded-br-none"
                      : "bg-pink-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.is_system_message && (
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      System Message
                    </p>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  
                  <p className="text-[10px] mt-1 opacity-70 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 relative bg-white p-3 flex items-center space-x-2 border-t">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-200 rounded-full px-4 py-2 focus:outline-none"
        />

        <button
          className="absolute right-[15%] text-gray-500"
          onClick={() => fileInputRef.current.click()}
        >
          <Camera className="h-8 w-8" />
        </button>

        <button onClick={handleSend} disabled={sending}>
          <SendHorizontal
            className={`h-8 w-8 ${
              sending ? "text-gray-400" : "text-lily"
            } transition-all`}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
