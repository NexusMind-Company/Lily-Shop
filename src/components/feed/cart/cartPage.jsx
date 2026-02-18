import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2, Trash2, Plus, Minus, MapPin, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { selectCartItems } from "../../../redux/cartSlice";
import { createOrder } from "../../../redux/orderSlice";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../../../services/api";
import { usePayment } from "../../../context/paymentContext";
import { formatPrice, formatDate } from "../../../utils/formatters";

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { setPaymentData } = usePayment();
  const allCartItems = useSelector(selectCartItems);

  // Fix state persistence
  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    const locStateIds = location.state?.selectedItemIds;
    if (locStateIds) {
      sessionStorage.setItem("checkout_ids", JSON.stringify(locStateIds));
      return locStateIds;
    }
    try {
      return JSON.parse(sessionStorage.getItem("checkout_ids")) || [];
    } catch {
      return [];
    }
  });

  const { creating: isCreatingOrder, createError } = useSelector((state) => state.orders);

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const itemsToCheckout = useMemo(() => {
    if (selectedItemIds && Array.isArray(selectedItemIds)) {
      if (!allCartItems) return [];
      return allCartItems.filter((item) => selectedItemIds.includes(item.id));
    }
    return [];
  }, [allCartItems, selectedItemIds]);

  const totalDeliveryCharge = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((sum, item) => sum + (item.deliveryCharge || 0), 0);
  }, [itemsToCheckout]);

  const itemCount = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((count, item) => count + item.quantity, 0);
  }, [itemsToCheckout]);

  const subtotal = useMemo(() => {
    if (!Array.isArray(itemsToCheckout)) return 0;
    return itemsToCheckout.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [itemsToCheckout]);

  const estimatedDeliveryTime = useMemo(() => {
    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      return "Calculating...";
    }
    try {
      const allMinTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMinDate || Date.now()).getTime()
      );
      const allMaxTimestamps = itemsToCheckout.map((item) =>
        new Date(item.estimatedDeliveryMaxDate || Date.now()).getTime()
      );
      const validMinTimestamps = allMinTimestamps.filter((ts) => !isNaN(ts));
      const validMaxTimestamps = allMaxTimestamps.filter((ts) => !isNaN(ts));

      if (validMinTimestamps.length === 0 || validMaxTimestamps.length === 0) {
        return "N/A";
      }

      const earliestMinDate = new Date(Math.min(...validMinTimestamps));
      const latestMaxDate = new Date(Math.max(...validMaxTimestamps));
      const formattedMin = formatDate(earliestMinDate);
      const formattedMax = formatDate(latestMaxDate);
      if (!formattedMin || !formattedMax) return "N/A";
      if (formattedMin === formattedMax) return formattedMax;
      return `${formattedMin} - ${formattedMax}`;
    } catch (error) {
      return "N/A";
    }
  }, [itemsToCheckout]);

  const [deliveryAddress, setDeliveryAddress] = useState("Loading address...");
  const [pickupAddressDisplay, setPickupAddressDisplay] = useState("Loading pickup...");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    if (userProfile) {
      setDeliveryAddress(userProfile.deliveryAddress || "No delivery address set");
      setPickupAddressDisplay(userProfile.pickupAddress || "No preferred pickup set");
    } else if (profileError) {
      console.error("Failed to load user profile:", profileError);
      setDeliveryAddress("Error loading address");
      setPickupAddressDisplay("Error loading pickup");
    }
  }, [userProfile, profileError]);

  useEffect(() => {
    if (!isLoadingProfile && (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0)) {
      const timer = setTimeout(() => {
        if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
          navigate("/");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [itemsToCheckout, isLoadingProfile, navigate]);

  const estimatedTotal = subtotal + totalDeliveryCharge - appliedDiscount;
  const backendTotal = subtotal + totalDeliveryCharge;
  const backendTotalKobo = Math.round(backendTotal * 100);

  const handleApplyVoucher = () => {
    if (voucherCode === "SAVE10") {
      setAppliedDiscount(subtotal * 0.1);
      alert("Voucher Applied!");
    } else {
      setAppliedDiscount(0);
      alert("Invalid voucher code");
    }
  };

  const handleProceedToPayment = async () => {
    // Address validation
    if (!deliveryAddress || deliveryAddress === "No delivery address set" || deliveryAddress === "Loading address...") {
      alert("Please add a valid delivery address before proceeding.");
      return;
    }

    if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      console.error("Cannot proceed, no items to checkout.");
      return;
    }

    const orderItems = itemsToCheckout.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    let apiPaymentMethod = "paystack";
    if (paymentMethod === "wallet") {
      apiPaymentMethod = "wallet";
    }

    const orderData = {
      items: orderItems,
      total_amount_kobo: backendTotalKobo,
      payment_method: apiPaymentMethod,
    };

    try {
      const actionResult = await dispatch(createOrder(orderData)).unwrap();
      const newOrder = actionResult;

      setPaymentData({
        amount: estimatedTotal,
        vendorName: itemsToCheckout[0]?.username || "Lily Vendor",
        orderId: newOrder.id,
        amountPaid: 0,
      });

      if (apiPaymentMethod === "wallet") {
        navigate("/password");
      } else {
        if (newOrder.authorization_url) {
          window.location.href = newOrder.authorization_url;
        } else {
          console.warn("No authorization URL returned for Paystack payment");
          navigate("/payment-loading");
        }
      }
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  };

  // Helper function to get product image
  const getProductImage = (item) => {
    // Try multiple possible image fields
    return (
      item.mediaSrc ||
      item.product?.image_url ||
      item.product?.media_url ||
      item.product?.primary_media_url ||
      item.image_url ||
      item.media_url ||
      "/placeholder-image.png"
    );
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
        <Loader2 size={32} className="text-lily-600 animate-spin" />
        <p className="text-gray-500 mt-3">Loading details...</p>
      </div>
    );
  }

  if (!isLoadingProfile && (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0)) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
        <div className="relative p-4 border-b border-gray-200 flex items-center justify-center bg-white/80 backdrop-blur-lg">
          <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2">
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h2 className="font-bold text-lg bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
            Confirm Order
          </h2>
        </div>
        <p className="text-center text-gray-500 mt-8 flex-1 p-4">
          No items selected for checkout, or cart is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h2 className="font-bold text-lg bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
              Confirm Order
            </h2>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Items in Cart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h3 className="font-bold text-lg text-gray-800 mb-4">Items ({itemCount})</h3>
            <div className="space-y-4">
              {itemsToCheckout.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                  {/* Product Image - FIXED */}
                  <img
                    src={getProductImage(item)}
                    alt={item.productName || "Product"}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">{item.username}</p>
                    <p className="font-semibold text-gray-800 truncate">{item.productName}</p>
                    <p className="text-sm font-bold text-lily-600 mt-1">
                      ₦{formatPrice(item.price * item.quantity)}
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
                      <span>Qty: {item.quantity}</span>
                      {item.color && <span>• Color: {item.color}</span>}
                      {item.size && <span>• Size: {item.size}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Address - FIXED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 text-lily-600 mr-2" />
                Delivery Address
              </h3>
            </div>
            
            {deliveryAddress === "No delivery address set" || deliveryAddress === "Loading address..." ? (
              <div className="bg-warning/10 border-2 border-warning/20 rounded-2xl p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-warning">No Address Set</p>
                    <p className="text-sm text-warning/80">Please add a delivery address to continue</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-800">{deliveryAddress}</p>
              </div>
            )}
            
            <button
              onClick={() => navigate("/add-address", { state: { from: location.pathname } })}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-lily-600 font-semibold hover:border-lily-500 hover:bg-lily-50 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Address</span>
            </button>
          </motion.div>

          {/* Delivery Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h3 className="font-bold text-lg text-gray-800 mb-3">Delivery Time</h3>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <p className="font-semibold text-gray-800">
                Estimated: {estimatedDeliveryTime}
              </p>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h3 className="font-bold text-lg text-gray-800 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {["card", "bank", "wallet"].map((method) => (
                <label
                  key={method}
                  className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === method
                      ? "bg-gradient-to-br from-lily-50 to-purple-50 border-2 border-lily-500"
                      : "bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="form-radio text-lily-600 focus:ring-lily-500"
                  />
                  <span className="font-semibold text-gray-800 capitalize">
                    {method === "card" ? "Card (Paystack)" : method === "bank" ? "Bank Transfer" : "Lily Wallet"}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Voucher Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h3 className="font-bold text-lg text-gray-800 mb-4">Voucher Code</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-100 transition-all"
              />
              <button
                onClick={handleApplyVoucher}
                disabled={!voucherCode}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  voucherCode
                    ? "bg-lily-500 text-white hover:bg-lily-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Apply
              </button>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h3 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({itemCount})</span>
                <span className="font-semibold">₦{formatPrice(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-success">-₦{formatPrice(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold">₦{formatPrice(totalDeliveryCharge)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between text-lg pt-2">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                  ₦{formatPrice(estimatedTotal)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Legal Text */}
          <div className="text-xs text-gray-600 space-y-2 px-2">
            <p>
              Your payment is held in escrow until order delivery is confirmed.
            </p>
            <p>
              Orders may be returned within 7 days. By proceeding, you agree to our{" "}
              <a href="#" className="text-lily-600 hover:underline">terms of service</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Fixed Proceed Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-600">Total Payment</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
              ₦{formatPrice(estimatedTotal)}
            </p>
          </div>
          <button
            onClick={handleProceedToPayment}
            disabled={!itemsToCheckout || itemsToCheckout.length === 0 || isCreatingOrder || deliveryAddress === "No delivery address set"}
            className={`px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center space-x-2 ${
              itemsToCheckout && itemsToCheckout.length > 0 && !isCreatingOrder && deliveryAddress !== "No delivery address set"
                ? "bg-gradient-to-r from-lily-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isCreatingOrder ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Proceed</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
