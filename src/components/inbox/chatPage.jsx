import { useState, useRef, useEffect, useMemo } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
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
  Reply,
  Copy,
  Edit2,
  Share,
  X,
  CheckCheck,
  Check,
  Clock,
  Search,
  ShieldCheck,
  Truck,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchConversationMessages,
  sendMessageToUser,
  clearConversation,
  fetchConversations,
  markMessageAsRead,
} from "../../redux/messageConversationSlice";
import { fetchPublicProfile } from "../../services/api";
import { addToCart } from "../../redux/cartSlice";
import { fetchOrders, selectOrders } from "../../redux/orderSlice";
import ImageEditor from "./ImageEditor";

import { api, confirmOrderReceipt, confirmFoodOrderReceipt, editMessage } from "../../services/api";
import MessagesList from "./messagesList";

export const OrderMessageCard = ({ payload, isMine, otherUserName }) => {
  const orders = useSelector(selectOrders);

  const firstItem = payload.items?.[0] || {};
  const product = firstItem.product || firstItem.menu_item || {};
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [liveOrderData, setLiveOrderData] = useState(null);
  
  // Try to find image
  const imageUrl = product.image_url || product.media?.[0]?.file || product.media || "/placeholder.png";

  const activePayload = liveOrderData || payload;
  const address = activePayload.delivery_address || {};
  const orderUser = activePayload.user;
  
  // Format the buyer's name based on the API response structure
  const buyerFullName = orderUser && (orderUser.first_name || orderUser.last_name) 
    ? `${orderUser.first_name || ""} ${orderUser.last_name || ""}`.trim() 
    : null;
  const buyerDisplayName = buyerFullName ? `${buyerFullName} (@${orderUser.username})` : (orderUser?.username ? `@${orderUser.username}` : null);

  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [isUpdatingDispatch, setIsUpdatingDispatch] = useState(false);

  const orderIdKey = payload.order_id || payload.reference;
  const cleanOrderId =
    typeof orderIdKey === "string" && orderIdKey.startsWith("order-")
      ? orderIdKey.replace(/^order-/, "")
      : orderIdKey;

  const targetOrderId =
    liveOrderData?.id || payload.order_id || payload.id || cleanOrderId || payload.reference;
  const vendorOrderUrl = targetOrderId
    ? `/vendor/orders/${targetOrderId}`
    : `/vendor/dashboard/orders`;

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

  useEffect(() => {
    if (orderIdKey) {
      api
        .get(`/orders/${orderIdKey}/`)
        .then((res) => {
          if (res.data) setLiveOrderData(res.data);
        })
        .catch(() => {
          if (cleanOrderId && cleanOrderId !== orderIdKey) {
            api
              .get(`/orders/${cleanOrderId}/`)
              .then((res) => {
                if (res.data) setLiveOrderData(res.data);
              })
              .catch(() => {});
          }
        });
    }
  }, [orderIdKey, cleanOrderId]);

  const rawStatus = (
    liveOrderData?.status ||
    activePayload?.status ||
    orders?.find(
      (o) =>
        String(o.id) === String(orderIdKey) ||
        String(o.reference) === String(orderIdKey)
    )?.status ||
    "paid"
  ).toLowerCase();

  const buyerStatus =
    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).replace(/_/g, " ");

  const isCompletedOrDelivered = [
    "delivered",
    "completed",
    "refunded",
    "cancelled",
    "failed",
  ].includes(rawStatus);
  const isDispatched = [
    "dispatched",
    "out_for_delivery",
    "ready_for_pickup",
  ].includes(rawStatus);
  const canBuyerConfirm = [
    "out_for_delivery",
    "dispatched",
    "delivered",
    "ready_for_pickup",
  ].includes(rawStatus);
  const hasDelivered = [
    "delivered",
    "completed",
  ].includes(rawStatus);

  const handleBuyerConfirmReceipt = async () => {
    const idToUpdate =
      liveOrderData?.id ||
      payload.order_id ||
      payload.id ||
      cleanOrderId ||
      payload.reference;

    if (!idToUpdate) return;
    setIsConfirmingReceipt(true);
    try {
      if (activePayload?.order_type === "food") {
        await confirmFoodOrderReceipt(idToUpdate);
      } else {
        await confirmOrderReceipt(idToUpdate);
      }
      toast.success("Receipt confirmed! Funds have been released to the vendor 🎉");
      setLiveOrderData((prev) => ({
        ...(prev || payload),
        status: "completed",
      }));
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to confirm delivery"
      );
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

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

  const handleDispatchUpdate = async (statusLabel) => {
    setShowStatusMenu(false);
    setIsUpdatingDispatch(true);
    const idToUpdate =
      liveOrderData?.id ||
      payload.order_id ||
      payload.id ||
      cleanOrderId ||
      payload.reference;

    try {
      if (idToUpdate) {
        if (activePayload?.order_type === "food") {
          await api.patch(`/foods/vendor/orders/${idToUpdate}/status/`, {
            status: "out_for_delivery",
          });
        } else {
          try {
            await api.post(`/orders/${idToUpdate}/dispatch/`);
          } catch (postErr) {
            await api.patch(`/orders/${idToUpdate}/update-status/`, {
              status: "out_for_delivery",
            });
          }
        }
      }
      toast.success(`Order marked as ${statusLabel}! Buyer has been notified.`);
      setLiveOrderData((prev) => ({
        ...(prev || payload),
        status: "out_for_delivery",
      }));
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          `Failed to mark as ${statusLabel}`
      );
    } finally {
      setIsUpdatingDispatch(false);
    }
  };

  const handleAcceptOrder = async () => {
    const idToUpdate = payload.order_id || payload.reference;
    try {
      if (idToUpdate && idToUpdate !== "N/A" && !idToUpdate.toString().startsWith("ORD")) {
        await api.put(`/foods/vendor/orders/${idToUpdate}/status/`, { status: "accepted" }).catch(() => {});
      }
      toast.success("Order Accepted! Customer notified that Mama is preparing their order 🍲");
      setLiveOrderData(prev => ({ ...(prev || payload), status: "accepted" }));
    } catch (err) {
      toast.error("Failed to accept order");
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
        <p className="font-bold text-base mt-1">{payload.meal_plan || product.name || firstItem.product_name || "Product"}</p>
        {product.caption && <p className="text-gray-500 text-xs line-clamp-2">{product.caption}</p>}
        <p>
          ₦
          {(
            (firstItem.price_kobo ? Number(firstItem.price_kobo) / 100 : null) ||
            (firstItem.subtotal_kobo ? Number(firstItem.subtotal_kobo) / 100 : null) ||
            (firstItem.price ? Number(firstItem.price) : null) ||
            (firstItem.unit_price ? Number(firstItem.unit_price) : null) ||
            (product.price ? Number(product.price) : null) ||
            (product.price_naira ? Number(product.price_naira) : null) ||
            (activePayload.total ? Number(activePayload.total) : 0)
          ).toLocaleString()}
        </p>
        <p>Qty: {firstItem.quantity || 1}</p>
        {(firstItem.color || firstItem.variant) && <p>Color: {firstItem.color || firstItem.variant}</p>}
        <p>Delivery fee: ₦{Number(activePayload.delivery_fee || 0).toLocaleString()}</p>
        {(activePayload.estimated_delivery_time || activePayload.estimated_time) && (
          <p className="text-pink-600 font-medium">ETA: {activePayload.estimated_delivery_time || activePayload.estimated_time}</p>
        )}
        
        {activePayload.delivery_type === "pickup" ? (
           <>
             <p className="font-bold mt-2 text-[13px]">Pickup location</p>
             <p className="font-bold">{activePayload.pickup_location?.name || "Pickup center"}</p>
             <p>{activePayload.pickup_location?.address}</p>
           </>
        ) : (
          <>
            <p className="font-bold mt-2 text-[13px] border-t border-gray-200 pt-2">Delivery Details</p>
            {typeof address === 'string' ? (
              <p>{address}</p>
            ) : (
              <div className="flex flex-col gap-0.5 mt-1 text-[13px]">
                <p><span className="text-gray-500 font-medium mr-1">Name:</span>{buyerDisplayName || address.name || (activePayload.buyer_name && activePayload.buyer_name !== "Customer" ? activePayload.buyer_name : null) || activePayload.customer_name || otherUserName || "Customer"}</p>
                <p><span className="text-gray-500 font-medium mr-1">Phone:</span>{address.phone_number || address.phone || activePayload.buyer_phone || activePayload.phone || "Not provided"}</p>
                <p><span className="text-gray-500 font-medium mr-1">Address:</span>{address.street_address || address.street || address.address || "Not provided"}</p>
                
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
              </div>
            )}
          </>
        )}

        <div className="mt-4 relative">
          {isMine ? (
             <>
               <button className="w-full py-2.5 mb-2 rounded-full border-2 border-green-500 text-green-600 font-bold bg-transparent">
                 {buyerStatus}
               </button>
               {canBuyerConfirm &&
                 rawStatus !== "completed" &&
                 rawStatus !== "cancelled" &&
                 rawStatus !== "refunded" &&
                 activePayload.status !== "completed" &&
                 activePayload.status !== "cancelled" &&
                 activePayload.status !== "refunded" && (
                   <button
                     onClick={handleBuyerConfirmReceipt}
                     disabled={isConfirmingReceipt}
                     className="w-full py-2.5 mb-2 rounded-full bg-lily text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-lily/20"
                   >
                     {isConfirmingReceipt && (
                       <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                     )}
                     Confirm Delivery
                   </button>
                 )}
               {hasDelivered && (
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
              {/* Escrow Status Banner for Vendor */}
              {!isDispatched && !isCompletedOrDelivered && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs mb-3 shadow-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                      Paid & Confirmed
                    </span>
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Escrow Held
                    </span>
                  </div>
                  <p className="text-[11.5px] text-emerald-800/90 font-normal leading-relaxed">
                    Payment is held in escrow. Package the order and mark as out for delivery when dispatched.
                  </p>
                </div>
              )}

              {isDispatched && !isCompletedOrDelivered && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50/50 border border-purple-200/90 text-purple-900 text-xs mb-3 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-purple-900">
                    <Truck size={16} className="text-purple-600 shrink-0" />
                    <span>{payload.delivery_type === "pickup" ? "Ready for Pickup" : "Out for Delivery"}</span>
                  </div>
                  <p className="text-[11.5px] text-purple-800 font-normal leading-relaxed">
                    Pending customer confirmation. Funds release automatically once confirmed or after 72 hours.
                  </p>
                </div>
              )}

              {isCompletedOrDelivered && (
                <div className="p-3 rounded-2xl bg-green-50 border border-green-200 text-green-900 text-xs font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span>Order Completed & Funds Released</span>
                </div>
              )}

              {/* Primary Dispatch Action Button */}
              {!isDispatched && !isCompletedOrDelivered && (
                <button
                  onClick={() =>
                    handleDispatchUpdate(
                      payload.delivery_type === "pickup"
                        ? "Ready for pickup"
                        : "Out for delivery"
                    )
                  }
                  disabled={isUpdatingDispatch}
                  className="w-full py-2.5 mb-2 rounded-xl bg-lily hover:bg-darklily text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
                >
                  {isUpdatingDispatch ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Truck size={15} />
                  )}
                  <span>
                    {payload.delivery_type === "pickup"
                      ? "Mark Ready for Pickup"
                      : "Mark as Out for Delivery"}
                  </span>
                </button>
              )}

              {/* Direct Link to Orders Dashboard */}
              <Link
                to={vendorOrderUrl}
                className="w-full py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <ExternalLink size={13} className="text-gray-500" />
                <span>View in Orders Dashboard</span>
              </Link>
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


      </div>
    </div>
  );
};

export const SharedProductCard = ({ product, isMine }) => {
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

export const SharedContentCard = ({ content, isMine }) => {
  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden max-w-[280px] shadow-lg ${isMine ? "bg-pink-50" : "bg-pink-100"}`}
    >
      <div className="relative aspect-square w-full group bg-black">
        {content.is_video ? (
          <video
            src={content.media}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <img
            src={content.media || "/lily-logo.jpg"}
            alt="Shared content"
            className="w-full h-full object-cover"
          />
        )}
        {content.is_video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none">
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
          to="/feed"
          state={{ targetPostId: content.id }}
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingFileId, setEditingFileId] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const menuRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const justSentMessageRef = useRef(false);
  const chatInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetMessageId = searchParams.get("target_message_id");

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;
      const base64Url = token.split(".")[1];
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const pad = base64.length % 4;
      if (pad) {
        if (pad === 1) throw new Error("Invalid base64 length");
        base64 += new Array(5 - pad).join("=");
      }
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.user_id || decoded.id;
    } catch (e) {
      return null;
    }
  };

  const {
    messages: conversation,
    conversations,
    loading,
    sending,
    currentPage,
    nextPage,
  } = useSelector((state) => state.messages);
  const { user_data } = useSelector((state) => state.auth);
  const profile = useSelector((state) => state.profile.data);
  const currentUserId = user_data?.id || user_data?.user?.id || profile?.id || profile?.user?.id || getUserIdFromToken();

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

  const allMessages = useMemo(() => {
    return [...displayMessages, ...pendingMessages];
  }, [displayMessages, pendingMessages]);

  const groupedMessages = useMemo(() => {
    const grouped = [];
    let currentGroup = null;

    const filteredMessages = allMessages.filter(msg => 
      !searchQuery || (msg.content && msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filteredMessages.forEach((msg) => {
      const senderId = msg.sender_id || msg.sender?.id || msg.sender;
      const computedIsMine = Boolean(currentUserId && senderId && String(senderId) === String(currentUserId));
      const isMine = typeof msg.is_me === "boolean" ? (msg.is_me || computedIsMine) : computedIsMine;
      
      // console.log(`[DEBUG CHAT] Message: ${msg.content}, senderId: ${senderId}, currentUserId: ${currentUserId}, is_me API: ${msg.is_me}, computedIsMine: ${computedIsMine}, final isMine: ${isMine}`);
      
      const isStandardMedia = !!msg.media && 
        !msg.product && 
        !msg.shared_content && 
        !(typeof msg.content === 'string' && (msg.content.startsWith('[ORDER_PAYLOAD]:') || msg.content.startsWith('LILY_SHARE:')));

      if (
        currentGroup &&
        currentGroup.isMine === isMine &&
        currentGroup.isStandardMedia &&
        isStandardMedia &&
        Math.abs(new Date(msg.timestamp) - new Date(currentGroup.timestamp)) < 60000
      ) {
        currentGroup.subMessages.push(msg);
        // Ensure content is preserved if one of the grouped messages has text
        if (
          msg.content && 
          msg.content !== "📷 Image" && 
          (!currentGroup.content || currentGroup.content === "📷 Image" || currentGroup.content.trim() === "")
        ) {
          currentGroup.content = msg.content;
        }
      } else {
        if (currentGroup) grouped.push(currentGroup);
        currentGroup = {
          ...msg,
          isMine,
          isStandardMedia,
          subMessages: [msg]
        };
      }
    });
    if (currentGroup) grouped.push(currentGroup);
    return grouped;
  }, [allMessages, currentUserId]);

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
        fetchConversationMessages({ userId: conversationId, page: 1, target_message_id: targetMessageId }),
      ).then(() => {
        // If jumping to a message, wait for render then scroll to it
        if (targetMessageId) {
          setTimeout(() => {
            const targetElement = document.getElementById(`msg-${targetMessageId}`);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        }
      }).catch((error) => {
        console.error("Error fetching conversation messages:", error);
      });

      // Polling for new messages every 25 seconds (disable if viewing targeted history to prevent jump)
      if (!targetMessageId) {
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
    }
  }, [conversationId, targetMessageId, dispatch]);

  //  Auto scroll bottom when new messages come in
  useEffect(() => {
    if (isAtBottomRef.current || justSentMessageRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      justSentMessageRef.current = false;
    }
  }, [displayMessages]);

  // Mark incoming unread messages as read
  useEffect(() => {
    const unreadMessages = allMessages.filter((msg) => {
      const senderId = msg.sender_id || msg.sender?.id || msg.sender;
      const computedIsMine = Boolean(currentUserId && senderId && String(senderId) === String(currentUserId));
      const isMine = typeof msg.is_me === "boolean" ? (msg.is_me || computedIsMine) : computedIsMine;
      return !isMine && msg.read === false && !msg.isOptimistic;
    });

    unreadMessages.forEach((msg) => {
      dispatch(markMessageAsRead(msg.id));
    });
  }, [allMessages, currentUserId, dispatch]);

  //  Load more messages on scroll top
  const handleScroll = () => {
    const container = chatBoxRef.current;
    if (!container) return;
    
    const top = container.scrollTop;
    
    // Track if user is at the bottom (within 100px)
    const isNearBottom = container.scrollHeight - top - container.clientHeight < 100;
    isAtBottomRef.current = isNearBottom;
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
  const handleSend = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    if (editingMessage) {
      try {
        const updatedMsg = await editMessage(editingMessage.id, newMessage);
        setPendingMessages((prev) =>
          prev.map((m) => (m.id === editingMessage.id ? updatedMsg : m))
        );
        toast.success("Message edited");
        dispatch(
          fetchConversationMessages({
            userId: conversationId,
            page: 1,
          })
        );
      } catch (err) {
        toast.error("Failed to edit message");
      }
      setEditingMessage(null);
      setNewMessage("");
      return;
    }

    const currentMessage = newMessage;
    const currentFiles = [...selectedFiles];

    const newPending = [];
    if (currentFiles.length > 0) {
      currentFiles.forEach((f, idx) => {
        newPending.push({
          id: `temp-${Date.now()}-${idx}`,
          content: idx === 0 ? currentMessage : "", // Attach text to first image only
          media: f.url,
          timestamp: new Date().toISOString(),
          is_me: true,
          sender_id: currentUserId,
          isOptimistic: true,
          originalFile: f.file
        });
      });
    } else {
      newPending.push({
        id: `temp-${Date.now()}`,
        content: currentMessage,
        media: null,
        timestamp: new Date().toISOString(),
        is_me: true,
        sender_id: currentUserId,
        isOptimistic: true,
        originalFile: null
      });
    }

    justSentMessageRef.current = true;
    isAtBottomRef.current = true;

    setPendingMessages((prev) => [...prev, ...newPending]);
    setNewMessage("");
    setSelectedFiles([]);
    const replyToId = replyingTo?.id;
    setReplyingTo(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    newPending.forEach((optimisticMsg) => {
      dispatch(sendMessageToUser({ 
        userId: conversationId, 
        content: optimisticMsg.content, 
        media: optimisticMsg.originalFile,
        reply_to_id: replyToId
      }))
        .then(() => {
          setPendingMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        })
        .catch((error) => {
          console.error("Error sending message:", error);
          setPendingMessages((prev) => prev.map((m) => m.id === optimisticMsg.id ? { ...m, hasError: true } : m));
          toast.error("Message not sent. Please check your internet connection.");
        });
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so selecting the same file again triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveEditedImage = (blob) => {
    if (!editingFileId) return;
    
    // Create new file from blob
    const originalFileObj = selectedFiles.find(f => f.id === editingFileId);
    if (!originalFileObj) return;

    const newFile = new File([blob], originalFileObj.file.name, { type: 'image/jpeg' });
    const newUrl = URL.createObjectURL(newFile);

    setSelectedFiles(prev => prev.map(f => {
      if (f.id === editingFileId) {
        return { ...f, file: newFile, url: newUrl };
      }
      return f;
    }));
    
    setEditingFileId(null);
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
          <button className="md:hidden" onClick={() => navigate(-1)}>
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
          {isSearching && (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 mr-2 transition-all">
              <input
                type="text"
                autoFocus
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-32 md:w-48"
              />
              <button onClick={() => { setIsSearching(false); setSearchQuery(""); }}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

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
                    setIsSearching(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-t"
                >
                  Search Chat
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
        {loading && allMessages.length === 0 ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : allMessages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet.</p>
        ) : (
          groupedMessages.map((msg) => {
            const isMine = msg.isMine;

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
                    <OrderMessageCard payload={payload} isMine={isMine} otherUserName={recipientData?.name} />
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
                id={`msg-${msg.id}`}
                className={`flex ${isMine ? "justify-end" : "justify-start"} ${msg.subMessages?.some(m => String(m.id) === targetMessageId) ? "animate-pulse" : ""} group relative items-center gap-2`}
              >

                <div
                  className={`max-w-[85%] sm:max-w-[75%] w-fit p-3 rounded-2xl text-sm break-words transition-colors duration-1000 ${
                    msg.subMessages?.some(m => String(m.id) === targetMessageId)
                      ? "ring-4 ring-yellow-400 ring-opacity-50"
                      : ""
                  } ${
                    isMine
                      ? "bg-[#4eb75e]/30 text-gray-800 rounded-br-none"
                      : "bg-[#FCE4EC] text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.is_system_message && (
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      System Message
                    </p>
                  )}
                  
                  {msg.media && (
                    <div className={`mb-2 overflow-hidden rounded-xl ${msg.subMessages?.length > 1 ? "grid grid-cols-2 gap-1" : ""}`}>
                      {msg.subMessages?.map((subMsg, idx) => (
                        <div key={subMsg.id || idx} className="relative">
                          {subMsg.media.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={subMsg.media} controls className={`${msg.subMessages.length > 1 ? "w-full h-32 object-cover" : "max-w-[220px] sm:max-w-[260px] h-auto max-h-[240px]"} bg-black/5`} />
                          ) : (
                            <img 
                              src={subMsg.media} 
                              alt="Attached media" 
                              className={`${msg.subMessages.length > 1 ? "w-full h-32 object-cover" : "max-w-[220px] sm:max-w-[260px] h-auto max-h-[240px] object-cover"} cursor-pointer hover:opacity-90 transition-opacity bg-black/5`} 
                              onClick={() => setFullScreenImage(subMsg.media)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.reply_to && (
                    <div 
                      onClick={() => {
                        const target = document.getElementById(`msg-${msg.reply_to.id}`);
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          target.classList.add('bg-lily/20', 'transition-colors', 'duration-500');
                          setTimeout(() => {
                            target.classList.remove('bg-lily/20');
                          }, 1500);
                        }
                      }}
                      className="bg-black/10 rounded-lg p-2 mb-2 border-l-4 border-lily/60 cursor-pointer hover:bg-black/20 transition-colors flex gap-2 items-center"
                    >
                      {msg.reply_to.media_url && (
                        <img src={msg.reply_to.media_url} alt="Reply media" className="w-10 h-10 object-cover rounded-md" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block mb-0.5 opacity-80">{msg.reply_to.sender_username || "User"}</span>
                        <span className="text-xs opacity-90 line-clamp-2">{msg.reply_to.content || "📷 Media"}</span>
                      </div>
                    </div>
                  )}

                  {msg.content && msg.content !== "📷 Image" && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-end gap-0.5 mt-1.5 mr-1 relative">
                    <p className="text-[10px] opacity-70 text-right leading-none flex items-center">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {isMine && (
                      <span className="flex items-center justify-center">
                        {msg.hasError ? (
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                        ) : msg.isOptimistic ? (
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                        ) : msg.read ? (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-500" />
                        )}
                      </span>
                    )}
                    
                    {/* 3-Dot Menu inside the bubble */}
                    <div className="relative flex items-center ml-1">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                        className={`${isMine ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-gray-600"} p-0.5 opacity-60 hover:opacity-100 transition-opacity`}
                      >
                        <EllipsisVertical className="w-3 h-3" />
                      </button>
                      {openMenuId === msg.id && (
                        <div className={`absolute ${isMine ? "right-0" : "left-0"} bottom-full mb-1 bg-white border shadow-lg rounded-xl z-10 w-32 py-1 overflow-hidden text-gray-800`}>
                          <button onClick={() => { setReplyingTo(msg); setOpenMenuId(null); setTimeout(() => chatInputRef.current?.focus(), 0); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><Reply className="w-3 h-3"/> Reply</button>
                          {isMine && <button onClick={() => { setEditingMessage(msg); setNewMessage(msg.content || ""); setReplyingTo(null); setOpenMenuId(null); setTimeout(() => chatInputRef.current?.focus(), 0); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><Edit2 className="w-3 h-3"/> Edit</button>}
                          <button onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copied"); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><Copy className="w-3 h-3"/> Copy</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex flex-col bg-white border-t">
        {replyingTo && (
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center relative">
            <div className="flex-1 flex flex-col border-l-4 border-lily pl-3 overflow-hidden">
              <span className="text-xs font-bold text-lily mb-0.5">Replying to {replyingTo.isMine ? "yourself" : recipientData?.name || "User"}</span>
              <span className="text-xs text-gray-600 truncate">{replyingTo.content || "📷 Media"}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600 ml-2 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {editingMessage && (
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center relative">
            <div className="flex-1 flex flex-col border-l-4 border-yellow-400 pl-3 overflow-hidden">
              <span className="text-xs font-bold text-yellow-600 mb-0.5">Editing message</span>
              <span className="text-xs text-gray-600 truncate">{editingMessage.content || "📷 Media"}</span>
            </div>
            <button onClick={() => { setEditingMessage(null); setNewMessage(""); }} className="text-gray-400 hover:text-gray-600 ml-2 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {selectedFiles.length > 0 && (
          <div className="p-3 border-b border-gray-100 flex items-start bg-gray-50 overflow-x-auto gap-3">
            {selectedFiles.map((fileObj) => (
              <div key={fileObj.id} className="relative inline-block shadow-sm rounded-lg shrink-0">
                {fileObj.type?.startsWith('video/') ? (
                  <video src={fileObj.url} className="h-24 w-auto rounded-lg" controls />
                ) : (
                  <img 
                    src={fileObj.url} 
                    alt="Preview" 
                    className="h-24 w-auto rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => setEditingFileId(fileObj.id)}
                  />
                )}
                <button 
                  onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== fileObj.id))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                  title="Remove attachment"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="p-3 flex items-center space-x-2">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*"
          />
          <TextareaAutosize
            minRows={1}
            maxRows={5}
            ref={chatInputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(); 
              }
            }}
            className="flex-1 bg-gray-100 rounded-3xl px-5 py-3 focus:outline-none text-sm border border-transparent focus:border-lily/30 transition-colors resize-none overflow-hidden"
          />

          <div className="flex items-center gap-1 shrink-0 bg-gray-100 rounded-full p-1">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
              onClick={() => fileInputRef.current.click()}
              title="Attach media"
            >
              <Camera className="h-6 w-6" />
            </button>

            <button 
              onClick={handleSend} 
              disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)} 
              className={`p-2 rounded-full transition-colors ${
                sending || (!newMessage.trim() && selectedFiles.length === 0) 
                  ? "bg-transparent" 
                  : "bg-lily hover:bg-lily/90"
              }`}
            >
              <SendHorizontal
                className={`h-5 w-5 ${
                  sending || (!newMessage.trim() && selectedFiles.length === 0) ? "text-gray-400" : "text-white"
                } transition-all`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer Modal */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-black/50 rounded-full z-50"
            onClick={() => setFullScreenImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="w-full h-full flex items-center justify-center overflow-hidden">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit
              doubleClick={{ mode: "zoomIn" }}
            >
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <img 
                  src={fullScreenImage} 
                  alt="Enlarged view" 
                  className="w-full max-w-[100vw] max-h-[100vh] object-contain cursor-grab active:cursor-grabbing" 
                  draggable={false}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}

      {/* Drawing Editor Modal */}
      {editingFileId && (
        <ImageEditor 
          imageUrl={selectedFiles.find(f => f.id === editingFileId)?.url}
          onSave={handleSaveEditedImage}
          onCancel={() => setEditingFileId(null)}
        />
      )}

    </div>
  </div>
  );
};

export default ChatPage;
