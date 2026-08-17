import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  CheckCircle,
  MessageCircle,
  ShoppingBag,
  Home,
  Shield,
  MapPin,
  CreditCard,
  ChefHat,
} from "lucide-react";
import { fetchCart } from "../redux/cartSlice";
import { usePayment } from "../hooks/usePayment";
import { api } from "../services/api";
import { formatPrice } from "../utils/formatters";
import SEO from "../components/common/SEO";

// Confetti canvas animation component
const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#13ec49", "#111813", "#ffd700", "#ff6b6b", "#4ecdc4", "#4eb75e"];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * 360,
      spin: Math.random() * 4 - 2,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.speed;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const stop = setTimeout(() => cancelAnimationFrame(animId), 3500);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(stop);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.75 }}
    />
  );
};

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { resetPaymentData } = usePayment();

  const state = location.state || {};
  const order = state.order || null;
  const product = state.product || order?.items?.[0]?.product || null;
  const quantity = state.quantity || order?.items?.[0]?.quantity || 1;
  const total = state.total || order?.total_amount || order?.total || 0;
  const paymentMethod = state.paymentMethod || order?.payment_method || "Wallet";

  // Clean up cart & payment state
  useEffect(() => {
    dispatch(fetchCart());
    resetPaymentData();
  }, [dispatch, resetPaymentData]);

  // Send Order Messages to Sellers silently in background
  useEffect(() => {
    if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) return;

    const orderId = order.id || order.reference;
    if (!orderId) return;

    const sentKey = `order_notified_${orderId}`;
    if (localStorage.getItem(sentKey)) return;
    localStorage.setItem(sentKey, "true");

    const notifySellers = async () => {
      try {
        const vendorGroups = {};
        order.items.forEach((item) => {
          const shopId =
            item.product?.shop_id || item.product?.vendor_id || item.product?.id || item.vendor_id;
          if (!vendorGroups[shopId]) vendorGroups[shopId] = [];
          vendorGroups[shopId].push(item);
        });

        for (const [shopId, items] of Object.entries(vendorGroups)) {
          const firstProduct = items[0]?.product || items[0];
          if (!firstProduct?.id && !shopId) continue;

          try {
            const orderPayload = JSON.stringify({
              order_id: orderId,
              reference: order.reference,
              buyer_name: order.buyer_name || order.customer_name || "Customer",
              items: items,
              total: order.total_amount || order.total || total,
              delivery_fee: order.delivery_fee_naira || order.delivery_fee || 0,
              delivery_address: order.delivery_address || order.shipping_address || null,
              delivery_type: order.delivery_type || "delivery",
            });

            const vendorId = firstProduct?.user_id || firstProduct?.vendor_id || shopId;
            if (vendorId) {
              await api.post(`/messages/`, {
                recipient: vendorId,
                content: `[ORDER_PAYLOAD]:${orderPayload}`,
                product_id: firstProduct?.id,
              });
            }
          } catch (err) {
            console.error("Failed to notify vendor", shopId, err);
          }
        }
      } catch (e) {
        console.error("Failed to notify sellers", e);
      }
    };

    notifySellers();
  }, [order, total]);

  // Extract target vendor for Chat button
  const targetVendorId =
    order?.vendor ||
    order?.vendor_id ||
    product?.user_id ||
    product?.vendor_id ||
    product?.shop_id ||
    order?.items?.[0]?.product?.user_id ||
    order?.items?.[0]?.product?.vendor_id ||
    order?.items?.[0]?.product?.shop_id;

  const handleChatWithVendor = () => {
    if (targetVendorId) {
      navigate(`/chat/${targetVendorId}`);
    } else {
      navigate("/inbox");
    }
  };

  const productName = product?.name || order?.items?.[0]?.name || "Food Order";
  const productImage = product?.image_url || product?.media_url || order?.items?.[0]?.image_url;
  const address = order?.delivery_address || order?.shipping_address || state.address;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <SEO
        title="Order Placed Successfully - Lily Shop"
        description="Your food order has been placed successfully."
      />

      <div className="flex flex-col min-h-screen w-full max-w-xl mx-auto bg-[#f6f8f6]">
        <Confetti />

        <main className="flex-1 flex flex-col items-center p-4 sm:p-6 pt-10 relative z-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col items-center"
          >
            {/* Animated Success Badge */}
            <motion.div variants={itemVariants} className="mb-5">
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#13ec49]/10 flex items-center justify-center border-4 border-[#13ec49]"
              >
                <CheckCircle size={48} className="text-[#13ec49]" />
              </motion.div>
            </motion.div>

            {/* Title & Subtitle */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111813] mb-1">
                Order Placed Successfully! 🎉
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Your order is confirmed and being prepared by the vendor.
              </p>
            </motion.div>

            {/* Main Order Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-5 w-full shadow-sm border border-gray-100 mb-4 space-y-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ChefHat className="text-[#13ec49]" size={28} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#111813] text-base truncate">
                    {productName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Quantity: {quantity}</p>
                  <p className="font-extrabold text-[#13ec49] text-base mt-1">
                    ₦{formatPrice(total)}
                  </p>
                </div>
              </div>

              {/* Order Breakdown Details */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-2">
                    <CreditCard size={15} className="text-gray-400" /> Payment Method
                  </span>
                  <span className="font-semibold text-[#111813] capitalize">
                    {paymentMethod === "paystack" ? "Paystack" : "Lily Wallet"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-gray-400" /> Order Status
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#13ec49]/15 text-[#111813]">
                    Confirmed & Paid
                  </span>
                </div>

                {address && (
                  <div className="flex justify-between items-start text-gray-600 pt-1">
                    <span className="flex items-center gap-2 shrink-0">
                      <MapPin size={15} className="text-gray-400" /> Delivery Address
                    </span>
                    <span className="font-semibold text-[#111813] text-right text-xs max-w-[60%] truncate">
                      {address}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Next Steps Banner */}
            <motion.div
              variants={itemVariants}
              className="bg-[#13ec49]/5 border border-[#13ec49]/20 rounded-2xl p-4 w-full mb-6"
            >
              <p className="text-xs font-bold text-[#111813] uppercase tracking-wider mb-2">
                What happens next?
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-[#13ec49] mt-0.5 shrink-0" />
                  <span>The vendor has received your order details and is preparing it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-[#13ec49] mt-0.5 shrink-0" />
                  <span>You can chat directly with the vendor if you have special requests.</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </main>

        {/* Action Buttons */}
        <div className="bg-white border-t border-gray-100 p-4 space-y-3 relative z-20 mt-auto">
          <button
            onClick={handleChatWithVendor}
            className="w-full bg-[#13ec49] text-[#111813] font-bold py-3.5 rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
          >
            <MessageCircle size={18} />
            Chat with Vendor
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-gray-50 text-[#111813] font-bold py-3 rounded-2xl text-xs sm:text-sm border border-gray-200 flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-all"
            >
              <ShoppingBag size={16} />
              View Orders
            </button>

            <button
              onClick={() => navigate("/feed")}
              className="w-full bg-gray-50 text-gray-600 font-bold py-3 rounded-2xl text-xs sm:text-sm border border-gray-200 flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-all"
            >
              <Home size={16} />
              Back to Feed
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
            <Shield size={12} /> Secured by Lily Payments
          </p>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;
